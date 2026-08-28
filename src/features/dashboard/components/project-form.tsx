"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileText,
  Layers3,
  Loader2,
  MapPin,
  Save,
  Send,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { useTranslations } from "next-intl"
import { z } from "zod"
import { projectWebsiteObject } from "@/shared/marketplace/portal-form-schemas"

import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
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
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

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

type ProjectStep = 0 | 1 | 2 | 3

const totalSteps = 4

const stepFields: Record<ProjectStep, (keyof ProjectFormValues)[]> = {
  0: [
    "title",
    "description",
    "addressLine1",
    "postalCode",
    "latitude",
    "longitude",
    "startsAt",
    "estimatedEndAt",
    "projectStage",
    "procurementStage",
    "sustainabilityTargets",
    "accessibilityRequirements",
  ],
  1: ["packages", "criteria"],
  2: ["categoryId", "cityId", "budget", "budgetPublic", "deadlineAt", "tagIds"],
  3: [],
}

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
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const [step, setStep] = useState<ProjectStep>(0)
  const [validating, setValidating] = useState(false)
  const [stepError, setStepError] = useState<string[] | null>(null)
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

  const busy = pending || validating || form.formState.isSubmitting

  const errorLabel = (key: string) => {
    const labels: Record<string, string> = {
      title: t("dashboard.publish.title"),
      description: t("dashboard.publish.description"),
      categoryId: t("dashboard.publish.category"),
      cityId: t("dashboard.publish.location"),
      addressLine1: t("dashboard.publish.addressLine1"),
      postalCode: t("dashboard.publish.postalCode"),
      latitude: t("dashboard.publish.latitude"),
      longitude: t("dashboard.publish.longitude"),
      startsAt: t("dashboard.publish.startsAt"),
      estimatedEndAt: t("dashboard.publish.estimatedEndAt"),
      deadlineAt: t("dashboard.publish.deadline"),
      projectStage: t("dashboard.publish.projectStage"),
      procurementStage: t("dashboard.publish.procurementStage"),
      sustainabilityTargets: t("dashboard.publish.sustainabilityTargets"),
      accessibilityRequirements: t(
        "dashboard.publish.accessibilityRequirements",
      ),
      packages: t("dashboard.publish.packages"),
      criteria: t("dashboard.publish.criteriaTitle"),
    }
    return labels[key.replace(/\..*$/, "")] ?? key
  }

  const errorSummary = (keys: string[]) => keys.map(errorLabel)

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
      throw new Error(result.message)
    }
    const created = result.data as { id?: string }
    const id = project?.id ?? created.id
    if (id) router.push(portalDetailPath("projects", id))
  }

  function requestSave(values: ProjectFormValues, publish: boolean) {
    setMessage(undefined)
    setStepError(null)
    setAction({
      title:
        mode === "edit"
          ? t("dashboard.projects.form.confirmEdit", { title: values.title })
          : publish
            ? t("dashboard.projects.form.confirmPublish", {
                title: values.title,
              })
            : t("dashboard.projects.form.confirmCreate", {
                title: values.title,
              }),
      description:
        mode === "edit"
          ? t("dashboard.projects.form.confirmEditDescription")
          : publish
            ? t("dashboard.publish.confirmProject")
            : t("dashboard.projects.form.confirmCreateDescription"),
      confirmLabel:
        mode === "edit"
          ? t("dashboard.edit.save")
          : publish
            ? t("dashboard.publish.publish")
            : t("dashboard.publish.saveDraft"),
      cancelLabel: t("common.cancel"),
      pendingLabel: t("dashboard.projects.table.processing"),
      requireReason: mode === "edit",
      reasonLabel: t("dashboard.projects.table.reasonLabel"),
      reasonPlaceholder: t("dashboard.projects.table.reasonPlaceholder"),
      onConfirm: () => save(values, publish),
    })
  }

  function onInvalid() {
    const failedKeys = Object.keys(form.formState.errors)
    setMessage(undefined)
    setStepError(errorSummary(failedKeys))
  }

  async function goNext() {
    if (busy) return
    setValidating(true)
    try {
      const valid = await form.trigger(stepFields[step], { shouldFocus: true })
      if (!valid) {
        const failedKeys = Object.keys(form.formState.errors).filter((key) =>
          stepFields[step].some(
            (field) => key === field || key.startsWith(`${field}.`),
          ),
        )
        setStepError(errorSummary(failedKeys))
        return
      }
      setStepError(null)
      setStep((current) =>
        current === totalSteps - 1 ? current : ((current + 1) as ProjectStep),
      )
    } finally {
      setValidating(false)
    }
  }

  function goBack() {
    setStep((current) =>
      current === 0 ? current : ((current - 1) as ProjectStep),
    )
  }

  const steps = [
    {
      id: "information",
      label: t("dashboard.projects.form.steps.information"),
      description: t("dashboard.projects.form.stepDescriptions.information"),
    },
    {
      id: "packages",
      label: t("dashboard.projects.form.steps.packages"),
      description: t("dashboard.projects.form.stepDescriptions.packages"),
    },
    {
      id: "publishing",
      label: t("dashboard.projects.form.steps.publishing"),
      description: t("dashboard.projects.form.stepDescriptions.publishing"),
    },
    {
      id: "media",
      label: t("dashboard.projects.form.steps.media"),
      description: t("dashboard.projects.form.stepDescriptions.media"),
    },
  ]

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(
        (values) => requestSave(values, false),
        onInvalid,
      )}
      onKeyDown={(event) => {
        if (
          event.key !== "Enter" ||
          step === totalSteps - 1 ||
          event.nativeEvent.isComposing
        ) {
          return
        }
        const target = event.target as HTMLElement
        if (target.tagName === "TEXTAREA" || target.isContentEditable) return
        event.preventDefault()
      }}
      noValidate
    >
      <div
        className={cn(
          "grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="hidden rounded-lg p-5 lg:block">
            <FormStepper
              steps={steps}
              current={step}
              orientation="vertical"
              onStepClick={(index) => setStep(index as ProjectStep)}
            />
          </Card>
          <Card className="rounded-lg p-5 lg:hidden">
            <FormStepper
              steps={steps.map((item) => ({ ...item, description: undefined }))}
              current={step}
            />
          </Card>
        </aside>
        <div className="min-w-0 space-y-5">
          {message ? (
            <AlertPanel title={t("dashboard.projects.form.requestFailed")}>
              {message}
            </AlertPanel>
          ) : null}
          {stepError ? (
            <AlertPanel title={t("dashboard.projects.form.validationFailed")}>
              <ul className="list-inside list-disc space-y-1">
                {stepError.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AlertPanel>
          ) : null}
          {step === 0 ? (
            <Card className="space-y-5 rounded-lg p-5">
              <SectionTitle
                icon={<FileText className="size-4" />}
                title={t("dashboard.projects.form.details")}
                description={t("dashboard.projects.form.detailsDescription")}
              />
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
                <div className="sm:col-span-2">
                  <SectionTitle
                    icon={<MapPin className="size-4" />}
                    title={t("dashboard.projects.form.location")}
                    description={t(
                      "dashboard.projects.form.locationDescription",
                    )}
                  />
                </div>
                <Field
                  label={t("dashboard.publish.addressLine1")}
                  htmlFor="project-address"
                >
                  <Input
                    id="project-address"
                    {...form.register("addressLine1")}
                  />
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
                  <Input
                    id="project-stage"
                    {...form.register("projectStage")}
                  />
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
            </Card>
          ) : null}
          {step === 1 ? (
            <Card className="space-y-5 rounded-lg p-5">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionTitle
                    icon={<Layers3 className="size-4" />}
                    title={t("dashboard.publish.packages")}
                    description={t(
                      "dashboard.projects.form.packagesDescription",
                    )}
                  />
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
                    className="border-line/70 grid gap-3 rounded-lg border bg-slate-50/60 p-4 sm:grid-cols-2"
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
                <div className="border-line/70 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                  <SectionTitle
                    icon={<Save className="size-4" />}
                    title={t("dashboard.publish.criteriaTitle")}
                    description={t(
                      "dashboard.projects.form.criteriaDescription",
                    )}
                  />
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
                    className="border-line/70 grid gap-3 rounded-lg border bg-slate-50/60 p-4 sm:grid-cols-2"
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
            </Card>
          ) : null}
          {step === 2 ? (
            <Card className="space-y-4 rounded-lg p-5">
              <SectionTitle
                icon={<Send className="size-4" />}
                title={t("dashboard.projects.form.publishing")}
                description={t("dashboard.projects.form.publishingDescription")}
              />
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
                    if (meta?.countryCode)
                      form.setValue("countryCode", meta.countryCode)
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
              <Field
                label={t("dashboard.create.price")}
                htmlFor="project-budget"
              >
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
          ) : null}
          {step === 3 ? (
            <Card className="space-y-5 rounded-lg p-5">
              <SectionTitle
                icon={<FileText className="size-4" />}
                title={t("dashboard.projects.documents")}
                description={t("dashboard.projects.form.mediaDescription")}
              />
              <AttachmentUpload assets={assets} onChange={setAssets} />
            </Card>
          ) : null}
          <div className="border-line/80 flex items-center justify-between gap-2 rounded-lg border bg-white p-3 shadow-sm">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                step === 0
                  ? router.push(
                      project
                        ? portalDetailPath("projects", project.id)
                        : "/dashboard/projects",
                    )
                  : goBack()
              }
            >
              {step === 0 ? (
                <>
                  <ArrowLeft className="size-4" />
                  {t("common.cancel")}
                </>
              ) : (
                t("dashboard.projects.form.back")
              )}
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-muted text-xs font-medium">
                {step + 1} / {totalSteps}
              </span>
              {step < totalSteps - 1 ? (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void goNext()}
                >
                  {validating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {t("dashboard.projects.form.next")}
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={busy} variant="secondary">
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {mode === "edit"
                      ? t("dashboard.edit.save")
                      : t("dashboard.publish.saveDraft")}
                  </Button>
                  {mode === "create" ? (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        void form.handleSubmit(
                          (values) => requestSave(values, true),
                          onInvalid,
                        )()
                      }}
                    >
                      <Send className="size-4" />
                      {t("dashboard.publish.publish")}
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      >
        {message ? <p className="text-danger text-sm">{message}</p> : null}
      </ReasonConfirmationDialog>
    </form>
  )
}

function SectionTitle({
  description,
  icon,
  title,
}: {
  description?: string
  icon: ReactNode
  title: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="bg-primary/10 text-primary mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-brand-navy text-sm font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted mt-1 text-xs leading-5">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

function AlertPanel({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="border-danger/40 bg-danger/5 rounded-lg border p-4">
      <p className="text-danger flex items-center gap-2 text-sm font-semibold">
        <AlertCircle className="size-4" />
        {title}
      </p>
      <div className="text-danger mt-2 text-xs">{children}</div>
    </div>
  )
}

type FormStepperStep = {
  id: string
  label: string
  description?: string
}

function FormStepper({
  className,
  current,
  onStepClick,
  orientation = "horizontal",
  steps,
}: {
  className?: string
  current: number
  onStepClick?: (index: number) => void
  orientation?: "horizontal" | "vertical"
  steps: FormStepperStep[]
}) {
  if (orientation === "vertical") {
    return (
      <ol className={cn("relative flex flex-col gap-1", className)}>
        {steps.map((step, index) => {
          const state = stepState(index, current)
          const clickable = Boolean(onStepClick) && index < current
          return (
            <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute start-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full",
                    state.complete ? "bg-primary" : "bg-line",
                  )}
                />
              ) : null}
              <StepMarker
                index={index}
                state={state}
                clickable={clickable}
                onStepClick={onStepClick}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <button
                  type="button"
                  tabIndex={clickable ? 0 : -1}
                  disabled={!clickable}
                  onClick={() => clickable && onStepClick?.(index)}
                  className={cn(
                    "block text-start text-sm font-semibold transition-colors",
                    state.active
                      ? "text-primary"
                      : state.complete
                        ? "text-brand-navy"
                        : "text-muted",
                    clickable &&
                      "hover:text-primary cursor-pointer focus-visible:underline focus-visible:outline-none",
                    !clickable && "cursor-default",
                  )}
                >
                  {step.label}
                </button>
                {step.description ? (
                  <p
                    className={cn(
                      "mt-0.5 text-xs leading-relaxed",
                      state.active ? "text-brand-navy/70" : "text-muted",
                    )}
                  >
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, index) => {
        const state = stepState(index, current)
        return (
          <li
            key={step.id}
            className="relative flex flex-1 flex-col items-center text-center"
          >
            {index ? (
              <span
                aria-hidden
                className={cn(
                  "absolute end-1/2 top-4 h-0.5 w-full",
                  state.complete ? "bg-primary" : "bg-line",
                )}
              />
            ) : null}
            <StepMarker index={index} state={state} clickable={false} />
            <span
              className={cn(
                "mt-2 max-w-[9rem] text-xs leading-tight font-semibold",
                state.active
                  ? "text-primary"
                  : state.complete
                    ? "text-brand-navy"
                    : "text-muted",
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function stepState(index: number, current: number) {
  return {
    active: index === current,
    complete: index < current,
  }
}

function StepMarker({
  clickable,
  index,
  onStepClick,
  state,
}: {
  clickable: boolean
  index: number
  onStepClick?: (index: number) => void
  state: { active: boolean; complete: boolean }
}) {
  return (
    <button
      type="button"
      tabIndex={clickable ? 0 : -1}
      disabled={!clickable}
      aria-current={state.active ? "step" : undefined}
      onClick={() => clickable && onStepClick?.(index)}
      className={cn(
        "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-all",
        state.active &&
          "border-primary bg-primary ring-primary/15 text-white ring-4",
        state.complete && "border-primary bg-primary/10 text-primary",
        !state.active && !state.complete && "border-line text-muted bg-white",
        clickable && "cursor-pointer hover:scale-105",
        !clickable && "cursor-default",
      )}
    >
      {state.complete ? <Check className="size-4" /> : index + 1}
    </button>
  )
}
