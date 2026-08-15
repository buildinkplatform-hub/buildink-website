"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { CityLocationField } from "@/components/forms/city-location-field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { AttachmentUpload } from "@/features/dashboard/components/attachment-upload"
import {
  createOpportunityAction,
  updateEntityAction,
} from "@/features/dashboard/actions/portal.actions"
import { portalDetailPath } from "@/features/dashboard/config/portal-routes"
import type {
  PortalOpportunity,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"
import {
  datetimeInputValue,
  eurosToMinor,
  jsonNotes,
  minorToEuros,
  toIsoDateTime,
} from "@/features/dashboard/lib/marketplace-money"
import {
  opportunityKinds,
  type OpportunityKind,
} from "@/features/dashboard/lib/portal-permissions"
import { Link, useRouter } from "@/i18n/navigation"
import { opportunityWebsiteSchema } from "@/shared/marketplace/portal-form-schemas"

const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "TEMPORARY",
  "CONTRACT",
  "SEASONAL",
  "APPRENTICE",
  "DAY_LABOUR",
] as const
const workArrangements = ["ON_SITE", "HYBRID", "REMOTE", "MOBILE"] as const

function specText(value: unknown) {
  if (typeof value === "string") return value
  return jsonNotes(value)
}

export function OpportunityForm({
  mode,
  opportunity,
  categories,
  professions,
  companyId,
  isProjectOwner,
  allowedKinds,
}: {
  mode: "create" | "edit"
  opportunity?: PortalOpportunity
  categories: PortalTaxonomyItem[]
  professions: PortalTaxonomyItem[]
  companyId?: string
  isProjectOwner: boolean
  allowedKinds: readonly OpportunityKind[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const kinds = useMemo(() => {
    const permitted = allowedKinds.length ? [...allowedKinds] : [...opportunityKinds]
    const current = opportunity?.kind as OpportunityKind | undefined
    if (current && !permitted.includes(current)) permitted.unshift(current)
    return permitted
  }, [allowedKinds, opportunity?.kind])
  const [kind, setKind] = useState<OpportunityKind>(
    (opportunity?.kind as OpportunityKind) ??
      kinds[0] ??
      "SUBCONTRACT_WORK",
  )
  const [title, setTitle] = useState(opportunity?.title ?? "")
  const [summary, setSummary] = useState(opportunity?.summary ?? "")
  const [description, setDescription] = useState(opportunity?.description ?? "")
  const [categoryId, setCategoryId] = useState(opportunity?.categoryId ?? "")
  const [professionId, setProfessionId] = useState(
    opportunity?.professionId ?? "",
  )
  const [cityId, setCityId] = useState(opportunity?.cityId ?? "")
  const [deadlineAt, setDeadlineAt] = useState(
    datetimeInputValue(opportunity?.deadlineAt),
  )
  const [budgetMin, setBudgetMin] = useState(
    minorToEuros(opportunity?.budgetMinMinor),
  )
  const [budgetMax, setBudgetMax] = useState(
    minorToEuros(opportunity?.budgetMaxMinor),
  )
  const [durationDays, setDurationDays] = useState(
    opportunity?.durationDays ? String(opportunity.durationDays) : "",
  )
  const [quantity, setQuantity] = useState(opportunity?.quantity ?? "")
  const [unit, setUnit] = useState(opportunity?.unit ?? "")
  const [workersNeeded, setWorkersNeeded] = useState(
    opportunity?.workersNeeded ? String(opportunity.workersNeeded) : "1",
  )
  const [employmentType, setEmploymentType] = useState(
    opportunity?.employmentType ?? "",
  )
  const [workArrangement, setWorkArrangement] = useState(
    opportunity?.workArrangement ?? "",
  )
  const [spec, setSpec] = useState(
    specText(
      opportunity?.materialSpecifications ??
        opportunity?.equipmentSpecifications,
    ),
  )
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function body(publish = false) {
    return {
      kind,
      title,
      summary: summary.trim() || null,
      description,
      categoryId: categoryId || null,
      professionId: professionId || null,
      cityId: cityId || null,
      deadlineAt: deadlineAt ? toIsoDateTime(deadlineAt) : null,
      budgetMinMinor:
        kind === "WORKFORCE_REQUEST" ? null : eurosToMinor(budgetMin) || null,
      budgetMaxMinor:
        kind === "WORKFORCE_REQUEST" ? null : eurosToMinor(budgetMax) || null,
      currency: opportunity?.currency ?? "EUR",
      durationDays: durationDays ? Number(durationDays) : null,
      quantity: quantity ? Number(quantity) : null,
      unit: unit || null,
      workersNeeded:
        kind === "WORKFORCE_REQUEST" ? Number(workersNeeded) || 1 : null,
      employmentType:
        kind === "WORKFORCE_REQUEST" ? employmentType || null : null,
      workArrangement:
        kind === "WORKFORCE_REQUEST" ? workArrangement || null : null,
      materialSpecifications: kind === "MATERIAL_SUPPLY" ? spec || null : null,
      equipmentSpecifications:
        kind === "EQUIPMENT_REQUEST" ? spec || null : null,
      attachmentAssetIds: attachments.map((item) => item.id),
      publish,
      ...(isProjectOwner ? {} : { companyId }),
    }
  }

  async function save(publish: boolean) {
    const parsed = opportunityWebsiteSchema.safeParse(body(publish))
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message)
      return
    }
    setPending(true)
    setMessage(undefined)
    const result =
      mode === "edit" && opportunity?.version
        ? await updateEntityAction(
            "opportunity",
            opportunity.id,
            parsed.data,
            opportunity.version,
          )
        : await createOpportunityAction(
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
    const id = opportunity?.id ?? created?.id
    if (id) router.push(portalDetailPath("opportunities", id))
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <Field label={t("dashboard.publish.kind")} htmlFor="opp-kind" required>
          <Select
            value={kind}
            onValueChange={(value) => setKind(value as OpportunityKind)}
          >
            <SelectTrigger id="opp-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`dashboard.kinds.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("dashboard.publish.title")} htmlFor="opp-title" required>
          <Input
            id="opp-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label={t("dashboard.fields.summary")} htmlFor="opp-summary">
          <Textarea
            id="opp-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.description")}
          htmlFor="opp-description"
          required
        >
          <Textarea
            id="opp-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        {kind === "WORKFORCE_REQUEST" ? (
          <>
            <Field
              label={t("dashboard.persona.profession")}
              htmlFor="opp-profession"
            >
              <Select value={professionId} onValueChange={setProfessionId}>
                <SelectTrigger id="opp-profession">
                  <SelectValue
                    placeholder={t("dashboard.create.chooseTarget")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name ?? item.label ?? item.slug ?? item.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label={t("dashboard.publish.workersNeeded")}
              htmlFor="opp-workers"
            >
              <Input
                id="opp-workers"
                inputMode="numeric"
                value={workersNeeded}
                onChange={(event) => setWorkersNeeded(event.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("dashboard.fields.employmentType")}
                htmlFor="opp-employment"
              >
                <Select
                  value={employmentType}
                  onValueChange={setEmploymentType}
                >
                  <SelectTrigger id="opp-employment">
                    <SelectValue
                      placeholder={t("dashboard.create.chooseTarget")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`dashboard.persona.employmentTypeValues.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label={t("dashboard.fields.workArrangement")}
                htmlFor="opp-arrangement"
              >
                <Select
                  value={workArrangement}
                  onValueChange={setWorkArrangement}
                >
                  <SelectTrigger id="opp-arrangement">
                    <SelectValue
                      placeholder={t("dashboard.create.chooseTarget")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {workArrangements.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`dashboard.persona.workArrangementValues.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </>
        ) : (
          <Field label={t("dashboard.publish.category")} htmlFor="opp-category">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="opp-category">
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
        )}
        {kind === "MATERIAL_SUPPLY" ? (
          <>
            <Field label={t("dashboard.publish.quantity")} htmlFor="opp-qty">
              <Input
                id="opp-qty"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </Field>
            <Field label={t("dashboard.publish.unit")} htmlFor="opp-unit">
              <Input
                id="opp-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.specifications")}
              htmlFor="opp-spec"
            >
              <Textarea
                id="opp-spec"
                value={spec}
                onChange={(event) => setSpec(event.target.value)}
              />
            </Field>
          </>
        ) : null}
        {kind === "EQUIPMENT_REQUEST" ? (
          <>
            <Field
              label={t("dashboard.create.duration")}
              htmlFor="opp-duration"
            >
              <Input
                id="opp-duration"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.specifications")}
              htmlFor="opp-equip-spec"
            >
              <Textarea
                id="opp-equip-spec"
                value={spec}
                onChange={(event) => setSpec(event.target.value)}
              />
            </Field>
          </>
        ) : null}
        {kind === "SUBCONTRACT_WORK" || kind === "PROFESSIONAL_SERVICE" ? (
          <Field label={t("dashboard.create.duration")} htmlFor="opp-days">
            <Input
              id="opp-days"
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label={t("dashboard.publish.location")} htmlFor="opp-location">
          <CityLocationField
            cityId={cityId || undefined}
            onChange={setCityId}
          />
        </Field>
        <Field label={t("dashboard.publish.deadline")} htmlFor="opp-deadline">
          <Input
            id="opp-deadline"
            type="datetime-local"
            value={deadlineAt}
            onChange={(event) => setDeadlineAt(event.target.value)}
          />
        </Field>
        {kind === "WORKFORCE_REQUEST" ? null : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("dashboard.fields.budgetMin")}
              htmlFor="opp-budget-min"
            >
              <Input
                id="opp-budget-min"
                value={budgetMin}
                onChange={(event) => setBudgetMin(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.fields.budgetMax")}
              htmlFor="opp-budget-max"
            >
              <Input
                id="opp-budget-max"
                value={budgetMax}
                onChange={(event) => setBudgetMax(event.target.value)}
              />
            </Field>
          </div>
        )}
        <AttachmentUpload assets={attachments} onChange={setAttachments} />
      </Card>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !title || !description}
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
              disabled={pending || !title || !description}
              onClick={() => setConfirmOpen(true)}
            >
              {t("dashboard.publish.publish")}
            </Button>
            <ConfirmationDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={t("dashboard.publish.publish")}
              description={t("dashboard.publish.confirmOpportunity")}
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
              opportunity
                ? portalDetailPath("opportunities", opportunity.id)
                : "/dashboard/opportunities"
            }
          >
            {t("common.cancel")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
