"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  PortalFormActions,
  PortalInlineAlert,
} from "@/features/dashboard/components/portal-form-layout"
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
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error"
    message: string
  }>()
  const blocked = disabledReasons.length > 0

  async function submit() {
    if (!documentIds.length || blocked || pending) return
    setPending(true)
    setFeedback(undefined)
    try {
      const result = await submitVerificationAction({
        documentAssetIds: documentIds,
        applicantNotes: notes.trim() || undefined,
      })
      if (!result.ok) {
        setFeedback({
          tone: "error",
          message: "message" in result ? result.message : t("blockedTitle"),
        })
        return
      }
      setFeedback({ tone: "success", message: t("submitted") })
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5" aria-busy={pending}>
      <div>
        <h2 className="text-foreground text-base font-semibold tracking-[-0.015em]">
          {t("submitTitle")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t("submitSummary", {
            documents: documentIds.length,
            fulfilled: fulfilledRequiredCount,
            required: requiredCount,
            issues: issueCount,
          })}
        </p>
      </div>

      {blocked ? (
        <PortalInlineAlert tone="warning" title={t("blockedTitle")}>
          <ul className="list-inside list-disc space-y-1">
            {disabledReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </PortalInlineAlert>
      ) : null}

      <Field label={t("notesPlaceholder")} htmlFor="verification-notes">
        <Textarea
          id="verification-notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t("notesPlaceholder")}
          disabled={pending || blocked}
        />
      </Field>

      {feedback ? (
        <PortalInlineAlert
          tone={feedback.tone}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </PortalInlineAlert>
      ) : null}

      <PortalFormActions
        sticky={false}
        hint={blocked ? t("blockedTitle") : t("submitTitle")}
      >
        <Button
          type="button"
          disabled={pending || !documentIds.length || blocked}
          onClick={() => void submit()}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : null}
          {pending ? t("submitting") : t("submit")}
        </Button>
      </PortalFormActions>
    </div>
  )
}
