"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { useTranslations } from "next-intl"
import { z } from "zod"
import { projectWebsiteObject } from "@/shared/marketplace/portal-form-schemas"

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
import { AttachmentUpload } from "@/features/dashboard/components/attachment-upload"
import {
  createProjectAction,
  updateProjectAction,
} from "@/features/dashboard/actions/portal.actions"
import type {
  PortalProjectDetail,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"
import {
  dateInputValue,
  datetimeInputValue,
  eurosToMinor,
  jsonNotes,
  minorToEuros,
  notesRecord,
  toIsoDateTime,
} from "@/features/dashboard/lib/marketplace-money"
import { portalDetailPath } from "@/features/dashboard/config/portal-routes"
import { Link, useRouter } from "@/i18n/navigation"

const criterionKinds = ["COMPLIANCE", "TECHNICAL", "COMMERCIAL"] as const

const projectFormSchema = z.object({
  title: z.string().trim().min(3).max(250),
  description: z.string().trim().min(10).max(20000),
  categoryId: z.string().uuid(),
  cityId: z.string().uuid(),
  countryCode: z.string().trim().length(2),
  addressLine1: z.string(),
  postalCode: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  budget: z.string(),
  budgetPublic: z.boolean(),
  startsAt: z.string(),
  estimatedEndAt: z.string(),
  deadlineAt: z.string(),
  projectStage: z.string(),
  procurementStage: z.string(),
  sustainabilityTargets: z.string(),
  accessibilityRequirements: z.string(),
  tagIds: z.array(z.string().uuid()),
  packages: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      quantity: z.string(),
      unit: z.string(),
      budget: z.string(),
      currency: z.string(),
    }),
  ),
  criteria: z.array(
    z.object({
      label: z.string(),
      description: z.string(),
      kind: z.enum(criterionKinds),
      weight: z.string(),
      required: z.boolean(),
    }),
  ),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

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

function emptyPackage(currency = "EUR"): ProjectFormValues["packages"][number] {
  return {
    title: "",
    description: "",
    quantity: "",
    unit: "",
    budget: "",
    currency,
  }
}

function emptyCriterion(): ProjectFormValues["criteria"][number] {
  return {
    label: "",
    description: "",
    kind: "COMPLIANCE",
    weight: "0",
    required: true,
  }
}

function valuesFromProject(project?: PortalProjectDetail): ProjectFormValues {
  return {
    title: project?.title ?? "",
    description: project?.description ?? "",
    categoryId: project?.categoryId ?? project?.categoryIds?.[0] ?? "",
    cityId: project?.cityId ?? "",
    countryCode: project?.countryCode ?? "IT",
    addressLine1: project?.addressLine1 ?? "",
    postalCode: project?.postalCode ?? "",
    latitude: project?.latitude ?? "",
    longitude: project?.longitude ?? "",
    budget: minorToEuros(project?.budgetMinor),
    budgetPublic: project?.budgetPublic ?? false,
    startsAt: dateInputValue(project?.startsAt),
    estimatedEndAt: dateInputValue(project?.estimatedEndAt),
    deadlineAt: datetimeInputValue(project?.deadlineAt),
    projectStage: project?.projectStage ?? "",
    procurementStage: project?.procurementStage ?? "",
    sustainabilityTargets: jsonNotes(project?.sustainabilityTargets),
    accessibilityRequirements: jsonNotes(project?.accessibilityRequirements),
    tagIds: project?.tagIds ?? [],
    packages: project?.packages.length
      ? project.packages.map((item) => ({
          title: item.title,
          description: item.description ?? "",
          quantity: item.quantity ?? "",
          unit: item.unit ?? "",
          budget: minorToEuros(item.budgetMinor),
          currency: item.currency ?? project.currency ?? "EUR",
        }))
      : [emptyPackage(project?.currency ?? "EUR")],
    criteria: project?.criteria.length
      ? project.criteria.map((item) => ({
          label: item.label,
          description: item.description ?? "",
          kind: item.kind,
          weight: String(item.weight),
          required: item.required,
        }))
      : [emptyCriterion()],
  }
}

export const PROJECT_FORM_FIELD_KEYS = Object.keys(
  projectWebsiteObject.shape,
) as string[]

