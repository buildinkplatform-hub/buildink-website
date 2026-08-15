import {
  marketplaceEntityFields,
  type MarketplaceEntity,
} from "@/shared/marketplace/field-definitions"

function formatFieldValue(
  value: unknown,
  inputType: string,
  locale: string,
  currency = "EUR",
): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (inputType === "money" && /^\d+$/.test(String(value))) {
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
  if (typeof value === "object") {
    if (value && "notes" in value) {
      return String((value as { notes?: unknown }).notes ?? "—")
    }
    return JSON.stringify(value)
  }
  return String(value)
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
    <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <div
          key={field.key}
          className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
        >
          <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
            {resolveLabel(field.labelKey, labels)}
          </dt>
          <dd className="text-brand-navy mt-1 text-sm font-medium break-words">
            {formatFieldValue(
              data[field.key],
              field.inputType,
              locale,
              typeof data.currency === "string" ? data.currency : "EUR",
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
