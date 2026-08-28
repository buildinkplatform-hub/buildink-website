"use client"

import { Eye, LoaderCircle, Trash2 } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { startTransition, useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { FileInput } from "@/components/ui/file-input"
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
  deleteUploadAction,
  getUploadDownloadUrlAction,
  saveProfileAction,
  searchCompaniesAction,
} from "@/features/onboarding/actions/onboarding.actions"
import { AssetPreviewDialog } from "@/features/onboarding/components/asset-preview-dialog"
import { CategoryPicker } from "@/features/onboarding/components/category-picker"
import { PhoneInput } from "@/features/onboarding/components/phone-input"
import { CityLocationField } from "@/components/forms/city-location-field"
import { getProfileSchemaForAccountType } from "@/features/onboarding/schemas/onboarding.schemas"
import { uploadOnboardingFile } from "@/features/onboarding/data/upload-file"
import { Link, useRouter } from "@/i18n/navigation"
import {
  ALLOWED_PROFILE_IMAGE_TYPES,
  localeMetadata,
  MAX_PROFILE_IMAGE_SIZE,
} from "@/shared/constants/platform"
import { profileTypeForAccountType } from "@/shared/lib/account-type-mapping"
import type { OnboardingCatalog, ProfileType } from "@/shared/types/platform"
import { locales } from "@/shared/types/platform"
import { OnboardingFrame } from "./onboarding-frame"
import { useOnboardingDraft } from "./onboarding-provider"

interface ProfileField {
  name: string
  kind?:
    | "input"
    | "textarea"
    | "select"
    | "phone"
    | "country"
    | "location"
    | "category"
    | "companySelect"
    | "companyLocation"
    | "companyCategory"
    | "companySubcategory"
  type?: "text" | "tel" | "number" | "url" | "email"
  optional?: boolean
  options?: readonly string[]
}

const companySizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501+",
] as const
const companyTypeOptions = [
  "GENERAL_CONTRACTOR",
  "SUBCONTRACTOR",
  "SUPPLIER",
  "EQUIPMENT",
  "PROFESSIONAL",
] as const
const companyTimezoneOptions = [
  "Europe/Rome",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Bucharest",
  "Europe/Tirane",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Karachi",
  "America/New_York",
] as const

const companyAccountFields: ProfileField[] = [
  {
    name: "organizationMode",
    kind: "select",
    options: ["create", "select", "claim"],
  },
  { name: "companyId", kind: "companySelect" },
  { name: "companyName" },
  { name: "companyLegalName", optional: true },
  { name: "companyType", kind: "select", options: companyTypeOptions },
  { name: "companyRegistrationNumber", optional: true },
  { name: "vatNumber", optional: true },
  { name: "companyEmail", type: "email" },
  { name: "companyPhone", kind: "phone", type: "tel" },
  { name: "companyWebsite", type: "url", optional: true },
  { name: "companyCategoryId", kind: "companyCategory" },
  { name: "companySubcategoryId", kind: "companySubcategory", optional: true },
  { name: "companyLocation", kind: "companyLocation" },
  { name: "companyAddress", kind: "textarea" },
  { name: "companyDescription", kind: "textarea", optional: true },
  { name: "companyBusinessHours", kind: "textarea", optional: true },
  { name: "companySize", kind: "select", options: companySizeOptions },
  { name: "companyTimezone", kind: "select", options: companyTimezoneOptions },
]

const commonFields: ProfileField[] = [
  { name: "phone", kind: "phone", type: "tel" },
  { name: "country", kind: "country" },
  { name: "preferredLocale", kind: "select", options: locales },
  {
    name: "contactPreference",
    kind: "select",
    options: ["platform_only", "public_contact"],
  },
]