export function ProjectForm({
  mode,
  project,
  categories,
  tags,
  companyId,
  profileId,
  isProjectOwner,
}: {
  mode: "create" | "edit"
  project?: PortalProjectDetail
  categories: PortalTaxonomyItem[]
  tags: PortalTaxonomyItem[]
  companyId?: string
  profileId: string
  isProjectOwner: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [assets, setAssets] = useState<
    Array<{
      id: string
      name: string
      usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
    }>
  >(
    project?.media.map((item) => ({
      id: item.assetId,
      name: item.name,
      usage: item.usage,
    })) ?? [],
  )

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: valuesFromProject(project),
  })
  const packages = useFieldArray({ control: form.control, name: "packages" })
  const criteria = useFieldArray({ control: form.control, name: "criteria" })
  const criteriaValues = useWatch({ control: form.control, name: "criteria" })
  const categoryId = useWatch({ control: form.control, name: "categoryId" })
  const cityId = useWatch({ control: form.control, name: "cityId" })
  const tagIds = useWatch({ control: form.control, name: "tagIds" })
  const budgetPublic = useWatch({ control: form.control, name: "budgetPublic" })
  const startsAt = useWatch({ control: form.control, name: "startsAt" })

  function payload(values: ProjectFormValues, publish = false) {
    const latitude = values.latitude.trim()
    const longitude = values.longitude.trim()
    return {
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      cityId: values.cityId,
      countryCode: values.countryCode,
      addressLine1: values.addressLine1.trim() || null,
      postalCode: values.postalCode.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      budgetMinor: values.budget ? eurosToMinor(values.budget) || null : null,
      budgetPublic: values.budgetPublic,
      currency: project?.currency ?? "EUR",
      startsAt: values.startsAt || null,
      estimatedEndAt: values.estimatedEndAt || null,
      deadlineAt: values.deadlineAt ? toIsoDateTime(values.deadlineAt) : null,
      projectStage: values.projectStage.trim() || null,
      procurementStage: values.procurementStage.trim() || null,
      sustainabilityTargets: notesRecord(values.sustainabilityTargets),
      accessibilityRequirements: notesRecord(values.accessibilityRequirements),
      tagIds: values.tagIds,
      packages: values.packages
        .filter((item) => item.title.trim().length >= 2)
        .map((item) => ({
          title: item.title.trim(),
          description: item.description.trim() || null,
          quantity: item.quantity ? Number(item.quantity) : null,
          unit: item.unit.trim() || null,
          budgetMinor: item.budget ? eurosToMinor(item.budget) || null : null,
          currency: item.currency || "EUR",
        })),
      criteria: values.criteria
        .filter((item) => item.label.trim().length >= 2)
        .map((item, index) => ({
          label: item.label.trim(),
          description: item.description.trim() || null,
          kind: item.kind,
          weight: item.kind === "COMPLIANCE" ? 0 : Number(item.weight) || 0,
          required: item.required,
          sortOrder: index,
        })),
      media: assets.map((asset, position) => ({
        assetId: asset.id,
        usage: asset.usage ?? "DOCUMENT",
        position,
      })),
      publish,
      ...(isProjectOwner
        ? { ownerProfileId: profileId }
        : { ownerCompanyId: companyId }),
    }
  }

  async function save(values: ProjectFormValues, publish: boolean) {
    setPending(true)
    setMessage(undefined)
    const body = payload(values, publish)
    const result =
      mode === "edit" && project?.version
        ? await updateProjectAction(project.id, body, project.version)
        : await createProjectAction(
            body,
            createKey,
            isProjectOwner ? undefined : companyId,
          )
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const created = result.data as { id?: string }
    const id = project?.id ?? created.id
    if (id) router.push(portalDetailPath("projects", id))
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => void save(values, false))}
      noValidate
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-4 p-5">
          <Field
            label={t("dashboard.publish.title")}
            htmlFor="project-title"
            required
            error={form.formState.errors.title?.message}
          >
            <Input id="project-title" {...form.register("title")} />
          </Field>
          <Field
            label={t("dashboard.publish.description")}
            htmlFor="project-description"
            required
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="project-description"
              rows={6}
              {...form.register("description")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("dashboard.publish.addressLine1")}
              htmlFor="project-address"
            >
              <Input id="project-address" {...form.register("addressLine1")} />
            </Field>
            <Field
              label={t("dashboard.publish.postalCode")}
              htmlFor="project-postal-code"
            >
              <Input
                id="project-postal-code"
                {...form.register("postalCode")}
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
                {...form.register("latitude")}
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
                {...form.register("longitude")}
              />
            </Field>
            <Field
              label={t("dashboard.publish.startsAt")}
              htmlFor="project-start"
            >
              <Input
                id="project-start"
                type="date"
                {...form.register("startsAt")}
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
                {...form.register("estimatedEndAt")}
              />
            </Field>
            <Field
              label={t("dashboard.publish.projectStage")}
              htmlFor="project-stage"
            >
              <Input id="project-stage" {...form.register("projectStage")} />
            </Field>
            <Field
              label={t("dashboard.publish.procurementStage")}
              htmlFor="project-procurement-stage"
            >
              <Input
                id="project-procurement-stage"
                {...form.register("procurementStage")}
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
              {...form.register("sustainabilityTargets")}
            />
          </Field>
          <Field
            label={t("dashboard.publish.accessibilityRequirements")}
            htmlFor="project-accessibility"
          >
            <Textarea
              id="project-accessibility"
              rows={3}
              {...form.register("accessibilityRequirements")}
            />
          </Field>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t("dashboard.publish.packages")}</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => packages.append(emptyPackage())}
              >
                {t("dashboard.publish.addPackage")}
              </Button>
            </div>
            {packages.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
              >
                <Input
                  placeholder={t("dashboard.publish.packageTitle")}
                  {...form.register(`packages.${index}.title`)}
                />
                <Input
                  placeholder={t("dashboard.publish.packageBudget")}
                  {...form.register(`packages.${index}.budget`)}
                />
                <Textarea
                  className="sm:col-span-2"
                  placeholder={t("dashboard.publish.packageDescription")}
                  {...form.register(`packages.${index}.description`)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => packages.remove(index)}
                >
                  {t("common.remove")}
                </Button>
              </div>
            ))}
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {t("dashboard.publish.criteriaTitle")}
              </h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => criteria.append(emptyCriterion())}
              >
                {t("dashboard.publish.addCriterion")}
              </Button>
            </div>
            {criteria.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
              >
                <Input
                  placeholder={t("dashboard.publish.criterionLabel")}
                  {...form.register(`criteria.${index}.label`)}
                />
                <Select
                  value={criteriaValues?.[index]?.kind}
                  onValueChange={(value) =>
                    form.setValue(
                      `criteria.${index}.kind`,
                      value as (typeof criterionKinds)[number],
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
                {criteriaValues?.[index]?.kind !== "COMPLIANCE" ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...form.register(`criteria.${index}.weight`)}
                  />
                ) : null}
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={criteriaValues?.[index]?.required}
                    onChange={(event) =>
                      form.setValue(
                        `criteria.${index}.required`,
                        event.target.checked,
                      )
                    }
                  />
                  {t("dashboard.publish.criterionRequired")}
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => criteria.remove(index)}
                >
                  {t("common.remove")}
                </Button>
              </div>
            ))}
          </section>
          <AttachmentUpload assets={assets} onChange={setAssets} />
        </Card>
        <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <Field
            label={t("dashboard.publish.category")}
            htmlFor="project-category"
            required
            error={form.formState.errors.categoryId?.message}
          >
            <Select
              value={categoryId}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger id="project-category">
                <SelectValue
                  placeholder={t("dashboard.create.chooseTarget")}
                />
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
          <Field
            label={t("dashboard.publish.location")}
            htmlFor="project-location"
            required
            error={form.formState.errors.cityId?.message}
          >
            <CityLocationField
              cityId={cityId || undefined}
              onChange={(nextCityId, meta) => {
                form.setValue("cityId", nextCityId)
                if (meta?.countryCode) form.setValue("countryCode", meta.countryCode)
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
                        form.setValue(
                          "tagIds",
                          event.target.checked
                            ? [...new Set([...tagIds, tag.id])]
                            : tagIds.filter((id) => id !== tag.id),
                        )
                      }
                    />
                    {taxonomyLabel(tag)}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <Field label={t("dashboard.create.price")} htmlFor="project-budget">
            <Input
              id="project-budget"
              inputMode="decimal"
              {...form.register("budget")}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={budgetPublic}
              onChange={(event) =>
                form.setValue("budgetPublic", event.target.checked)
              }
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
              {...form.register("deadlineAt")}
            />
          </Field>
        </Card>
      </div>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {mode === "edit"
            ? t("dashboard.edit.save")
            : t("dashboard.publish.saveDraft")}
        </Button>
        {mode === "create" ? (
          <>
            <Button
              type="button"
              disabled={pending}
              onClick={() => setConfirmOpen(true)}
            >
              {t("dashboard.publish.publish")}
            </Button>
            <ConfirmationDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={t("dashboard.publish.publish")}
              description={t("dashboard.publish.confirmProject")}
              confirmLabel={t("dashboard.publish.publish")}
              cancelLabel={t("common.cancel")}
              pending={pending}
              onConfirm={() => {
                void form.handleSubmit((values) => save(values, true))()
              }}
            />
          </>
        ) : null}
        <Button type="button" variant="secondary" asChild>
          <Link
            href={
              project
                ? portalDetailPath("projects", project.id)
                : "/dashboard/projects"
            }
          >
            {t("common.cancel")}
          </Link>
        </Button>
      </div>
    </form>
  )
}
