"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  PortalFormActions,
  PortalFormSection,
  PortalInlineAlert,
  PortalOptionRow,
} from "@/features/dashboard/components/portal-form-layout"
import {
  createCatalogueAction,
  updateCatalogueItemAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalTaxonomyItem } from "@/features/dashboard/data/portal-client"
import { Link, useRouter } from "@/i18n/navigation"

export interface CatalogueFormInitial {
  id: string
  version?: number
  name: string
  offeringType?: string | null
  description?: string | null
  categoryId?: string | null
  sku?: string | null
  unitOfMeasure?: string | null
  moq?: number | null
  leadTimeDays?: number | null
  priceOnRequest?: boolean
  indicativePriceMinor?: string | null
  currency?: string | null
}

function taxonomyLabel(item: PortalTaxonomyItem) {
  const translations = item.translations
  if (translations && typeof translations === "object") {
    const record = translations as Record<string, { name?: string } | string>
    const en = record.en
    if (typeof en === "string") return en
    if (en && typeof en === "object" && en.name) return en.name
  }
  return item.name ?? item.label ?? item.slug ?? item.id
}

function minorToMajor(value?: string | null) {
  if (value == null || value === "") return ""
  const minor = Number(value)
  if (!Number.isFinite(minor)) return ""
  return (minor / 100).toFixed(2)
}

function majorToMinor(value: string) {
  const normalized = value.trim().replace(",", ".")
  if (!normalized) return null
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) return null
  return String(Math.round(amount * 100))
}

