"use client"

import { CheckCircle2, FileText, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { saveConsentsAction, submitOnboardingAction } from "@/features/onboarding/actions/onboarding.actions"
import { Link } from "@/i18n/navigation"
import {
  isLocale,
  localeMetadata,
  profileTypeLabelKeys,
} from "@/shared/constants/platform"
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

  function displayProfileValue(key: string, value: unknown) {
    if (key === "preferredLocale" && typeof value === "string" && isLocale(value))
      return localeMetadata[value].nativeLabel
    if (typeof value === "string" && translatedOptions.has(value)) return t(`onboarding.options.${value}`)
    return Array.isArray(value) ? value.join(", ") : String(value)
  }

  if (!draft.profileType)
    return (
      <div className="rounded-2xl bg-white p-8">
        <Link href="/onboarding/profile-type" className="text-primary font-semibold">
          {t("common.back")}
        </Link>
      </div>
    )

  const submit = () => {
    if (!draft.consent.documentProcessing)
      return setError(true)
    startTransition(async () => {
      const result = await saveConsentsAction(
        locale,
        draft.consent.documentProcessing,
        draft.account.marketing,
        draft.version,
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
          <p className="text-muted mt-2">
            {t(profileTypeLabelKeys[draft.profileType])}
          </p>
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
            {Object.entries(draft.profile).map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted text-xs font-semibold">
                  {t(`onboarding.fields.${key}`)}
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
          <input
            type="checkbox"
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
            className="accent-primary mt-1 size-4"
          />
          {t("onboarding.publicConsent")}
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
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
            className="accent-primary mt-1 size-4"
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
