"use client"

import { useMemo, useState } from "react"
import { useRouter } from "@/i18n/navigation"
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
import { AttachmentUpload } from "@/features/dashboard/components/attachment-upload"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { CityLocationField } from "@/components/forms/city-location-field"
import { Card } from "@/components/ui/card"
import {
  createCatalogueAction,
  createEquipmentAction,
  createOpportunityAction,
  createProjectAction,
  createTenderAction,
  publishEquipmentAction,
  publishOpportunityAction,
  publishProjectAction,
  publishTenderAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalTaxonomyItem } from "@/features/dashboard/data/portal-client"
import {
  opportunityKinds,
  type OpportunityKind,
} from "@/features/dashboard/lib/portal-permissions"

function eurosToMinor(value: string) {
  const amount = Number(value.replace(",", "."))
  if (!Number.isFinite(amount) || amount < 0) return ""
  return String(Math.round(amount * 100))
}

function labelOf(item: PortalTaxonomyItem) {
  const translations = item.translations
  if (translations && typeof translations === "object") {
    const record = translations as Record<string, { name?: string } | string>
    const en = record.en
    if (typeof en === "string") return en
    if (en && typeof en === "object" && en.name) return en.name
  }
  return item.name ?? item.label ?? item.slug ?? item.id
}

