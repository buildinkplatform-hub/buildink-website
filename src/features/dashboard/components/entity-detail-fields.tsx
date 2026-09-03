import {
  marketplaceEntityFields,
  type MarketplaceEntity,
} from "@/shared/marketplace/field-definitions"

function formatFieldValue(
  key: string,
  value: unknown,
  inputType: string,
  data: Record<string, unknown>,
  locale: string,
  currency = "EUR",
): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"

  // Customer-facing detail views must not expose persistence foreign keys.
  // Prefer a display DTO label if the backend supplied one; otherwise render a
  // neutral empty state rather than a UUID.
  if (inputType === "uuid") {
    const stem = key.endsWith("Id") ? key.slice(0, -2) : key
    const candidates = [
      `${stem}Name`,
      `${stem}Label`,
      `${stem}Title`,
      `${stem}Slug`,
    ]
    for (const candidate of candidates) {
      const displayValue = data[candidate]
      if (
        typeof displayValue === "string" &&
        displayValue.trim() &&
        !looksLikeUuid(displayValue)
      ) {
        return displayValue
      }
    }
    return "—"
  }

  if (inputType === "money" && /^-?\d+$/.test(String(value))) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(Number(value) / 100)
  }
  if (inputType === "date" || inputType === "datetime") {
    const date = new Date(String(value))
    if (!Number.isNaN(date.valueOf())) {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        ...(inputType === "datetime" ? { timeStyle: "short" as const } : {}),
      }).format(date)
    }
  }
  if (inputType === "enum") return labelize(String(value))

  if (Array.isArray(value)) {
    const present = value.filter(
      (item) => item !== null && item !== undefined && item !== "",
    )
    return present.length ? present.map(formatCollectionValue).join(", ") : "—"
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    if (!Object.keys(record).length) return "—"
    if ("notes" in record) {
      const notes = record.notes
      return notes === null || notes === undefined || notes === ""
        ? "—"
        : String(notes)
    }
    // Arbitrary persistence JSON is not a customer-facing representation.
    return "—"
  }
  return String(value)
}

function formatCollectionValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    const label = record.name ?? record.label ?? record.title ?? record.slug
    if (label) return String(label)
  }
  return "—"
}

function labelize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase()
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase())
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function fallbackLabel(labelKey: string) {
  const raw = labelKey.split(".").at(-1) ?? labelKey
  return raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase())
}

function resolveLabel(labelKey: string, labels: (key: string) => string) {
  try {
    return labels(labelKey)
  } catch {
    return fallbackLabel(labelKey)
  }
}

export function EntityDetailFields({
  entity,
  data,
  labels,
  locale = "en",
}: {
  entity: MarketplaceEntity
  data: Record<string, unknown>
  labels: (key: string) => string
  locale?: string
}) {
  // The portal DTO decides what the workspace may see: a key the backend did
  // not serialise is never rendered, so the portal can safely render every
  // shared entity field that is actually present in the response.
  const fields = marketplaceEntityFields[entity].filter(
    (field) => field.key in data && field.inputType !== "collection",
  )

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map((field) => (
        <div
          key={field.key}
          className="border-border/90 rounded-xl border bg-slate-50/60 p-4 dark:bg-white/[0.025]"
        >
          <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {resolveLabel(field.labelKey, labels)}
          </dt>
          <dd className="text-brand-navy mt-1.5 text-sm font-semibold break-words">
            {formatFieldValue(
              field.key,
              data[field.key],
              field.inputType,
              data,
              locale,
              typeof data.currency === "string" ? data.currency : "EUR",
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
