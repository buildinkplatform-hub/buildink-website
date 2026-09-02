"use client"

import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"

import { StatusBadge } from "@/features/dashboard/components/status-badge"

export type VerificationRequirement = {
  documentType: string
  required: boolean
  expiryRequired: boolean
  uploaded: boolean
}

function documentLabel(
  documentType: string,
  t: ReturnType<typeof useTranslations>,
) {
  switch (documentType.toLowerCase()) {
    case "identity":
      return t("onboarding.options.identity")
    case "certificate":
      return t("onboarding.options.certificate")
    case "license":
      return t("onboarding.options.license")
    case "company_authorization":
      return t("onboarding.options.company_authorization")
    case "trade_proof":
      return t("onboarding.options.trade_proof")
    case "professional_proof":
      return t("onboarding.options.professional_proof")
    case "registration":
      return t("onboarding.options.registration")
    case "vat_proof":
      return t("onboarding.options.vat_proof")
    case "other":
      return t("onboarding.options.other")
    default:
      return documentType.replaceAll("_", " ")
  }
}

export function VerificationRequirements({
  requirements,
}: {
  requirements: VerificationRequirement[]
}) {
  const t = useTranslations()

  return (
    <section
      className="space-y-3"
      aria-labelledby="verification-requirements-title"
    >
      <h2
        id="verification-requirements-title"
        className="text-brand-navy text-sm font-semibold"
      >
        {t("dashboard.trust.requirements")}
      </h2>
      {requirements.map((item) => {
        const label = documentLabel(item.documentType, t)
        const requirementMeta = item.required
          ? item.expiryRequired
            ? `${t("common.required")} · ${t("dashboard.trust.expiryRequired")}`
            : t("common.required")
          : t("dashboard.verification.optional")
        return (
          <div
            key={item.documentType}
            data-document-type={item.documentType}
            className="border-line/70 hover:border-primary/25 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-50/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl"
              >
                <FileText className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-brand-navy truncate text-sm font-semibold">
                  {label}
                </p>
                <p className="text-muted mt-0.5 text-xs">{requirementMeta}</p>
              </div>
            </div>
            <StatusBadge
              status={item.uploaded ? "UPLOADED" : "MISSING"}
              label={
                item.uploaded
                  ? t("dashboard.trust.uploaded")
                  : t("dashboard.trust.missing")
              }
            />
          </div>
        )
      })}
    </section>
  )
}
