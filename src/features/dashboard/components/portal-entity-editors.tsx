"use client"

import { useState } from "react"
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
import { CityLocationField } from "@/components/forms/city-location-field"
import { AttachmentUpload } from "@/features/dashboard/components/attachment-upload"
import {
  updateEntityAction,
  updateCatalogueItemAction,
  updateProjectAction,
} from "@/features/dashboard/actions/portal.actions"
import type {
  PortalProjectDetail,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"

export function EntityEditForm({
  entity,
  id,
  version,
  companyId,
  initial,
}: {
  entity: "opportunity" | "tender" | "equipment" | "catalogue"
  id: string
  version: number
  companyId?: string
  initial: {
    title?: string
    description?: string
    reference?: string | null
    name?: string
  }
}) {
  const t = useTranslations("dashboard.edit")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [title, setTitle] = useState(initial.title ?? initial.name ?? "")
  const [description, setDescription] = useState(initial.description ?? "")
  const [reference, setReference] = useState(initial.reference ?? "")

  async function save() {
    setPending(true)
    setMessage(undefined)
    const body =
      entity === "catalogue"
        ? { name: title, description }
        : { title, description, reference: reference || undefined }
    const result =
      entity === "catalogue" && companyId
        ? await updateCatalogueItemAction(companyId, id, body, version)
        : entity !== "catalogue"
          ? await updateEntityAction(entity, id, body, version)
          : { ok: false as const, message: "Missing company" }
    setPending(false)
    setMessage(result.ok ? t("saved") : result.message)
    if (result.ok) router.refresh()
  }

  return (
    <div className="space-y-4">
      <Field label={t("title")} htmlFor={`edit-title-${id}`}>
        <Input
          id={`edit-title-${id}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label={t("description")} htmlFor={`edit-description-${id}`}>
        <Textarea
          id={`edit-description-${id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      {entity !== "catalogue" && entity !== "equipment" ? (
        <Field label={t("reference")} htmlFor={`edit-reference-${id}`}>
          <Input
            id={`edit-reference-${id}`}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </Field>
      ) : null}
      <Button
        disabled={pending || title.trim().length < 2}
        onClick={() => void save()}
      >
        {t("save")}
      </Button>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
    </div>
  )
}

function taxonomyLabel(item: PortalTaxonomyItem) {
  if (item.name) return item.name
  if (item.label) return item.label
  if (item.translations && typeof item.translations === "object") {
    const en = (item.translations as Record<string, unknown>).en
    if (typeof en === "string") return en
    if (en && typeof en === "object" && "name" in en) {
      return String((en as { name: unknown }).name)
    }
  }
  return item.slug ?? item.id
}

function jsonNotes(value: unknown) {
  if (value && typeof value === "object" && "notes" in value) {
    return String((value as { notes?: unknown }).notes ?? "")
  }
  return ""
}

function minorToEuros(value?: string | null) {
  return value ? String(Number(value) / 100) : ""
}

function eurosToMinor(value: string) {
  const amount = Number(value.replace(",", "."))
  return Number.isFinite(amount) && amount >= 0
    ? String(Math.round(amount * 100))
    : null
}

export function ProjectEditForm({
  project,
  categories,
  tags,
}: {
  project: PortalProjectDetail
  categories: PortalTaxonomyItem[]
  tags: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [categoryId, setCategoryId] = useState(project.categoryId ?? "")
  const [cityId, setCityId] = useState(project.cityId ?? "")
  const [countryCode, setCountryCode] = useState(project.countryCode ?? "IT")
  const [addressLine1, setAddressLine1] = useState(project.addressLine1 ?? "")
  const [postalCode, setPostalCode] = useState(project.postalCode ?? "")
  const [latitude, setLatitude] = useState(project.latitude ?? "")
  const [longitude, setLongitude] = useState(project.longitude ?? "")
  const [budget, setBudget] = useState(minorToEuros(project.budgetMinor))
  const [budgetPublic, setBudgetPublic] = useState(
    project.budgetPublic ?? false,
  )
  const [startsAt, setStartsAt] = useState(project.startsAt ?? "")
  const [estimatedEndAt, setEstimatedEndAt] = useState(
    project.estimatedEndAt ?? "",
  )
  const [deadlineAt, setDeadlineAt] = useState(
    project.deadlineAt?.slice(0, 16) ?? "",
  )
  const [projectStage, setProjectStage] = useState(project.projectStage ?? "")
  const [procurementStage, setProcurementStage] = useState(
    project.procurementStage ?? "",
  )
  const [sustainabilityTargets, setSustainabilityTargets] = useState(
    jsonNotes(project.sustainabilityTargets),
  )
  const [accessibilityRequirements, setAccessibilityRequirements] = useState(
    jsonNotes(project.accessibilityRequirements),
  )
  const [tagIds, setTagIds] = useState(project.tagIds)
  const [packages, setPackages] = useState(
    project.packages.map((item) => ({
      title: item.title,
      description: item.description ?? "",
      categoryId: item.categoryId,
      quantity: item.quantity ?? "",
      unit: item.unit ?? "",
      budget: minorToEuros(item.budgetMinor),
      currency: item.currency ?? project.currency ?? "EUR",
    })),
  )
  const [criteria, setCriteria] = useState(
    project.criteria.map((item) => ({
      label: item.label,
      description: item.description ?? "",
      kind: item.kind,
      weight: String(item.weight),
      required: item.required,
      sortOrder: item.sortOrder,
    })),
  )
  const [assets, setAssets] = useState<
    Array<{
      id: string
      name: string
      usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
    }>
  >(
    project.media.map((item) => ({
      id: item.assetId,
      name: item.name,
      usage: item.usage,
    })),
  )

  async function save() {
    if (!project.version) return
    setPending(true)
    setMessage(undefined)
    const result = await updateProjectAction(
      project.id,
      {
        title,
        description,
        categoryId,
        cityId,
        countryCode,
        addressLine1: addressLine1.trim() || null,
        postalCode: postalCode.trim() || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        budgetMinor: budget ? eurosToMinor(budget) : null,
        budgetPublic,
        currency: project.currency ?? "EUR",
        startsAt: startsAt || null,
        estimatedEndAt: estimatedEndAt || null,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
        projectStage: projectStage.trim() || null,
        procurementStage: procurementStage.trim() || null,
        sustainabilityTargets: sustainabilityTargets.trim()
          ? { notes: sustainabilityTargets.trim() }
          : {},
        accessibilityRequirements: accessibilityRequirements.trim()
          ? { notes: accessibilityRequirements.trim() }
          : {},
        tagIds,
        packages: packages.map((item) => ({
          title: item.title,
          description: item.description || null,
          categoryId: item.categoryId,
          quantity: item.quantity ? Number(item.quantity) : null,
          unit: item.unit || null,
          budgetMinor: item.budget ? eurosToMinor(item.budget) : null,
          currency: item.currency,
        })),
        criteria: criteria.map((item, index) => ({
          label: item.label,
          description: item.description || null,
          kind: item.kind,
          weight: item.kind === "COMPLIANCE" ? 0 : Number(item.weight),
          required: item.required,
          sortOrder: index,
        })),
        media: assets.map((item, position) => ({
          assetId: item.id,
          usage: item.usage ?? "DOCUMENT",
          position,
        })),
      },
      project.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.edit.saved") : result.message)
    if (result.ok) router.refresh()
  }

  return (
    <div className="max-h-[75vh] space-y-5 overflow-y-auto pe-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("dashboard.publish.title")}
          htmlFor="project-edit-title"
        >
          <Input
            id="project-edit-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.category")}
          htmlFor="project-edit-category"
        >
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="project-edit-category">
              <SelectValue />
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
      </div>
      <Field
        label={t("dashboard.publish.description")}
        htmlFor="project-edit-description"
      >
        <Textarea
          id="project-edit-description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.location")}
        htmlFor="project-edit-location"
      >
        <CityLocationField
          cityId={cityId || undefined}
          onChange={(next, meta) => {
            setCityId(next)
            if (meta?.countryCode) setCountryCode(meta.countryCode)
          }}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["addressLine1", addressLine1, setAddressLine1],
          ["postalCode", postalCode, setPostalCode],
          ["latitude", latitude, setLatitude],
          ["longitude", longitude, setLongitude],
          ["projectStage", projectStage, setProjectStage],
          ["procurementStage", procurementStage, setProcurementStage],
        ].map(([key, value, setter]) => (
          <Field
            key={String(key)}
            label={t(`dashboard.publish.${key}`)}
            htmlFor={`project-edit-${key}`}
          >
            <Input
              id={`project-edit-${key}`}
              value={String(value)}
              onChange={(event) =>
                (setter as (value: string) => void)(event.target.value)
              }
            />
          </Field>
        ))}
        <Field
          label={t("dashboard.publish.startsAt")}
          htmlFor="project-edit-start"
        >
          <Input
            id="project-edit-start"
            type="date"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.estimatedEndAt")}
          htmlFor="project-edit-end"
        >
          <Input
            id="project-edit-end"
            type="date"
            min={startsAt || undefined}
            value={estimatedEndAt}
            onChange={(event) => setEstimatedEndAt(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.deadline")}
          htmlFor="project-edit-deadline"
        >
          <Input
            id="project-edit-deadline"
            type="datetime-local"
            value={deadlineAt}
            onChange={(event) => setDeadlineAt(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.fields.budget")}
          htmlFor="project-edit-budget"
        >
          <Input
            id="project-edit-budget"
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={budgetPublic}
          onChange={(event) => setBudgetPublic(event.target.checked)}
        />
        {t("dashboard.publish.budgetPublic")}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("dashboard.publish.sustainabilityTargets")}
          htmlFor="project-edit-sustainability"
        >
          <Textarea
            id="project-edit-sustainability"
            value={sustainabilityTargets}
            onChange={(event) => setSustainabilityTargets(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.accessibilityRequirements")}
          htmlFor="project-edit-accessibility"
        >
          <Textarea
            id="project-edit-accessibility"
            value={accessibilityRequirements}
            onChange={(event) =>
              setAccessibilityRequirements(event.target.value)
            }
          />
        </Field>
      </div>
      {tags.length ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">
            {t("dashboard.publish.tags")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
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
                {taxonomyLabel(tag)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("dashboard.publish.packages")}</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setPackages((current) => [
                ...current,
                {
                  title: "",
                  description: "",
                  categoryId: null,
                  quantity: "",
                  unit: "",
                  budget: "",
                  currency: project.currency ?? "EUR",
                },
              ])
            }
          >
            {t("dashboard.publish.addPackage")}
          </Button>
        </div>
        {packages.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
          >
            <Input
              value={item.title}
              placeholder={t("dashboard.publish.packageTitle")}
              onChange={(event) =>
                setPackages((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? { ...row, title: event.target.value }
                      : row,
                  ),
                )
              }
            />
            <Input
              value={item.budget}
              placeholder={t("dashboard.publish.packageBudget")}
              onChange={(event) =>
                setPackages((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? { ...row, budget: event.target.value }
                      : row,
                  ),
                )
              }
            />
            <Textarea
              className="sm:col-span-2"
              value={item.description}
              placeholder={t("dashboard.publish.packageDescription")}
              onChange={(event) =>
                setPackages((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? { ...row, description: event.target.value }
                      : row,
                  ),
                )
              }
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setPackages((current) =>
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
          <h3 className="font-semibold">
            {t("dashboard.publish.criteriaTitle")}
          </h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setCriteria((current) => [
                ...current,
                {
                  label: "",
                  description: "",
                  kind: "COMPLIANCE",
                  weight: "0",
                  required: true,
                  sortOrder: current.length,
                },
              ])
            }
          >
            {t("dashboard.publish.addCriterion")}
          </Button>
        </div>
        {criteria.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
          >
            <Input
              value={item.label}
              placeholder={t("dashboard.publish.criterionLabel")}
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
                {(["COMPLIANCE", "TECHNICAL", "COMMERCIAL"] as const).map(
                  (kind) => (
                    <SelectItem key={kind} value={kind}>
                      {t(`dashboard.publish.criteria.${kind}`)}
                    </SelectItem>
                  ),
                )}
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
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setCriteria((current) =>
                  current.filter((_, rowIndex) => rowIndex !== index),
                )
              }
            >
              {t("common.remove")}
            </Button>
          </div>
        ))}
      </section>
      <AttachmentUpload assets={assets} onChange={setAssets} />
      <Button
        disabled={
          pending ||
          !title.trim() ||
          !description.trim() ||
          !categoryId ||
          !cityId
        }
        onClick={() => void save()}
      >
        {t("dashboard.edit.save")}
      </Button>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
    </div>
  )
}
