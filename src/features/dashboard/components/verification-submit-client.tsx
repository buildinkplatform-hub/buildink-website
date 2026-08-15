"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitVerificationAction } from "@/features/dashboard/actions/portal.actions"

export function VerificationSubmitClient({
  documentIds,
}: {
  documentIds: string[]
}) {
  const t = useTranslations("dashboard.verification")
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  async function submit() {
    if (!documentIds.length) return
    setPending(true)
    const result = await submitVerificationAction({
      documentAssetIds: documentIds,
      applicantNotes: notes || undefined,
    })
    setPending(false)
    setMessage(result.ok ? t("submitted") : result.message)
    if (result.ok) router.refresh()
  }

  return (
    <div className="space-y-3">
      <h2 className="text-brand-navy font-semibold">{t("submitTitle")}</h2>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={t("notesPlaceholder")}
      />
      <Button
        disabled={pending || !documentIds.length}
        onClick={() => void submit()}
      >
        {t("submit")}
      </Button>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
    </div>
  )
}
