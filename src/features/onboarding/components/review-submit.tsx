"use client"

import { CheckCircle2, FileText, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  saveConsentsAction,
  submitOnboardingAction,
} from "@/features/onboarding/actions/onboarding.actions"
import { Link } from "@/i18n/navigation"
import {
  isLocale,
  localeMetadata,
  primaryAccountTypeLabelKeys,
} from "@/shared/constants/platform"
import { accountTypeFromDraft } from "@/shared/lib/account-type-mapping"
import type { Locale } from "@/shared/types/platform"
import { OnboardingFrame } from "./onboarding-frame"
import { useOnboardingDraft } from "./onboarding-provider"

export function ReviewSubmit() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const { draft, updateDraft } = useOnboardingDraft()
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()
  const translatedOptions = new Set([
    "platform_only",
    "public_contact",
    "public",
    "private",
    "select",
    "create",
    "claim",
  ])
  const fieldLabels: Record<string, string> = {
    phone: t("onboarding.fields.phone"),
    country: t("onboarding.fields.country"),
    region: t("onboarding.fields.region"),
    city: t("onboarding.fields.city"),
    cityId: t("onboarding.fields.city"),
    preferredLocale: t("onboarding.fields.preferredLocale"),
    contactPreference: t("onboarding.fields.contactPreference"),
    bio: t("onboarding.fields.bio"),
    profileVisibility: t("onboarding.fields.profileVisibility"),
    interests: t("onboarding.fields.interests"),
    profession: t("onboarding.fields.profession"),
    skills: t("onboarding.fields.skills"),
    yearsExperience: t("onboarding.fields.yearsExperience"),
    availability: t("onboarding.fields.availability"),
    languages: t("onboarding.fields.languages"),
    contractorIdentity: t("onboarding.fields.contractorIdentity"),
    primaryTrade: t("onboarding.fields.primaryTrade"),
    categories: t("onboarding.fields.categories"),
    serviceRegions: t("onboarding.fields.serviceRegions"),
    capabilityStatement: t("onboarding.fields.capabilityStatement"),
    jobTitle: t("onboarding.fields.jobTitle"),
    organizationMode: t("onboarding.fields.organizationMode"),
    companyId: t("onboarding.fields.companyId"),
    supplierName: t("onboarding.fields.supplierName"),
    vatNumber: t("onboarding.fields.vatNumber"),
    businessDescription: t("onboarding.fields.businessDescription"),
    providerIdentity: t("onboarding.fields.providerIdentity"),
    professionalBackground: t("onboarding.fields.professionalBackground"),
    companyName: t("onboarding.fields.companyName"),
    companyLegalName: t("onboarding.fields.companyLegalName"),
    companyType: t("onboarding.fields.companyType"),
    companyRegistrationNumber: t("onboarding.fields.companyRegistrationNumber"),
    companyEmail: t("onboarding.fields.companyEmail"),
    companyPhone: t("onboarding.fields.companyPhone"),
    companyWebsite: t("onboarding.fields.companyWebsite"),
    companyCategoryId: t("onboarding.fields.companyCategoryId"),
    companySubcategoryId: t("onboarding.fields.companySubcategoryId"),
    companyCityId: t("onboarding.fields.companyLocation"),
    companyRegion: t("onboarding.fields.companyLocation"),
    companyLocation: t("onboarding.fields.companyLocation"),
    companyAddress: t("onboarding.fields.companyAddress"),
    companyDescription: t("onboarding.fields.companyDescription"),
    companyBusinessHours: t("onboarding.fields.companyBusinessHours"),
    companySize: t("onboarding.fields.companySize"),
    companyTimezone: t("onboarding.fields.companyTimezone"),
  }

  function fieldLabel(key: string) {
    return fieldLabels[key] ?? key.replace(/([A-Z])/g, " $1").trim()
  }

  function displayProfileValue(key: string, value: unknown) {
    if (
      key === "preferredLocale" &&
      typeof value === "string" &&
      isLocale(value)
    )
      return localeMetadata[value].nativeLabel
    if (key === "companySize" && typeof value === "string")
      return t(`onboarding.companySizes.${value.replace("+", "_plus")}`)
    if (key === "companyTimezone" && typeof value === "string")
      return t(`onboarding.timezones.${value.replace("/", "_")}`)
    if (key === "companyType" && typeof value === "string")
      return t(`onboarding.companyTypes.${value}`)
    if (typeof value === "string" && translatedOptions.has(value))
      return t(`onboarding.options.${value}`)
    return Array.isArray(value) ? value.join(", ") : String(value)
  }

  function shouldShowValue(value: unknown) {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "string") return value.trim().length > 0
    return value !== undefined && value !== null
  }

  if (!draft.profileType && !draft.primaryAccountType)
    return (
      <div className="rounded-2xl bg-white p-8">
        <Link
          href="/onboarding/profile-type"
          className="text-primary font-semibold"
        >
          {t("common.back")}
        </Link>
      </div>
    )

  const accountType = accountTypeFromDraft(draft)
  const accountTypeLabel = accountType
    ? t(primaryAccountTypeLabelKeys[accountType])
    : "—"

  const accountDetails = [
    ["Name", draft.account.name],
    ["Email", draft.account.email],
    [
      t("onboarding.fields.preferredLocale"),
      localeMetadata[draft.account.preferredLocale].nativeLabel,
    ],
    [t("onboarding.profileType"), accountTypeLabel],
  ] as const
  const profileDetails = Object.entries(draft.profile).filter(([, value]) =>
    shouldShowValue(value),
  )

  const submit = () => {
    if (
      !draft.consent.documentProcessing ||
      !draft.consent.terms ||
      !draft.consent.privacy
    )
      return setError(true)
    startTransition(async () => {
      const result = await saveConsentsAction(
        locale,
        draft.consent.documentProcessing,
        draft.account.marketing,
        draft.version,
        draft.consent.terms,
        draft.consent.privacy,
      )
      if (!result.success) return setError(true)
      await submitOnboardingAction(locale, result.draft.version)
    })
  }

  return (
    <OnboardingFrame step={4}>
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("onboarding.reviewTitle")}
      </h1>
      <p className="text-muted mt-3">{t("onboarding.reviewBody")}</p>
      <div className="mt-7 space-y-4">
        <section className="border-line rounded-xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-brand-navy font-bold">
              {t("onboarding.profileType")}
            </h2>
            <Link
              href="/onboarding/profile-type"
              className="text-primary text-sm font-semibold"
            >
              {t("onboarding.edit")}
            </Link>
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {accountDetails.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted text-xs font-semibold">{label}</dt>
                <dd className="text-brand-navy mt-1 text-sm" dir="auto">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="border-line rounded-xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-brand-navy font-bold">
              {t("onboarding.details")}
            </h2>
            <Link
              href="/onboarding/profile"
              className="text-primary text-sm font-semibold"
            >
              {t("onboarding.edit")}
            </Link>
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {profileDetails.map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted text-xs font-semibold">
                  {fieldLabel(key)}
                </dt>
                <dd className="text-brand-navy mt-1 text-sm" dir="auto">
                  {displayProfileValue(key, value)}
                </dd>
              </div>
            ))}
            {draft.profileImage ? (
              <div>
                <dt className="text-muted text-xs font-semibold">
                  {t("onboarding.fields.profileImage")}
                </dt>
                <dd className="text-brand-navy ltr-content mt-1 truncate text-sm">
                  {draft.profileImage.name}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
        <section className="border-line rounded-xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-brand-navy font-bold">
              {t("onboarding.documents")}
            </h2>
            <Link
              href="/onboarding/documents"
              className="text-primary text-sm font-semibold"
            >
              {t("onboarding.edit")}
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {draft.documents.map((document) => (
              <p
                key={document.id}
                className="text-muted flex items-center gap-2 text-sm"
              >
                <FileText className="size-4 shrink-0" />
                <span className="ltr-content truncate">{document.name}</span>
                <span>
                  · {t(`onboarding.options.${document.documentType}`)}
                </span>
              </p>
            ))}
            {draft.documents.map((document) => (
              <dl
                key={`${document.id}-metadata`}
                className="border-line/70 text-muted grid gap-2 rounded-xl border p-3 text-sm sm:grid-cols-2"
              >
                <div>
                  <dt className="text-xs font-semibold">
                    {t("onboarding.fields.documentType")}
                  </dt>
                  <dd>{t(`onboarding.options.${document.documentType}`)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold">
                    {t("onboarding.fields.ownerName")}
                  </dt>
                  <dd>{document.ownerName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold">
                    {t("onboarding.fields.issuingCountry")}
                  </dt>
                  <dd>{document.issuingCountry || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold">
                    {t("onboarding.fields.expiryDate")}
                  </dt>
                  <dd>{document.expiryDate || "-"}</dd>
                </div>
              </dl>
            ))}
          </div>
        </section>
      </div>
      <div className="border-warning/30 bg-warning/5 mt-6 rounded-xl border p-4 text-sm leading-6">
        <p className="text-brand-navy font-semibold">
          {t("onboarding.pendingTitle")}
        </p>
        <p className="text-muted mt-1">{t("onboarding.pendingBody")}</p>
      </div>
      <div className="bg-canvas mt-6 space-y-3 rounded-xl p-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
          <Checkbox
            checked={draft.consent.terms}
            onChange={(event) => {
              setError(false)
              updateDraft({
                consent: {
                  ...draft.consent,
                  terms: event.target.checked,
                },
              })
            }}
          />
          <span>
            {t("onboarding.termsConsent")}{" "}
            <span className="text-danger">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
          <Checkbox
            checked={draft.consent.privacy}
            onChange={(event) => {
              setError(false)
              updateDraft({
                consent: {
                  ...draft.consent,
                  privacy: event.target.checked,
                },
              })
            }}
          />
          <span>
            {t("onboarding.privacyConsent")}{" "}
            <span className="text-danger">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
          <Checkbox
            checked={draft.consent.publicProfile}
            onChange={(event) => {
              setError(false)
              updateDraft({
                consent: {
                  ...draft.consent,
                  publicProfile: event.target.checked,
                },
              })
            }}
          />
          {t("onboarding.publicConsent")}
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
          <Checkbox
            checked={draft.consent.documentProcessing}
            onChange={(event) => {
              setError(false)
              updateDraft({
                consent: {
                  ...draft.consent,
                  documentProcessing: event.target.checked,
                },
              })
            }}
          />
          <span>
            {t("onboarding.documentConsent")}{" "}
            <span className="text-danger">*</span>
          </span>
        </label>
        {error ? (
          <p role="alert" className="text-danger text-sm">
            {t("onboarding.errors.consent")}
          </p>
        ) : null}
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/documents">{t("common.back")}</Link>
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {t("onboarding.submit")}
        </Button>
      </div>
    </OnboardingFrame>
  )
}
