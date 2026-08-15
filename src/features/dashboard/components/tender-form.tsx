"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { CityLocationField } from "@/components/forms/city-location-field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  createTenderAction,
  updateEntityAction,
} from "@/features/dashboard/actions/portal.actions"
import { portalDetailPath } from "@/features/dashboard/config/portal-routes"
import type {
  PortalTender,
  PortalTenderCriterion,
  PortalTenderLot,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"
import {
  datetimeInputValue,
  eurosToMinor,
  jsonNotes,
  minorToEuros,
  notesRecord,
  toIsoDateTime,
} from "@/features/dashboard/lib/marketplace-money"
import { Link, useRouter } from "@/i18n/navigation"
import { tenderWebsiteSchema } from "@/shared/marketplace/portal-form-schemas"

const criterionKinds = ["COMPLIANCE", "TECHNICAL", "COMMERCIAL"] as const
const procurementMethods = ["OPEN", "SELECTIVE", "LIMITED", "DIRECT"] as const

type TenderDetail = PortalTender & {
  lots?: PortalTenderLot[]
  criteria?: PortalTenderCriterion[]
}

export function TenderForm({
  mode,
  tender,
  companyId,
  isProjectOwner,
  categories,
}: {
  mode: "create" | "edit"
  tender?: TenderDetail
  companyId?: string
  isProjectOwner: boolean
  categories: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [title, setTitle] = useState(tender?.title ?? "")
  const [description, setDescription] = useState(tender?.description ?? "")
  const [sourceKind, setSourceKind] = useState<"BUILDINK" | "EXTERNAL_OFFICIAL">(
    (tender?.sourceKind as "BUILDINK" | "EXTERNAL_OFFICIAL") ?? "BUILDINK",
  )
  const [visibility, setVisibility] = useState<"PUBLIC" | "INVITED">(
    (tender?.visibility as "PUBLIC" | "INVITED") ?? "PUBLIC",
  )
  const [sourceUrl, setSourceUrl] = useState(tender?.sourceUrl ?? "")
  const [sourceAuthority, setSourceAuthority] = useState(
    tender?.sourceAuthority ?? "",
  )
  const [noticeType, setNoticeType] = useState(tender?.noticeType ?? "")
  const [cityId, setCityId] = useState(tender?.cityId ?? "")
  const [categoryId, setCategoryId] = useState(tender?.categoryId ?? "")
  const [deadlineAt, setDeadlineAt] = useState(
    datetimeInputValue(tender?.submissionDeadlineAt),
  )
  const [inquiryDeadlineAt, setInquiryDeadlineAt] = useState(
    datetimeInputValue(tender?.inquiryDeadlineAt),
  )
  const [evaluationAt, setEvaluationAt] = useState(
    datetimeInputValue(tender?.evaluationAt),
  )
  const [awardAt, setAwardAt] = useState(datetimeInputValue(tender?.awardAt))
  const [procurementMethod, setProcurementMethod] = useState(
    tender?.procurementMethod ?? "",
  )
  const [value, setValue] = useState(minorToEuros(tender?.valueMinor))
  const [submissionMethod, setSubmissionMethod] = useState(
    tender?.submissionMethod ?? "",
  )
  const [eligibility, setEligibility] = useState(jsonNotes(tender?.eligibility))
  const [awardCriteriaNotes, setAwardCriteriaNotes] = useState(
    jsonNotes(tender?.awardCriteria),
  )
  const [lots, setLots] = useState(
    tender?.lots?.length
      ? tender.lots.map((lot) => ({
          title: lot.title,
          reference: lot.reference,
          description: lot.description ?? "",
          budget: minorToEuros(lot.valueMinor),
        }))
      : [{ title: "", reference: "", description: "", budget: "" }],
  )
  const [criteria, setCriteria] = useState(
    tender?.criteria?.length
      ? tender.criteria.map((item) => ({
          label: item.label,
          kind: item.kind,
          weight: String(item.weight),
          required: item.required,
        }))
      : [
          {
            label: "",
            kind: "COMPLIANCE" as const,
            weight: "0",
            required: true,
          },
        ],
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const external = sourceKind === "EXTERNAL_OFFICIAL"

  function body(publish = false) {
    return {
      title,
      description,
      sourceKind,
      submissionChannel: external ? "EXTERNAL_REDIRECT" : "BUILDINK_OFFER",
      sourceUrl: external ? sourceUrl || null : null,
      sourceAuthority: sourceAuthority.trim() || null,
      visibility: external ? "PUBLIC" : visibility,
      noticeType: noticeType || null,
      cityId: cityId || null,
      categoryId: categoryId || null,
      submissionDeadlineAt: deadlineAt ? toIsoDateTime(deadlineAt) : undefined,
      inquiryDeadlineAt: inquiryDeadlineAt
        ? toIsoDateTime(inquiryDeadlineAt)
        : null,
      evaluationAt: evaluationAt ? toIsoDateTime(evaluationAt) : null,
      awardAt: awardAt ? toIsoDateTime(awardAt) : null,
      procurementMethod: procurementMethod || null,
      valueMinor: value ? eurosToMinor(value) || null : null,
      submissionMethod: submissionMethod.trim() || null,
      eligibility: notesRecord(eligibility),
      awardCriteria: notesRecord(awardCriteriaNotes),
      currency: tender?.currency ?? "EUR",
      lots: lots
        .filter((lot) => lot.title.trim().length >= 2)
        .map((lot) => ({
          title: lot.title.trim(),
          reference: lot.reference.trim() || null,
          description: lot.description.trim() || null,
          valueMinor: lot.budget ? eurosToMinor(lot.budget) || null : null,
          currency: tender?.currency ?? "EUR",
        })),
      criteria: criteria
        .filter((item) => item.label.trim().length >= 2)
        .map((item, index) => ({
          label: item.label.trim(),
          kind: item.kind,
          weight: item.kind === "COMPLIANCE" ? 0 : Number(item.weight) || 0,
          required: item.required,
          sortOrder: index,
        })),
      publish,
    }
  }

  async function save(publish: boolean) {
    const parsed = tenderWebsiteSchema.safeParse(body(publish))
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message)
      return
    }
    setPending(true)
    setMessage(undefined)
    const result =
      mode === "edit" && tender?.version
        ? await updateEntityAction("tender", tender.id, parsed.data, tender.version)
        : await createTenderAction(
            parsed.data,
            createKey,
            isProjectOwner ? undefined : companyId,
          )
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const created =
      "data" in result ? (result.data as { id?: string } | undefined) : undefined
    const id = tender?.id ?? created?.id
    if (id) router.push(portalDetailPath("tenders", id))
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <Field label={t("dashboard.publish.source")} htmlFor="tender-source" required>
          <Select
            value={sourceKind}
            onValueChange={(value) =>
              setSourceKind(value as typeof sourceKind)
            }
          >
            <SelectTrigger id="tender-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUILDINK">
                {t("dashboard.publish.buildinkTender")}
              </SelectItem>
              <SelectItem value="EXTERNAL_OFFICIAL">
                {t("dashboard.publish.externalTender")}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("dashboard.publish.title")} htmlFor="tender-title" required>
          <Input
            id="tender-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.description")}
          htmlFor="tender-description"
          required
        >
          <Textarea
            id="tender-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label={t("dashboard.publish.noticeType")} htmlFor="tender-notice">
          <Input
            id="tender-notice"
            value={noticeType}
            onChange={(event) => setNoticeType(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.fields.sourceAuthority")}
          htmlFor="tender-authority"
        >
          <Input
            id="tender-authority"
            value={sourceAuthority}
            onChange={(event) => setSourceAuthority(event.target.value)}
          />
        </Field>
        {external ? (
          <Field
            label={t("dashboard.publish.sourceUrl")}
            htmlFor="tender-url"
            required
          >
            <Input
              id="tender-url"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
            />
          </Field>
        ) : (
          <Field
            label={t("dashboard.bidding.visibility")}
            htmlFor="tender-visibility"
          >
            <select
              id="tender-visibility"
              className="border-line h-11 w-full rounded-xl border bg-white px-3 text-sm"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as typeof visibility)
              }
            >
              <option value="PUBLIC">
                {t("dashboard.bidding.visibilityPublic")}
              </option>
              <option value="INVITED">
                {t("dashboard.bidding.visibilityInvited")}
              </option>
            </select>
          </Field>
        )}
        <Field label={t("dashboard.publish.location")} htmlFor="tender-city">
          <CityLocationField
            cityId={cityId || undefined}
            onChange={setCityId}
          />
        </Field>
        {categories.length ? (
          <Field label={t("dashboard.publish.category")} htmlFor="tender-category">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="tender-category">
                <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name ?? item.label ?? item.slug ?? item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("dashboard.publish.deadline")}
            htmlFor="tender-deadline"
            required
          >
            <Input
              id="tender-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.fields.inquiryDeadline")}
            htmlFor="tender-inquiry"
          >
            <Input
              id="tender-inquiry"
              type="datetime-local"
              value={inquiryDeadlineAt}
              onChange={(event) => setInquiryDeadlineAt(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.fields.evaluationAt")}
            htmlFor="tender-eval"
          >
            <Input
              id="tender-eval"
              type="datetime-local"
              value={evaluationAt}
              onChange={(event) => setEvaluationAt(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.fields.awardAt")} htmlFor="tender-award">
            <Input
              id="tender-award"
              type="datetime-local"
              value={awardAt}
              onChange={(event) => setAwardAt(event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("dashboard.fields.procurementMethod")}
            htmlFor="tender-method"
          >
            <Select
              value={procurementMethod}
              onValueChange={setProcurementMethod}
            >
              <SelectTrigger id="tender-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {procurementMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t(`dashboard.publish.procurement.${method}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("dashboard.fields.value")} htmlFor="tender-value">
            <Input
              id="tender-value"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </Field>
        </div>
        <Field
          label={t("dashboard.fields.submissionMethod")}
          htmlFor="tender-submission-method"
        >
          <Input
            id="tender-submission-method"
            value={submissionMethod}
            onChange={(event) => setSubmissionMethod(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.fields.eligibility")}
          htmlFor="tender-eligibility"
        >
          <Textarea
            id="tender-eligibility"
            value={eligibility}
            onChange={(event) => setEligibility(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.fields.awardCriteria")}
          htmlFor="tender-award-criteria"
        >
          <Textarea
            id="tender-award-criteria"
            value={awardCriteriaNotes}
            onChange={(event) => setAwardCriteriaNotes(event.target.value)}
          />
        </Field>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("dashboard.publish.lotsTitle")}</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setLots((current) => [
                  ...current,
                  { title: "", reference: "", description: "", budget: "" },
                ])
              }
            >
              {t("dashboard.publish.addLot")}
            </Button>
          </div>
          {lots.map((lot, index) => (
            <div key={index} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2">
              <Input
                placeholder={t("dashboard.publish.lotTitle")}
                value={lot.title}
                onChange={(event) =>
                  setLots((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, title: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Input
                placeholder={t("dashboard.publish.lotReference")}
                value={lot.reference}
                onChange={(event) =>
                  setLots((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, reference: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Input
                placeholder={t("dashboard.publish.lotValue")}
                value={lot.budget}
                onChange={(event) =>
                  setLots((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, budget: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setLots((current) =>
                    current.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              >
                {t("common.remove")}
              </Button>
            </div>
          ))}
        </section>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("dashboard.publish.criteriaTitle")}</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setCriteria((current) => [
                  ...current,
                  {
                    label: "",
                    kind: "COMPLIANCE",
                    weight: "0",
                    required: true,
                  },
                ])
              }
            >
              {t("dashboard.publish.addCriterion")}
            </Button>
          </div>
          {criteria.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2">
              <Input
                placeholder={t("dashboard.publish.criterionLabel")}
                value={item.label}
                onChange={(event) =>
                  setCriteria((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, label: event.target.value }
                        : row,
                    ),
                  )
                }
              />
              <Select
                value={item.kind}
                onValueChange={(kind) =>
                  setCriteria((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, kind: kind as typeof row.kind }
                        : row,
                    ),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criterionKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {t(`dashboard.publish.criteria.${kind}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {item.kind !== "COMPLIANCE" ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.weight}
                  onChange={(event) =>
                    setCriteria((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, weight: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={item.required}
                  onChange={(event) =>
                    setCriteria((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, required: event.target.checked }
                          : row,
                      ),
                    )
                  }
                />
                {t("dashboard.publish.criterionRequired")}
              </label>
            </div>
          ))}
        </section>
      </Card>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !title || !description || !deadlineAt}
          onClick={() => void save(false)}
        >
          {mode === "edit"
            ? t("dashboard.edit.save")
            : t("dashboard.publish.saveDraft")}
        </Button>
        {mode === "create" ? (
          <>
            <Button
              type="button"
              disabled={pending || !title || !description || !deadlineAt}
              onClick={() => setConfirmOpen(true)}
            >
              {t("dashboard.publish.publish")}
            </Button>
            <ConfirmationDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={t("dashboard.publish.publish")}
              description={t("dashboard.publish.confirmTender")}
              confirmLabel={t("dashboard.publish.publish")}
              cancelLabel={t("common.cancel")}
              pending={pending}
              onConfirm={() => void save(true)}
            />
          </>
        ) : null}
        <Button type="button" variant="secondary" asChild>
          <Link
            href={
              tender
                ? portalDetailPath("tenders", tender.id)
                : "/dashboard/tenders"
            }
          >
            {t("common.cancel")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
