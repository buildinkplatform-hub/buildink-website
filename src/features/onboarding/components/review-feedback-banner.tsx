"use client"

import { useTranslations } from "next-intl"

import { useOnboardingDraft } from "@/features/onboarding/components/onboarding-provider"
import { Link } from "@/i18n/navigation"

export function ReviewFeedbackBanner() {
  const t = useTranslations("onboarding.reviewFeedback")
  const { draft } = useOnboardingDraft()
  const feedback = draft.reviewFeedback
  if (!feedback?.issues.length && !feedback?.closedReason) return null

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{t("title")}</p>
          <p className="mt-1 text-amber-900">
            Update your profile details and documents, then submit again for review.
          </p>
        </div>
        <Link
          href="/onboarding/profile"
          className="rounded-xl bg-amber-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Update details
        </Link>
      </div>
      {feedback.closedReason ? (
        <p className="mt-2">{feedback.closedReason}</p>
      ) : null}
      {feedback.issues.length ? (
        <ul className="mt-3 list-disc space-y-1 ps-5">
          {feedback.issues.map((issue, index) => (
            <li key={`${issue.fieldPath}-${index}`}>
              {issue.fieldPath ? (
                <span className="font-medium">{issue.fieldPath}: </span>
              ) : null}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
