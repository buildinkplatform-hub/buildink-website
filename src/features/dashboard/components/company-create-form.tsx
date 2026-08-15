"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CityLocationField } from "@/components/forms/city-location-field"
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
import { createWorkspaceAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalTaxonomyItem } from "@/features/dashboard/data/portal-client"

const companyTypes = [
  "GENERAL_CONTRACTOR",
  "SUBCONTRACTOR",
  "SUPPLIER",
  "EQUIPMENT",
  "PROFESSIONAL",
] as const

const steps = ["identity", "identifiers", "operations", "visibility"] as const

const visibilityKeys = [
  "publicProfileVisible",
  "websiteVisible",
  "legalNameVisible",
  "descriptionVisible",
  "logoVisible",
  "galleryVisible",
  "capabilitiesVisible",
  "catalogueVisible",
  "equipmentVisible",
  "projectsVisible",
  "reviewsVisible",
  "generalLocationVisible",
  "emailVisible",
  "phoneVisible",
  "exactAddressVisible",
  "identifiersVisible",
  "websiteUrlVisible",
  "businessHoursVisible",
  "searchEngineIndexable",
] as const

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

export function CompanyCreateForm({
  categories,
}: {
  categories: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [values, setValues] = useState({
    name: "",
    legalName: "",
    companyType: "GENERAL_CONTRACTOR" as (typeof companyTypes)[number],
    email: "",
    phone: "",
    website: "",
    vatNumber: "",
    registrationNumber: "",
    addressLine1: "",
    cityId: "",
    region: "",
    postalCode: "",
    description: "",
    categoryId: "",
    size: "1–10",
    timezone: "Europe/Rome",
    publicProfileVisible: false,
    websiteVisible: false,
    legalNameVisible: false,
    descriptionVisible: true,
    logoVisible: true,
    galleryVisible: true,
    capabilitiesVisible: true,
    catalogueVisible: false,
    equipmentVisible: false,
    projectsVisible: true,
    reviewsVisible: true,
    generalLocationVisible: true,
    emailVisible: false,
    phoneVisible: false,
    exactAddressVisible: false,
    identifiersVisible: false,
    websiteUrlVisible: true,
    businessHoursVisible: false,
    searchEngineIndexable: false,
  })

  function setField<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function canAdvance() {
    switch (step) {
      case 0:
        return values.name.trim().length >= 2 && values.email.trim().length > 0
      case 1:
        return true
      case 2:
        return (
          values.addressLine1.trim().length >= 5 && values.cityId.length > 0
        )
      case 3:
        return true
      default:
        return false
    }
  }

  async function submit() {
    setPending(true)
    const result = await createWorkspaceAction({
      name: values.name,
      legalName: values.legalName || null,
      companyType: values.companyType,
      email: values.email,
      phone: values.phone || null,
      website: values.website || null,
      vatNumber: values.vatNumber || null,
      registrationNumber: values.registrationNumber || null,
      addressLine1: values.addressLine1,
      cityId: values.cityId,
      region: values.region || null,
      postalCode: values.postalCode || null,
      description: values.description || null,
      categoryId: values.categoryId || null,
      size: values.size,
      timezone: values.timezone,
      visibility: {
        publicProfileVisible: values.publicProfileVisible,
        websiteVisible: values.websiteVisible,
        legalNameVisible: values.legalNameVisible,
        descriptionVisible: values.descriptionVisible,
        logoVisible: values.logoVisible,
        galleryVisible: values.galleryVisible,
        capabilitiesVisible: values.capabilitiesVisible,
        catalogueVisible: values.catalogueVisible,
        equipmentVisible: values.equipmentVisible,
        projectsVisible: values.projectsVisible,
        reviewsVisible: values.reviewsVisible,
        generalLocationVisible: values.generalLocationVisible,
        emailVisible: values.emailVisible,
        phoneVisible: values.phoneVisible,
        exactAddressVisible: values.exactAddressVisible,
        identifiersVisible: values.identifiersVisible,
        websiteUrlVisible: values.websiteUrlVisible,
        businessHoursVisible: values.businessHoursVisible,
        searchEngineIndexable: values.searchEngineIndexable,
      },
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    router.refresh()
    router.push("/dashboard/workspace")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {steps.map((key, index) => (
          <span
            key={key}
            className={step === index ? "text-primary" : "text-muted"}
          >
            {index + 1}. {t(`dashboard.companyForm.steps.${key}`)}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <Card className="space-y-4 p-5">
          <Field
            label={t("dashboard.workspace.name")}
            htmlFor="co-name"
            required
          >
            <Input
              id="co-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.legalName")} htmlFor="co-legal">
            <Input
              id="co-legal"
              value={values.legalName}
              onChange={(event) => setField("legalName", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.companyForm.companyType")}
            htmlFor="co-type"
            required
          >
            <Select
              value={values.companyType}
              onValueChange={(value) =>
                setField("companyType", value as (typeof companyTypes)[number])
              }
            >
              <SelectTrigger id="co-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`dashboard.companyForm.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={t("dashboard.workspace.email")}
            htmlFor="co-email"
            required
          >
            <Input
              id="co-email"
              type="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.phone")} htmlFor="co-phone">
            <Input
              id="co-phone"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.website")} htmlFor="co-website">
            <Input
              id="co-website"
              value={values.website}
              onChange={(event) => setField("website", event.target.value)}
            />
          </Field>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-4 p-5">
          <Field label={t("dashboard.workspace.vat")} htmlFor="co-vat">
            <Input
              id="co-vat"
              value={values.vatNumber}
              onChange={(event) => setField("vatNumber", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.registration")} htmlFor="co-reg">
            <Input
              id="co-reg"
              value={values.registrationNumber}
              onChange={(event) =>
                setField("registrationNumber", event.target.value)
              }
            />
          </Field>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-4 p-5">
          <Field label={t("dashboard.publish.category")} htmlFor="co-category">
            <Select
              value={values.categoryId}
              onValueChange={(value) => setField("categoryId", value)}
            >
              <SelectTrigger id="co-category">
                <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {labelOf(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={t("dashboard.publish.location")}
            htmlFor="co-location"
            required
          >
            <CityLocationField
              cityId={values.cityId || undefined}
              onChange={(cityId, meta) => {
                setField("cityId", cityId)
                if (meta?.regionLabel) setField("region", meta.regionLabel)
              }}
            />
          </Field>
          <Field
            label={t("dashboard.workspace.address")}
            htmlFor="co-address"
            required
          >
            <Input
              id="co-address"
              value={values.addressLine1}
              onChange={(event) => setField("addressLine1", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.companyForm.postalCode")}
            htmlFor="co-postal"
          >
            <Input
              id="co-postal"
              value={values.postalCode}
              onChange={(event) => setField("postalCode", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.publish.description")} htmlFor="co-desc">
            <Textarea
              id="co-desc"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-3 p-5">
          {visibilityKeys.map((key) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={values[key]}
                onChange={(event) => setField(key, event.target.checked)}
              />
              {t(`dashboard.workspace.visibility.${key}`)}
            </label>
          ))}
        </Card>
      ) : null}

      {message ? <p className="text-danger text-sm">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((current) => current - 1)}
          >
            {t("common.back")}
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button
            type="button"
            disabled={!canAdvance()}
            onClick={() => setStep((current) => current + 1)}
          >
            {t("common.continue")}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={pending || !canAdvance()}
            onClick={() => void submit()}
          >
            {t("dashboard.companyForm.create")}
          </Button>
        )}
      </div>
    </div>
  )
}