export function CatalogueForm({
  mode,
  companyId,
  categories,
  initial,
}: {
  mode: "create" | "edit"
  companyId: string
  categories: PortalTaxonomyItem[]
  initial?: CatalogueFormInitial
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [name, setName] = useState(initial?.name ?? "")
  const [offeringType, setOfferingType] = useState(
    initial?.offeringType ?? "product",
  )
  const [description, setDescription] = useState(initial?.description ?? "")
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "")
  const [sku, setSku] = useState(initial?.sku ?? "")
  const [unitOfMeasure, setUnitOfMeasure] = useState(
    initial?.unitOfMeasure ?? "",
  )
  const [moq, setMoq] = useState(
    initial?.moq === null || initial?.moq === undefined
      ? ""
      : String(initial.moq),
  )
  const [leadTimeDays, setLeadTimeDays] = useState(
    initial?.leadTimeDays === null || initial?.leadTimeDays === undefined
      ? ""
      : String(initial.leadTimeDays),
  )
  const [priceOnRequest, setPriceOnRequest] = useState(
    initial?.priceOnRequest ?? true,
  )
  const [indicativePrice, setIndicativePrice] = useState(
    minorToMajor(initial?.indicativePriceMinor),
  )
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [failed, setFailed] = useState(false)

  const indicativePriceMinor = majorToMinor(indicativePrice)
  const normalizedCurrency = currency.trim().toUpperCase()
  const priceValid =
    priceOnRequest ||
    (indicativePriceMinor !== null && /^[A-Z]{3}$/.test(normalizedCurrency))
  const offeringTypeValid = mode === "edit" || offeringType.trim().length >= 2
  const saveDisabled =
    pending || name.trim().length < 2 || !offeringTypeValid || !priceValid

  const body = {
    ...(mode === "create"
      ? { offeringType: offeringType.trim() || "product" }
      : {}),
    name: name.trim(),
    description: description.trim() || null,
    categoryId: categoryId || null,
    sku: sku.trim() || null,
    unitOfMeasure: unitOfMeasure.trim() || null,
    moq: moq ? Number(moq) : null,
    leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
    priceOnRequest,
    indicativePriceMinor: priceOnRequest ? null : indicativePriceMinor,
    currency: priceOnRequest ? null : normalizedCurrency,
  }

  function showFailure(nextMessage: string) {
    setFailed(true)
    setMessage(nextMessage)
  }

  async function save() {
    if (saveDisabled) return
    setPending(true)
    setMessage(undefined)
    setFailed(false)
    try {
      if (mode === "edit" && initial) {
        const result = await updateCatalogueItemAction(
          companyId,
          initial.id,
          body,
          initial.version ?? 1,
        )
        if (!result.ok) {
          showFailure(result.message)
          return
        }
        setMessage(t("dashboard.edit.saved"))
        router.refresh()
        return
      }

      const result = await createCatalogueAction(companyId, body, createKey)
      if (!result.ok) {
        showFailure(result.message)
        return
      }
      const created = result.data as { id?: string } | undefined
      router.push(
        created?.id
          ? `/dashboard/catalogue/${created.id}`
          : "/dashboard/catalogue",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5" aria-busy={pending}>
      <PortalFormSection
        title={t("dashboard.publish.catalogueTitle")}
        description={t("dashboard.descriptions.catalogue")}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label={t("dashboard.publish.name")}
            htmlFor="catalogue-name"
            required
          >
            <Input
              id="catalogue-name"
              value={name}
              disabled={pending}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          {mode === "create" ? (
            <Field
              label={t("dashboard.fields.offeringType")}
              htmlFor="catalogue-offering-type"
              required
            >
              <Input
                id="catalogue-offering-type"
                value={offeringType}
                disabled={pending}
                onChange={(event) => setOfferingType(event.target.value)}
              />
            </Field>
          ) : null}
          <Field
            label={t("dashboard.publish.category")}
            htmlFor="catalogue-category"
          >
            <Select
              value={categoryId}
              disabled={pending}
              onValueChange={setCategoryId}
            >
              <SelectTrigger id="catalogue-category">
                <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {taxonomyLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("dashboard.publish.sku")} htmlFor="catalogue-sku">
            <Input
              id="catalogue-sku"
              value={sku}
              disabled={pending}
              onChange={(event) => setSku(event.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field
              label={t("dashboard.publish.description")}
              htmlFor="catalogue-description"
            >
              <Textarea
                id="catalogue-description"
                rows={5}
                value={description}
                disabled={pending}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          </div>
        </div>
      </PortalFormSection>

      <PortalFormSection
        title={t("dashboard.publish.unitOfMeasure")}
        description={t("dashboard.descriptions.catalogue")}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label={t("dashboard.publish.unitOfMeasure")}
            htmlFor="catalogue-uom"
          >
            <Input
              id="catalogue-uom"
              value={unitOfMeasure}
              disabled={pending}
              onChange={(event) => setUnitOfMeasure(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.publish.moq")} htmlFor="catalogue-moq">
            <Input
              id="catalogue-moq"
              type="number"
              inputMode="numeric"
              min={0}
              value={moq}
              disabled={pending}
              onChange={(event) => setMoq(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.leadTimeDays")}
            htmlFor="catalogue-lead-time"
          >
            <Input
              id="catalogue-lead-time"
              type="number"
              inputMode="numeric"
              min={0}
              value={leadTimeDays}
              disabled={pending}
              onChange={(event) => setLeadTimeDays(event.target.value)}
            />
          </Field>
        </div>
      </PortalFormSection>

      <PortalFormSection
        title={t("dashboard.fields.indicativePrice")}
        description={t("dashboard.publish.priceOnRequest")}
      >
        <PortalOptionRow>
          <label className="flex min-h-6 flex-1 items-center gap-3 text-sm font-medium">
            <Checkbox
              checked={priceOnRequest}
              disabled={pending}
              onChange={(event) => setPriceOnRequest(event.target.checked)}
            />
            {t("dashboard.publish.priceOnRequest")}
          </label>
        </PortalOptionRow>
        {!priceOnRequest ? (
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Field
              label={t("dashboard.fields.indicativePrice")}
              htmlFor="catalogue-indicative-price"
              required
              error={
                !priceValid ? t("dashboard.fields.indicativePrice") : undefined
              }
            >
              <Input
                id="catalogue-indicative-price"
                inputMode="decimal"
                value={indicativePrice}
                disabled={pending}
                onChange={(event) => setIndicativePrice(event.target.value)}
                aria-invalid={!priceValid}
              />
            </Field>
            <Field
              label={t("dashboard.fields.currency")}
              htmlFor="catalogue-currency"
              required
            >
              <Input
                id="catalogue-currency"
                maxLength={3}
                value={currency}
                disabled={pending}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
                aria-invalid={!/^[A-Z]{3}$/.test(normalizedCurrency)}
              />
            </Field>
          </div>
        ) : null}
      </PortalFormSection>

      {message ? (
        <PortalInlineAlert tone={failed ? "error" : "success"}>
          {message}
        </PortalInlineAlert>
      ) : null}

      <PortalFormActions hint={t("dashboard.descriptions.catalogue")}>
        <Button type="button" variant="secondary" asChild disabled={pending}>
          <Link
            href={
              initial?.id
                ? `/dashboard/catalogue/${initial.id}`
                : "/dashboard/catalogue"
            }
          >
            {t("common.cancel")}
          </Link>
        </Button>
        <Button
          type="button"
          disabled={saveDisabled}
          onClick={() => void save()}
        >
          {mode === "edit"
            ? t("dashboard.edit.save")
            : t("dashboard.publish.catalogueTitle")}
        </Button>
      </PortalFormActions>
    </div>
  )
}