const fieldsByProfileType: Record<ProfileType, ProfileField[]> = {
  individual: [
    ...commonFields,
    { name: "bio", kind: "textarea", optional: true },
    {
      name: "profileVisibility",
      kind: "select",
      options: ["public", "private"],
    },
    { name: "interests", kind: "category" },
    { name: "companyId", kind: "companySelect" },
  ],
  worker: [
    ...commonFields,
    { name: "profession" },
    { name: "skills" },
    { name: "yearsExperience", type: "number" },
    { name: "availability" },
    { name: "languages" },
    { name: "bio", kind: "textarea" },
  ],
  contractor: [
    ...commonFields,
    { name: "contractorIdentity" },
    {
      name: "organizationMode",
      kind: "select",
      options: ["select", "create", "claim"],
    },
    { name: "companyId", kind: "companySelect" },
    { name: "primaryTrade" },
    { name: "categories", kind: "category" },
    { name: "yearsExperience", type: "number" },
    { name: "serviceRegions" },
    { name: "capabilityStatement", kind: "textarea" },
    { name: "availability" },
    { name: "companyLegalName", optional: true },
    { name: "companyRegistrationNumber", optional: true },
    { name: "companyEmail", type: "email" },
    { name: "companyPhone", kind: "phone", type: "tel" },
    { name: "companyWebsite", type: "url", optional: true },
    { name: "companyCategoryId", kind: "companyCategory" },
    {
      name: "companySubcategoryId",
      kind: "companySubcategory",
      optional: true,
    },
    { name: "companyLocation", kind: "companyLocation" },
    { name: "companyAddress", kind: "textarea" },
    { name: "companyBusinessHours", kind: "textarea", optional: true },
    { name: "companySize", kind: "select", options: companySizeOptions },
    {
      name: "companyTimezone",
      kind: "select",
      options: companyTimezoneOptions,
    },
  ],
  supplier_contact: [
    ...commonFields,
    { name: "jobTitle" },
    {
      name: "organizationMode",
      kind: "select",
      options: ["select", "create", "claim"],
    },
    { name: "companyId", kind: "companySelect" },
    { name: "supplierName" },
    { name: "vatNumber", optional: true },
    { name: "categories", kind: "category" },
    { name: "serviceRegions" },
    { name: "businessDescription", kind: "textarea" },
    { name: "companyLegalName", optional: true },
    { name: "companyRegistrationNumber", optional: true },
    { name: "companyEmail", type: "email" },
    { name: "companyPhone", kind: "phone", type: "tel" },
    { name: "companyWebsite", type: "url", optional: true },
    { name: "companyCategoryId", kind: "companyCategory" },
    {
      name: "companySubcategoryId",
      kind: "companySubcategory",
      optional: true,
    },
    { name: "companyLocation", kind: "companyLocation" },
    { name: "companyAddress", kind: "textarea" },
    { name: "companyBusinessHours", kind: "textarea", optional: true },
    { name: "companySize", kind: "select", options: companySizeOptions },
    {
      name: "companyTimezone",
      kind: "select",
      options: companyTimezoneOptions,
    },
  ],
  service_provider: [
    ...commonFields,
    { name: "providerIdentity" },
    {
      name: "organizationMode",
      kind: "select",
      options: ["select", "create", "claim"],
    },
    { name: "companyId", kind: "companySelect" },
    { name: "categories", kind: "category" },
    { name: "yearsExperience", type: "number" },
    { name: "professionalBackground", kind: "textarea" },
    { name: "serviceRegions" },
    { name: "capabilityStatement", kind: "textarea" },
    { name: "availability" },
    { name: "companyLegalName", optional: true },
    { name: "companyRegistrationNumber", optional: true },
    { name: "companyEmail", type: "email" },
    { name: "companyPhone", kind: "phone", type: "tel" },
    { name: "companyWebsite", type: "url", optional: true },
    { name: "companyCategoryId", kind: "companyCategory" },
    {
      name: "companySubcategoryId",
      kind: "companySubcategory",
      optional: true,
    },
    { name: "companyLocation", kind: "companyLocation" },
    { name: "companyAddress", kind: "textarea" },
    { name: "companyBusinessHours", kind: "textarea", optional: true },
    { name: "companySize", kind: "select", options: companySizeOptions },
    {
      name: "companyTimezone",
      kind: "select",
      options: companyTimezoneOptions,
    },
  ],
}

