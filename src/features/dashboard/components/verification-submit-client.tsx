"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitVerificationAction } from "@/features/dashboard/actions/portal.actions"

export function VerificationSubmitClient({
  documentIds,
  disabledReasons = [],
  issueCount = 0,
  requiredCount = 0,
  fulfilledRequiredCount = 0,
}: {
  documentIds: string[]
  disabledReasons?: string[]
  issueCount?: number
  requiredCount?: number
  fulfilledRequiredCount?: number
}) {
  const t = useTranslations("dashboard.verification")
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const blocked = disabledReasons.length > 0

  async function submit() {
    if (!documentIds.length || blocked) return
    setPending(true)
    setMessage(undefined)
    const result = await submitVerificationAction({
      documentAssetIds: documentIds,
      applicantNotes: notes || undefined,
    })
    setPending(false)
    setMessage(result.ok ? t("submitted") : result.message)
    if (result.ok) router.refresh()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-brand-navy font-semibold">{t("submitTitle")}</h2>
        <p className="text-muted mt-1 text-sm leading-6">
          {t("submitSummary", {
            documents: documentIds.length,
            fulfilled: fulfilledRequiredCount,
            required: requiredCount,
            issues: issueCount,
          })}
        </p>
      </div>
      {blocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950">
          <p className="font-semibold">{t("blockedTitle")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {disabledReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={t("notesPlaceholder")}
        disabled={pending || blocked}
      />
      <Button
        disabled={pending || !documentIds.length || blocked}
        onClick={() => void submit()}
      >
        {pending ? t("submitting") : t("submit")}
      </Button>
      {message ? (
        <p
          className={
            message === t("submitted")
              ? "text-success text-sm font-semibold"
              : "text-danger text-sm font-semibold"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