export function ProjectCreateForm({
  categories,
  tags,
  companyId,
  profileId,
  isProjectOwner,
}: {
  categories: PortalTaxonomyItem[]
  tags: PortalTaxonomyItem[]
  cities?: PortalTaxonomyItem[]
  companyId?: string
  profileId: string
  isProjectOwner: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [cityId, setCityId] = useState("")
  const [countryCode, setCountryCode] = useState("IT")
  const [addressLine1, setAddressLine1] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [budget, setBudget] = useState("")
  const [budgetPublic, setBudgetPublic] = useState(false)
  const [startsAt, setStartsAt] = useState("")
  const [estimatedEndAt, setEstimatedEndAt] = useState("")
  const [deadlineAt, setDeadlineAt] = useState("")
  const [projectStage, setProjectStage] = useState("")
  const [procurementStage, setProcurementStage] = useState("")
  const [sustainabilityTargets, setSustainabilityTargets] = useState("")
  const [accessibilityRequirements, setAccessibilityRequirements] = useState("")
  const [tagIds, setTagIds] = useState<string[]>([])
  const [packageTitle, setPackageTitle] = useState("")
  const [packageDescription, setPackageDescription] = useState("")
  const [packageQuantity, setPackageQuantity] = useState("")
  const [packageUnit, setPackageUnit] = useState("")
  const [packageBudget, setPackageBudget] = useState("")
  const [criterionLabel, setCriterionLabel] = useState("")
  const [criterionKind, setCriterionKind] = useState<
    "COMPLIANCE" | "TECHNICAL" | "COMMERCIAL"
  >("COMPLIANCE")
  const [criterionWeight, setCriterionWeight] = useState("0")
  const [criterionRequired, setCriterionRequired] = useState(true)
  const [assets, setAssets] = useState<
    Array<{
      id: string
      name: string
      usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
    }>
  >([])
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [record, setRecord] = useState<{ id: string; version: number }>()

  function body(publish = false) {
    const packages = packageTitle.trim()
      ? [
          {
            title: packageTitle.trim(),
            description: packageDescription.trim() || null,
            quantity: packageQuantity ? Number(packageQuantity) : null,
            unit: packageUnit.trim() || null,
            budgetMinor: packageBudget
              ? eurosToMinor(packageBudget) || undefined
              : undefined,
          },
        ]
      : undefined
    const criteria = criterionLabel.trim()
      ? [
          {
            label: criterionLabel.trim(),
            kind: criterionKind,
            weight:
              criterionKind === "COMPLIANCE"
                ? 0
                : Number(criterionWeight) || 100,
            required: criterionRequired,
            sortOrder: 0,
          },
        ]
      : undefined
    return {
      title,
      description,
      categoryId,
      cityId,
      countryCode,
      addressLine1: addressLine1.trim() || null,
      postalCode: postalCode.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      budgetMinor: budget ? eurosToMinor(budget) || undefined : undefined,
      budgetPublic,
      startsAt: startsAt || null,
      estimatedEndAt: estimatedEndAt || null,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : undefined,
      projectStage: projectStage.trim() || null,
      procurementStage: procurementStage.trim() || null,
      sustainabilityTargets: sustainabilityTargets.trim()
        ? { notes: sustainabilityTargets.trim() }
        : {},
      accessibilityRequirements: accessibilityRequirements.trim()
        ? { notes: accessibilityRequirements.trim() }
        : {},
      tagIds,
      media: assets.map((asset, position) => ({
        assetId: asset.id,
        usage: asset.usage ?? "DOCUMENT",
        position,
      })),
      publish,
      ...(packages ? { packages } : {}),
      ...(criteria ? { criteria } : {}),
      ...(isProjectOwner
        ? { ownerProfileId: profileId }
        : { ownerCompanyId: companyId }),
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.publish.projectTitle")}
      </h2>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-4 p-5">
          <Field
            label={t("dashboard.publish.title")}
            htmlFor="project-title"
            required
          >
            <Input
              id="project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.description")}
            htmlFor="project-description"
            required
          >
            <Textarea
              id="project-description"
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("dashboard.publish.addressLine1")}
              htmlFor="project-address"
            >
              <Input
                id="project-address"
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.postalCode")}
              htmlFor="project-postal-code"
            >
              <Input
                id="project-postal-code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.latitude")}
              htmlFor="project-latitude"
            >
              <Input
                id="project-latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.longitude")}
              htmlFor="project-longitude"
            >
              <Input
                id="project-longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.startsAt")}
              htmlFor="project-start"
            >
              <Input
                id="project-start"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.estimatedEndAt")}
              htmlFor="project-estimated-end"
            >
              <Input
                id="project-estimated-end"
                type="date"
                min={startsAt || undefined}
                value={estimatedEndAt}
                onChange={(event) => setEstimatedEndAt(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.projectStage")}
              htmlFor="project-stage"
            >
              <Input
                id="project-stage"
                value={projectStage}
                onChange={(event) => setProjectStage(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.procurementStage")}
              htmlFor="project-procurement-stage"
            >
              <Input
                id="project-procurement-stage"
                value={procurementStage}
                onChange={(event) => setProcurementStage(event.target.value)}
              />
            </Field>
          </div>
          <Field
            label={t("dashboard.publish.sustainabilityTargets")}
            htmlFor="project-sustainability"
          >
            <Textarea
              id="project-sustainability"
              rows={3}
              value={sustainabilityTargets}
              onChange={(event) => setSustainabilityTargets(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.accessibilityRequirements")}
            htmlFor="project-accessibility"
          >
            <Textarea
              id="project-accessibility"
              rows={3}
              value={accessibilityRequirements}
              onChange={(event) =>
                setAccessibilityRequirements(event.target.value)
              }
            />
          </Field>
          <Field
            label={t("dashboard.publish.packageTitle")}
            htmlFor="project-package"
          >
            <Input
              id="project-package"
              value={packageTitle}
              onChange={(event) => setPackageTitle(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.packageDescription")}
            htmlFor="project-package-description"
          >
            <Textarea
              id="project-package-description"
              rows={3}
              value={packageDescription}
              onChange={(event) => setPackageDescription(event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("dashboard.publish.quantity")}
              htmlFor="project-package-quantity"
            >
              <Input
                id="project-package-quantity"
                type="number"
                min="0"
                step="any"
                value={packageQuantity}
                onChange={(event) => setPackageQuantity(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.unit")}
              htmlFor="project-package-unit"
            >
              <Input
                id="project-package-unit"
                value={packageUnit}
                onChange={(event) => setPackageUnit(event.target.value)}
              />
            </Field>
          </div>
          <Field
            label={t("dashboard.publish.packageBudget")}
            htmlFor="project-package-budget"
          >
            <Input
              id="project-package-budget"
              inputMode="decimal"
              value={packageBudget}
              onChange={(event) => setPackageBudget(event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("dashboard.publish.criterionLabel")}
              htmlFor="project-criterion-label"
            >
              <Input
                id="project-criterion-label"
                value={criterionLabel}
                onChange={(event) => setCriterionLabel(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.publish.criterionKind")}
              htmlFor="project-criterion-kind"
            >
              <Select
                value={criterionKind}
                onValueChange={(value) =>
                  setCriterionKind(value as typeof criterionKind)
                }
              >
                <SelectTrigger id="project-criterion-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["COMPLIANCE", "TECHNICAL", "COMMERCIAL"] as const).map(
                    (kind) => (
                      <SelectItem key={kind} value={kind}>
                        {t(`dashboard.publish.criteria.${kind}`)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            {criterionKind !== "COMPLIANCE" ? (
              <Field
                label={t("dashboard.publish.criterionWeight")}
                htmlFor="project-criterion-weight"
              >
                <Input
                  id="project-criterion-weight"
                  type="number"
                  min="0"
                  max="100"
                  value={criterionWeight}
                  onChange={(event) => setCriterionWeight(event.target.value)}
                />
              </Field>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={criterionRequired}
                onChange={(event) => setCriterionRequired(event.target.checked)}
              />
              {t("dashboard.publish.criterionRequired")}
            </label>
          </div>
          <AttachmentUpload assets={assets} onChange={setAssets} />
        </Card>
        <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <TaxonomySelect
            id="project-category"
            label={t("dashboard.publish.category")}
            items={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
          <Field
            label={t("dashboard.publish.location")}
            htmlFor="project-location"
            required
          >
            <CityLocationField
              cityId={cityId || undefined}
              onChange={(nextCityId, meta) => {
                setCityId(nextCityId)
                if (meta?.countryCode) setCountryCode(meta.countryCode)
              }}
            />
          </Field>
          {tags.length ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">
                {t("dashboard.publish.tags")}
              </legend>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border p-3">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={tagIds.includes(tag.id)}
                      onChange={(event) =>
                        setTagIds((current) =>
                          event.target.checked
                            ? [...new Set([...current, tag.id])]
                            : current.filter((id) => id !== tag.id),
                        )
                      }
                    />
                    {labelOf(tag)}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <Field label={t("dashboard.create.price")} htmlFor="project-budget">
            <Input
              id="project-budget"
              inputMode="decimal"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={budgetPublic}
              onChange={(event) => setBudgetPublic(event.target.checked)}
            />
            {t("dashboard.publish.budgetPublic")}
          </label>
          <Field
            label={t("dashboard.publish.deadline")}
            htmlFor="project-deadline"
          >
            <Input
              id="project-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
            />
          </Field>
        </Card>
      </div>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !title || !description || !categoryId || !cityId}
          onClick={() =>
            void submitCreate(
              () =>
                createProjectAction(
                  body(false),
                  createKey,
                  isProjectOwner ? undefined : companyId,
                ),
              setPending,
              setMessage,
              setRecord,
              router,
            )
          }
        >
          {t("dashboard.publish.saveDraft")}
        </Button>
        <PublishButton
          confirmLabel={t("dashboard.publish.confirmProject")}
          disabled={pending || !title || !description || !categoryId || !cityId}
          pending={pending}
          onPublish={async () => {
            if (record) return publishProjectAction(record.id, record.version)
            const created = await createProjectAction(
              body(true),
              createKey,
              isProjectOwner ? undefined : companyId,
            )
            return created
          }}
          setPending={setPending}
          setMessage={setMessage}
          router={router}
        />
      </div>
    </div>
  )
}

export function OpportunityCreateForm({
  categories,
  professions,
  companyId,
  isProjectOwner,
  allowedKinds,
}: {
  categories: PortalTaxonomyItem[]
  professions: PortalTaxonomyItem[]
  companyId?: string
  isProjectOwner: boolean
  /** Kinds the workspace may create; each kind carries its own permission. */
  allowedKinds?: readonly OpportunityKind[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const kinds =
    allowedKinds && allowedKinds.length ? allowedKinds : opportunityKinds
  const [kind, setKind] = useState<OpportunityKind>(kinds[0])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [professionId, setProfessionId] = useState("")
  const [cityId, setCityId] = useState("")
  const [deadlineAt, setDeadlineAt] = useState("")
  const [budget, setBudget] = useState("")
  const [durationDays, setDurationDays] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [workersNeeded, setWorkersNeeded] = useState("1")
  const [spec, setSpec] = useState("")
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [record, setRecord] = useState<{ id: string; version: number }>()

  function body(publish = false) {
    return {
      kind,
      title,
      description,
      categoryId: categoryId || null,
      professionId: professionId || null,
      cityId: cityId || null,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
      budgetMinMinor:
        kind === "WORKFORCE_REQUEST" ? null : eurosToMinor(budget) || null,
      durationDays: durationDays ? Number(durationDays) : null,
      quantity: quantity ? Number(quantity) : null,
      unit: unit || null,
      workersNeeded:
        kind === "WORKFORCE_REQUEST" ? Number(workersNeeded) || 1 : null,
      materialSpecifications: kind === "MATERIAL_SUPPLY" ? spec || null : null,
      equipmentSpecifications:
        kind === "EQUIPMENT_REQUEST" ? spec || null : null,
      attachmentAssetIds: attachments.map((item) => item.id),
      publish,
      ...(isProjectOwner ? {} : { companyId }),
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.publish.opportunityTitle")}
      </h2>
      <Field label={t("dashboard.publish.kind")} htmlFor="opp-kind" required>
        <Select
          value={kind}
          onValueChange={(value) => setKind(value as typeof kind)}
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
          <TaxonomySelect
            id="opp-profession"
            label={t("dashboard.persona.profession")}
            items={professions}
            value={professionId}
            onChange={setProfessionId}
          />
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
        </>
      ) : (
        <TaxonomySelect
          id="opp-category"
          label={t("dashboard.publish.category")}
          items={categories}
          value={categoryId}
          onChange={setCategoryId}
        />
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
          <Field label={t("dashboard.create.duration")} htmlFor="opp-duration">
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
        <CityLocationField cityId={cityId || undefined} onChange={setCityId} />
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
        <Field label={t("dashboard.create.price")} htmlFor="opp-budget">
          <Input
            id="opp-budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </Field>
      )}
      <AttachmentUpload assets={attachments} onChange={setAttachments} />
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !title || !description}
          onClick={() =>
            void submitCreate(
              () =>
                createOpportunityAction(
                  body(false),
                  createKey,
                  isProjectOwner ? undefined : companyId,
                ),
              setPending,
              setMessage,
              setRecord,
              router,
            )
          }
        >
          {t("dashboard.publish.saveDraft")}
        </Button>
        <PublishButton
          confirmLabel={t("dashboard.publish.confirmOpportunity")}
          disabled={pending || !title || !description}
          pending={pending}
          onPublish={async () => {
            if (record)
              return publishOpportunityAction(record.id, record.version)
            return createOpportunityAction(
              body(true),
              createKey,
              isProjectOwner ? undefined : companyId,
            )
          }}
          setPending={setPending}
          setMessage={setMessage}
          router={router}
        />
      </div>
    </div>
  )
}

export function TenderCreateForm({
  companyId,
  isProjectOwner,
}: {
  companyId?: string
  isProjectOwner: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sourceKind, setSourceKind] = useState<
    "BUILDINK" | "EXTERNAL_OFFICIAL"
  >("BUILDINK")
  const [visibility, setVisibility] = useState<"PUBLIC" | "INVITED">("PUBLIC")
  const [sourceUrl, setSourceUrl] = useState("")
  const [deadlineAt, setDeadlineAt] = useState("")
  const [noticeType, setNoticeType] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [record, setRecord] = useState<{ id: string; version: number }>()
  const external = sourceKind === "EXTERNAL_OFFICIAL"

  function body(publish = false) {
    return {
      title,
      description,
      sourceKind,
      submissionChannel: external ? "EXTERNAL_REDIRECT" : "BUILDINK_OFFER",
      sourceUrl: external ? sourceUrl : null,
      visibility: external ? "PUBLIC" : visibility,
      noticeType: noticeType || null,
      submissionDeadlineAt: deadlineAt
        ? new Date(deadlineAt).toISOString()
        : undefined,
      publish,
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.publish.tenderTitle")}
      </h2>
      <Field
        label={t("dashboard.publish.source")}
        htmlFor="tender-source"
        required
      >
        <Select
          value={sourceKind}
          onValueChange={(value) => setSourceKind(value as typeof sourceKind)}
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
      <Field
        label={t("dashboard.publish.title")}
        htmlFor="tender-title"
        required
      >
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
        <>
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
          <p className="text-muted text-xs">
            {t("dashboard.publish.lotsOptional")}
          </p>
        </>
      )}
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
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={
            pending ||
            !title ||
            !description ||
            !deadlineAt ||
            (external && !sourceUrl)
          }
          onClick={() =>
            void submitCreate(
              () =>
                createTenderAction(
                  body(false),
                  createKey,
                  isProjectOwner ? undefined : companyId,
                ),
              setPending,
              setMessage,
              setRecord,
              router,
            )
          }
        >
          {t("dashboard.publish.saveDraft")}
        </Button>
        <PublishButton
          confirmLabel={t("dashboard.publish.confirmTender")}
          disabled={
            pending ||
            !title ||
            !description ||
            !deadlineAt ||
            (external && !sourceUrl)
          }
          pending={pending}
          onPublish={async () => {
            if (record) return publishTenderAction(record.id, record.version)
            return createTenderAction(
              body(true),
              createKey,
              isProjectOwner ? undefined : companyId,
            )
          }}
          setPending={setPending}
          setMessage={setMessage}
          router={router}
        />
      </div>
    </div>
  )
}

export function CatalogueCreateForm({
  companyId,
  categories,
}: {
  companyId: string
  categories: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [sku, setSku] = useState("")
  const [unitOfMeasure, setUnitOfMeasure] = useState("")
  const [moq, setMoq] = useState("")
  const [leadTimeDays, setLeadTimeDays] = useState("")
  const [priceOnRequest, setPriceOnRequest] = useState(true)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.publish.catalogueTitle")}
      </h2>
      <Field
        label={t("dashboard.publish.name")}
        htmlFor="offering-name"
        required
      >
        <Input
          id="offering-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.description")}
        htmlFor="offering-description"
      >
        <Textarea
          id="offering-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <TaxonomySelect
        id="offering-category"
        label={t("dashboard.publish.category")}
        items={categories}
        value={categoryId}
        onChange={setCategoryId}
      />
      <Field label={t("dashboard.publish.sku")} htmlFor="offering-sku">
        <Input
          id="offering-sku"
          value={sku}
          onChange={(event) => setSku(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.unitOfMeasure")}
        htmlFor="offering-uom"
      >
        <Input
          id="offering-uom"
          value={unitOfMeasure}
          onChange={(event) => setUnitOfMeasure(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.publish.moq")} htmlFor="offering-moq">
        <Input
          id="offering-moq"
          type="number"
          min={0}
          value={moq}
          onChange={(event) => setMoq(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.leadTimeDays")}
        htmlFor="offering-lead"
      >
        <Input
          id="offering-lead"
          type="number"
          min={0}
          value={leadTimeDays}
          onChange={(event) => setLeadTimeDays(event.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={priceOnRequest}
          onChange={(event) => setPriceOnRequest(event.target.checked)}
        />
        {t("dashboard.publish.priceOnRequest")}
      </label>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={pending || !name}
        onClick={() => {
          setPending(true)
          void createCatalogueAction(
            companyId,
            {
              name,
              description: description || null,
              categoryId: categoryId || null,
              sku: sku || null,
              unitOfMeasure: unitOfMeasure || null,
              moq: moq ? Number(moq) : null,
              leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
              priceOnRequest,
            },
            createKey,
          ).then((result) => {
            setPending(false)
            setMessage(result.ok ? undefined : result.message)
            if (result.ok) router.refresh()
          })
        }}
      >
        {t("dashboard.publish.saveDraft")}
      </Button>
    </div>
  )
}

export function EquipmentCreateForm({
  companyId,
  categories,
}: {
  companyId?: string
  categories: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [listingType, setListingType] = useState("RENT")
  const [categoryId, setCategoryId] = useState("")
  const [cityId, setCityId] = useState("")
  const [brand, setBrand] = useState("")
  const [year, setYear] = useState("")
  const [rate, setRate] = useState("")
  const [weeklyRate, setWeeklyRate] = useState("")
  const [monthlyRate, setMonthlyRate] = useState("")
  const [ratePublic, setRatePublic] = useState(false)
  const [operatorIncluded, setOperatorIncluded] = useState(false)
  const [deliveryAvailable, setDeliveryAvailable] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [record, setRecord] = useState<{ id: string; version: number }>()

  function body(publish = false) {
    return {
      name,
      description: description || null,
      listingType,
      categoryId: categoryId || null,
      cityId: cityId || null,
      brand: brand || null,
      yearManufactured: year ? Number(year) : null,
      dailyRateMinor: eurosToMinor(rate) || null,
      weeklyRateMinor: eurosToMinor(weeklyRate) || null,
      monthlyRateMinor: eurosToMinor(monthlyRate) || null,
      ratePublic,
      operatorIncluded,
      deliveryAvailable,
      publish,
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.publish.equipmentTitle")}
      </h2>
      <Field label={t("dashboard.publish.name")} htmlFor="equip-name" required>
        <Input
          id="equip-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.description")}
        htmlFor="equip-description"
      >
        <Textarea
          id="equip-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.publish.listingType")} htmlFor="equip-type">
        <Select value={listingType} onValueChange={setListingType}>
          <SelectTrigger id="equip-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RENT">{t("dashboard.publish.rent")}</SelectItem>
            <SelectItem value="SALE">{t("dashboard.publish.sale")}</SelectItem>
            <SelectItem value="RENT_AND_SALE">
              {t("dashboard.publish.rentAndSale")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <TaxonomySelect
        id="equip-category"
        label={t("dashboard.publish.category")}
        items={categories}
        value={categoryId}
        onChange={setCategoryId}
      />
      <Field label={t("dashboard.publish.location")} htmlFor="opp-location">
        <CityLocationField cityId={cityId || undefined} onChange={setCityId} />
      </Field>
      <Field label={t("dashboard.publish.brand")} htmlFor="equip-brand">
        <Input
          id="equip-brand"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.publish.year")} htmlFor="equip-year">
        <Input
          id="equip-year"
          type="number"
          min={1900}
          max={2100}
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.create.price")} htmlFor="equip-rate">
        <Input
          id="equip-rate"
          value={rate}
          onChange={(event) => setRate(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.publish.weeklyRate")} htmlFor="equip-weekly">
        <Input
          id="equip-weekly"
          value={weeklyRate}
          onChange={(event) => setWeeklyRate(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.publish.monthlyRate")} htmlFor="equip-monthly">
        <Input
          id="equip-monthly"
          value={monthlyRate}
          onChange={(event) => setMonthlyRate(event.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={ratePublic}
          onChange={(event) => setRatePublic(event.target.checked)}
        />
        {t("dashboard.publish.ratePublic")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={operatorIncluded}
          onChange={(event) => setOperatorIncluded(event.target.checked)}
        />
        {t("dashboard.publish.operatorIncluded")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={deliveryAvailable}
          onChange={(event) => setDeliveryAvailable(event.target.checked)}
        />
        {t("dashboard.publish.deliveryAvailable")}
      </label>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !name}
          onClick={() =>
            void submitCreate(
              () => createEquipmentAction(body(false), createKey, companyId),
              setPending,
              setMessage,
              setRecord,
              router,
            )
          }
        >
          {t("dashboard.publish.saveDraft")}
        </Button>
        <PublishButton
          confirmLabel={t("dashboard.publish.confirmEquipment")}
          disabled={pending || !name}
          pending={pending}
          onPublish={async () => {
            if (record) return publishEquipmentAction(record.id, record.version)
            return createEquipmentAction(body(true), createKey, companyId)
          }}
          setPending={setPending}
          setMessage={setMessage}
          router={router}
        />
      </div>
    </div>
  )
}

function TaxonomySelect({
  id,
  label,
  items,
  value,
  onChange,
}: {
  id: string
  label: string
  items: PortalTaxonomyItem[]
  value: string
  onChange: (value: string) => void
}) {
  const t = useTranslations()
  return (
    <Field label={label} htmlFor={id}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {labelOf(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

async function submitCreate(
  run: () => Promise<
    { ok: true; data: unknown } | { ok: false; message: string }
  >,
  setPending: (value: boolean) => void,
  setMessage: (value?: string) => void,
  setRecord: (value: { id: string; version: number }) => void,
  router: { refresh: () => void },
) {
  setPending(true)
  const result = await run()
  setPending(false)
  if (!result.ok) {
    setMessage(result.message)
    return
  }
  const data = result.data as { id?: string; version?: number }
  if (data.id && data.version) setRecord({ id: data.id, version: data.version })
  setMessage(undefined)
  router.refresh()
}

function PublishButton({
  confirmLabel,
  disabled,
  pending,
  onPublish,
  setPending,
  setMessage,
  router,
}: {
  confirmLabel: string
  disabled: boolean
  pending: boolean
  onPublish: () => Promise<{ ok: boolean; message?: string }>
  setPending: (value: boolean) => void
  setMessage: (value?: string) => void
  router: { refresh: () => void }
}) {
  const t = useTranslations()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        disabled={disabled || pending}
        onClick={() => setConfirmationOpen(true)}
      >
        {t("dashboard.publish.publish")}
      </Button>
      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title={t("dashboard.publish.publish")}
        description={confirmLabel}
        confirmLabel={t("dashboard.publish.publish")}
        cancelLabel={t("common.cancel")}
        pending={pending}
        onConfirm={() => {
          setPending(true)
          void onPublish().then((result) => {
            setPending(false)
            if (!result.ok) {
              setMessage(result.message)
              return
            }
            setConfirmationOpen(false)
            setMessage(undefined)
            router.refresh()
          })
        }}
      />
    </>
  )
}