const defaultProfile = {
  phone: "+39",
  country: "IT",
  region: "",
  city: "",
  cityId: "",
  contactPreference: "platform_only",
  profileVisibility: "private",
  organizationMode: "create",
  bio: "",
  interests: "",
  categories: "",
  vatNumber: "",
  companyType: "GENERAL_CONTRACTOR",
}

const selectTriggerClassName = "h-12 min-h-12 rounded-2xl px-4 text-sm"

export function ProfileForm({ catalog }: { catalog: OnboardingCatalog }) {
  const t = useTranslations()
  const router = useRouter()
  const { draft, updateDraft } = useOnboardingDraft()
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [imageError, setImageError] = useState<string>()
  const [imageUploading, setImageUploading] = useState(false)
  const [imageDeleting, setImageDeleting] = useState(false)
  const [localImagePreview, setLocalImagePreview] = useState<string>()
  const [remoteImagePreview, setRemoteImagePreview] = useState<{
    assetId: string
    url: string
  }>()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const profileType: ProfileType | undefined =
    draft.profileType ??
    (draft.primaryAccountType
      ? profileTypeForAccountType(draft.primaryAccountType)
      : undefined)
  const canCreateCompany = draft.primaryAccountType === "COMPANY"
  const fields = profileType
    ? canCreateCompany
      ? companyAccountFields
      : fieldsByProfileType[profileType]
    : []
  const { control, register, handleSubmit, setValue } = useForm<
    Record<string, string>
  >({
    defaultValues: {
      ...defaultProfile,
      preferredLocale: draft.account.preferredLocale,
      ...draft.profile,
    },
  })
  const organizationMode = useWatch({ control, name: "organizationMode" })
  const companyCategoryId = useWatch({ control, name: "companyCategoryId" })
  const companyCategories = catalog.categories
  const companySubcategories =
    companyCategories.find((category) => category.id === companyCategoryId)
      ?.children ?? []
  const selectedCountry = useWatch({ control, name: "country" }) || "IT"
  const imagePreview =
    localImagePreview ??
    (remoteImagePreview?.assetId === draft.profileImage?.id
      ? remoteImagePreview?.url
      : undefined)

  const placeholderForField = (field: ProfileField, label: string) => {
    if (field.kind === "companySelect") return t("onboarding.selectCompany")
    if (field.kind === "select") return label
    if (field.kind === "country") return label
    if (field.kind === "companyCategory") return label
    if (field.kind === "companySubcategory") return label
    if (field.kind === "companyLocation") return label
    if (field.kind === "location") return label
    return label
  }

  const optionLabel = (field: ProfileField, option: string) => {
    if (field.name === "preferredLocale") {
      return localeMetadata[option as keyof typeof localeMetadata].nativeLabel
    }
    if (field.name === "companyTimezone") {
      return t(`onboarding.timezones.${option.replace("/", "_")}`)
    }
    if (field.name === "companySize") {
      return t(`onboarding.companySizes.${option.replace("+", "_plus")}`)
    }
    if (field.name === "companyType") {
      return t(`onboarding.companyTypes.${option}`)
    }
    return t(`onboarding.options.${option}`)
  }

  const optionsForField = (field: ProfileField) => {
    if (field.name === "organizationMode" && !canCreateCompany) {
      return ["select"] as const
    }
    return field.options
  }

  useEffect(() => {
    const assetId = draft.profileImage?.id
    if (!assetId) return
    let active = true
    startTransition(() => {
      void getUploadDownloadUrlAction(assetId)
        .then((result) => {
          if (active) setRemoteImagePreview({ assetId, url: result.url })
        })
        .catch(() => undefined)
    })
    return () => {
      active = false
    }
  }, [draft.profileImage?.id])

  useEffect(
    () => () => {
      if (localImagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(localImagePreview)
    },
    [localImagePreview],
  )

  useEffect(() => {
    if (organizationMode === "create") setValue("companyId", "")
  }, [organizationMode, setValue])

  useEffect(() => {
    if (!canCreateCompany) setValue("organizationMode", "select")
  }, [canCreateCompany, setValue])

  if (!profileType)
    return (
      <div className="rounded-2xl bg-white p-8">
        <Link
          className="text-primary font-semibold"
          href="/onboarding/profile-type"
        >
          {t("common.back")}
        </Link>
      </div>
    )

  const submit = handleSubmit(async (values) => {
    setPending(true)
    const parsed = getProfileSchemaForAccountType(
      draft.primaryAccountType ?? "PROJECT_OWNER",
      profileType,
    ).safeParse(values)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "")
        if (errors[field]) continue
        const errorKey =
          field === "phone"
            ? "phone"
            : field === "yearsExperience"
              ? "years"
              : "field"
        errors[field] = t(`onboarding.errors.${errorKey}`)
      }
      setValidationErrors(errors)
      setPending(false)
      return
    }

    setValidationErrors({})
    const result = await saveProfileAction(
      profileType,
      parsed.data as Record<string, unknown>,
      draft.version,
      draft.primaryAccountType,
    )
    if (!result.success) {
      setPending(false)
      return
    }
    updateDraft({
      profile: parsed.data as Record<string, unknown>,
      version: result.draft.version,
    })
    router.push("/onboarding/documents")
  })

  return (
    <OnboardingFrame step={2}>
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("onboarding.profileTitle")}
      </h1>
      <p className="text-muted mt-3">{t("onboarding.profileBody")}</p>
      <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
        {fields
          .filter((field) => {
            if (field.name === "companyId") return organizationMode !== "create"
            if (field.name.startsWith("company"))
              return canCreateCompany && organizationMode === "create"
            return true
          })
          .map((field) => {
            const id = `profile-${field.name}`
            const label = t(`onboarding.fields.${field.name}`)
            const placeholder = placeholderForField(field, label)

            return (
              <Field
                key={field.name}
                label={label}
                htmlFor={id}
                error={validationErrors[field.name]}
                required={!field.optional}
                hint={
                  field.kind === "location"
                    ? t("onboarding.hints.location")
                    : ["phone", "contactPreference"].includes(field.name)
                      ? `${t("onboarding.whyWeAsk")}: ${t(`onboarding.why.${field.name === "phone" ? "phone" : field.name}`)}${
                          field.name === "contactPreference"
                            ? ` · ${t("onboarding.visibilityPublic")}`
                            : ""
                        }`
                      : field.name === "phone"
                        ? t("onboarding.hints.phone")
                        : undefined
                }
              >
                {field.kind === "textarea" ? (
                  <Textarea
                    id={id}
                    placeholder={placeholder}
                    {...register(field.name)}
                  />
                ) : field.kind === "phone" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: phoneField }) => (
                      <PhoneInput
                        id={id}
                        value={phoneField.value}
                        countryCode={selectedCountry}
                        countries={catalog.countries}
                        onBlur={phoneField.onBlur}
                        onChange={phoneField.onChange}
                        onCountryChange={(country) =>
                          setValue("country", country)
                        }
                      />
                    )}
                  />
                ) : field.kind === "location" ? (
                  <Controller
                    name="cityId"
                    control={control}
                    render={({ field: locationField }) => (
                      <CityLocationField
                        cityId={locationField.value || undefined}
                        onChange={(nextCityId, meta) => {
                          locationField.onChange(nextCityId)
                          if (meta?.countryCode)
                            setValue("country", meta.countryCode)
                          if (meta?.regionLabel)
                            setValue("region", meta.regionLabel)
                          if (meta?.cityLabel) setValue("city", meta.cityLabel)
                        }}
                      />
                    )}
                  />
                ) : field.kind === "companyLocation" ? (
                  <Controller
                    name="companyCityId"
                    control={control}
                    render={({ field: locationField }) => (
                      <CityLocationField
                        cityId={locationField.value || undefined}
                        onChange={(nextCityId, meta) => {
                          locationField.onChange(nextCityId)
                          if (meta?.regionLabel)
                            setValue("companyRegion", meta.regionLabel)
                        }}
                      />
                    )}
                  />
                ) : field.kind === "country" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: countryField }) => (
                      <Select
                        value={countryField.value}
                        onValueChange={countryField.onChange}
                      >
                        <SelectTrigger
                          id={id}
                          onBlur={countryField.onBlur}
                          className={selectTriggerClassName}
                        >
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {catalog.countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.kind === "category" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: categoryField }) => (
                      <CategoryPicker
                        id={id}
                        value={categoryField.value}
                        categories={catalog.categories}
                        onBlur={categoryField.onBlur}
                        onChange={categoryField.onChange}
                        categoryPlaceholder={t("onboarding.selectCategory")}
                        subcategoryPlaceholder={t(
                          "onboarding.selectSubcategory",
                        )}
                        triggerClassName={selectTriggerClassName}
                      />
                    )}
                  />
                ) : field.kind === "companyCategory" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: categoryField }) => (
                      <Select
                        value={categoryField.value}
                        onValueChange={(value) => {
                          categoryField.onChange(value)
                          setValue("companySubcategoryId", "")
                        }}
                      >
                        <SelectTrigger
                          id={id}
                          onBlur={categoryField.onBlur}
                          className={selectTriggerClassName}
                        >
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {companyCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.kind === "companySubcategory" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: categoryField }) => (
                      <Select
                        value={categoryField.value}
                        onValueChange={categoryField.onChange}
                      >
                        <SelectTrigger
                          id={id}
                          onBlur={categoryField.onBlur}
                          className={selectTriggerClassName}
                        >
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {companySubcategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.kind === "companySelect" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: companyField }) => (
                      <CompanySelectField
                        id={id}
                        value={companyField.value}
                        placeholder={placeholder}
                        triggerClassName={selectTriggerClassName}
                        onBlur={companyField.onBlur}
                        onChange={companyField.onChange}
                      />
                    )}
                  />
                ) : field.kind === "select" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: selectField }) => (
                      <Select
                        value={selectField.value}
                        onValueChange={selectField.onChange}
                      >
                        <SelectTrigger
                          id={id}
                          onBlur={selectField.onBlur}
                          className={selectTriggerClassName}
                        >
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {optionsForField(field)?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {optionLabel(field, option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    id={id}
                    type={field.type ?? "text"}
                    placeholder={placeholder}
                    min={field.type === "number" ? 0 : undefined}
                    max={field.type === "number" ? 80 : undefined}
                    inputMode={field.type === "tel" ? "tel" : undefined}
                    {...register(field.name)}
                  />
                )}
              </Field>
            )
          })}
        <div className="space-y-2">
          <p className="text-brand-navy text-sm font-semibold">
            {t("onboarding.fields.profileImage")} ({t("common.optional")})
          </p>
          {draft.profileImage ? (
            <div className="border-line flex items-center gap-3 rounded-xl border p-3">
              <button
                type="button"
                className="bg-light-blue focus-visible:ring-primary/30 relative size-16 shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-3"
                aria-label={`${t("onboarding.viewFull")} ${draft.profileImage.name}`}
                onClick={() => setPreviewOpen(true)}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-primary flex size-full items-center justify-center text-xs font-bold">
                    {draft.profileImage.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {imageUploading || imageDeleting ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <LoaderCircle className="text-primary size-5 animate-spin" />
                  </div>
                ) : null}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-brand-navy ltr-content truncate text-sm font-semibold">
                  {draft.profileImage.name}
                </p>
                <p className="text-muted text-xs">
                  {(draft.profileImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`${t("onboarding.viewFull")} ${draft.profileImage.name}`}
                disabled={imageUploading || imageDeleting}
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="size-4" />
              </Button>
              <button
                type="button"
                className="text-muted hover:bg-danger/5 hover:text-danger flex size-11 shrink-0 items-center justify-center rounded-lg"
                aria-label={`${t("onboarding.remove")} ${draft.profileImage.name}`}
                disabled={imageUploading || imageDeleting}
                onClick={async () => {
                  if (!draft.profileImage) return
                  setImageDeleting(true)
                  await deleteUploadAction(draft.profileImage.id)
                  updateDraft({ profileImage: undefined })
                  setLocalImagePreview(undefined)
                  setRemoteImagePreview(undefined)
                  setPreviewOpen(false)
                  setImageDeleting(false)
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : null}
          <FileInput
            id="profile-image"
            variant="image"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            loading={imageUploading}
            disabled={imageDeleting}
            label={
              draft.profileImage?.name ?? t("onboarding.chooseProfileImage")
            }
            description={t("onboarding.profileImageRequirements")}
            onFilesSelected={async (files) => {
              const file = files?.[0]
              if (!file) return
              if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type))
                return setImageError(t("onboarding.errors.imageType"))
              if (file.size > MAX_PROFILE_IMAGE_SIZE)
                return setImageError(t("onboarding.errors.imageSize"))
              setImageUploading(true)
              setImageError(undefined)
              try {
                if (draft.profileImage) {
                  await deleteUploadAction(draft.profileImage.id).catch(
                    () => undefined,
                  )
                }
                const id = await uploadOnboardingFile(file, {
                  kind: "image",
                  purpose: "profile_image",
                })
                setLocalImagePreview(URL.createObjectURL(file))
                updateDraft({
                  profileImage: {
                    id,
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    purpose: "profile_image",
                    status: "uploaded",
                  },
                })
              } catch {
                setImageError(t("onboarding.errors.uploadFailed"))
              } finally {
                setImageUploading(false)
              }
            }}
          />
          {imageError ? (
            <p className="text-danger text-sm" role="alert">
              {imageError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button asChild variant="secondary">
            <Link href="/onboarding/profile-type">{t("common.back")}</Link>
          </Button>
          <Button disabled={pending || imageUploading || imageDeleting}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {t("common.saveContinue")}
          </Button>
        </div>
      </form>
      <AssetPreviewDialog
        asset={draft.profileImage}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        localUrl={imagePreview}
        labels={{
          preview: t("onboarding.preview"),
          loading: t("onboarding.previewLoading"),
          failed: t("onboarding.errors.previewFailed"),
          openNewTab: t("onboarding.openNewTab"),
          close: t("onboarding.closePreview"),
        }}
      />
    </OnboardingFrame>
  )
}

function CompanySelectField({
  id,
  value,
  placeholder,
  triggerClassName,
  onBlur,
  onChange,
}: {
  id: string
  value: string
  placeholder: string
  triggerClassName: string
  onBlur?: () => void
  onChange: (value: string) => void
}) {
  const t = useTranslations()
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string; verificationStatus: string }>
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      void searchCompaniesAction("")
        .then((items) => {
          if (active) setCompanies(items)
        })
        .catch(() => {
          if (active) setCompanies([])
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger id={id} onBlur={onBlur} className={triggerClassName}>
        <SelectValue
          placeholder={
            loading ? t("onboarding.companyOptionsLoading") : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {companies.length ? (
          companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="__empty" disabled>
            {t("onboarding.companyOptionsEmpty")}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
