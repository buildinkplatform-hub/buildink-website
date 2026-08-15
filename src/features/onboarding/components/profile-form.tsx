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
import { getProfileSchema } from "@/features/onboarding/schemas/onboarding.schemas"
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
    | "companySearch"
  type?: "text" | "tel" | "number" | "url"
  optional?: boolean
  options?: readonly string[]
}

const commonFields: ProfileField[] = [
  { name: "phone", kind: "phone", type: "tel" },
  { name: "location", kind: "location" },
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
    { name: "companyId", kind: "companySearch", optional: true },
    { name: "primaryTrade" },
    { name: "categories", kind: "category" },
    { name: "yearsExperience", type: "number" },
    { name: "serviceRegions" },
    { name: "capabilityStatement", kind: "textarea" },
    { name: "availability" },
  ],
  supplier_contact: [
    ...commonFields,
    { name: "jobTitle" },
    {
      name: "organizationMode",
      kind: "select",
      options: ["select", "create", "claim"],
    },
    { name: "companyId", kind: "companySearch", optional: true },
    { name: "supplierName" },
    { name: "vatNumber", optional: true },
    { name: "categories", kind: "category" },
    { name: "serviceRegions" },
    { name: "businessDescription", kind: "textarea" },
  ],
  service_provider: [
    ...commonFields,
    { name: "providerIdentity" },
    {
      name: "organizationMode",
      kind: "select",
      options: ["select", "create", "claim"],
    },
    { name: "companyId", kind: "companySearch", optional: true },
    { name: "categories", kind: "category" },
    { name: "yearsExperience", type: "number" },
    { name: "professionalBackground", kind: "textarea" },
    { name: "serviceRegions" },
    { name: "capabilityStatement", kind: "textarea" },
    { name: "availability" },
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
}

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
  const fields = profileType ? fieldsByProfileType[profileType] : []
  const { control, register, handleSubmit, setValue } = useForm<
    Record<string, string>
  >({
    defaultValues: {
      ...defaultProfile,
      preferredLocale: draft.account.preferredLocale,
      ...draft.profile,
    },
  })
  const selectedCountry = useWatch({ control, name: "country" }) || "IT"
  const imagePreview =
    localImagePreview ??
    (remoteImagePreview?.assetId === draft.profileImage?.id
      ? remoteImagePreview?.url
      : undefined)

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

  if (!profileType)
    return (
      <div className="rounded-2xl bg-white p-8">
        <Link className="text-primary font-semibold" href="/onboarding/profile-type">
          {t("common.back")}
        </Link>
      </div>
    )

  const submit = handleSubmit(async (values) => {
    setPending(true)
    const parsed = getProfileSchema(profileType).safeParse(values)
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
        {fields.map((field) => {
          const id = `profile-${field.name}`
          const label = t(`onboarding.fields.${field.name}`)

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
                <Textarea id={id} {...register(field.name)} />
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
                      onCountryChange={(country) => setValue("country", country)}
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
                        if (meta?.countryCode) setValue("country", meta.countryCode)
                        if (meta?.regionLabel) setValue("region", meta.regionLabel)
                        if (meta?.cityLabel) setValue("city", meta.cityLabel)
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
                      <SelectTrigger id={id} onBlur={countryField.onBlur}>
                        <SelectValue />
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
                      subcategoryPlaceholder={t("onboarding.selectSubcategory")}
                    />
                  )}
                />
              ) : field.kind === "companySearch" ? (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: companyField }) => (
                    <CompanySearchField
                      id={id}
                      value={companyField.value}
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
                      <SelectTrigger id={id} onBlur={selectField.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {field.name === "preferredLocale"
                              ? localeMetadata[
                                  option as keyof typeof localeMetadata
                                ].nativeLabel
                              : t(`onboarding.options.${option}`)}
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
                className="bg-light-blue relative size-16 shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
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

function CompanySearchField({
  id,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  const t = useTranslations()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<
    Array<{ id: string; name: string; verificationStatus: string }>
  >([])
  const [selectedName, setSelectedName] = useState("")

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      void Promise.resolve().then(() => setResults([]))
      return
    }
    const handle = window.setTimeout(() => {
      void searchCompaniesAction(q)
        .then((items) => setResults(items))
        .catch(() => setResults([]))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={selectedName || query}
        placeholder={t("onboarding.searchCompany")}
        onChange={(event) => {
          setSelectedName("")
          onChange("")
          setQuery(event.target.value)
        }}
      />
      {selectedName ? (
        <p className="text-muted text-sm">{selectedName}</p>
      ) : null}
      {results.length > 0 ? (
        <ul className="border-line rounded-xl border bg-white p-1">
          {results.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                className="hover:bg-light-blue w-full rounded-lg px-3 py-2 text-start text-sm"
                onClick={() => {
                  onChange(company.id)
                  setSelectedName(company.name)
                  setQuery("")
                  setResults([])
                }}
              >
                {company.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
