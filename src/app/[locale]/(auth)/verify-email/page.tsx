"use client"

import { MailCheck } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { resendVerificationAction } from "@/features/auth/actions/auth.actions"
import { isLocale } from "@/shared/constants/platform"

export default function VerifyEmailPage() {
  const requestedLocale = useLocale()
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const t = useTranslations("auth")
  const email = useSearchParams().get("email") ?? ""
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div className="border-line rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <MailCheck className="text-primary mx-auto size-12" />
      <h1 className="text-brand-navy mt-5 text-3xl font-bold">{t("verifyTitle")}</h1>
      <p className="text-muted mt-3 leading-7">{t("verifyBody")}</p>
      {email ? (
        <Button
          className="mt-7"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setFailed(false)
            startTransition(async () => {
              try {
                await resendVerificationAction(locale, email)
                setSent(true)
              } catch {
                setFailed(true)
              }
            })
          }}
        >
          {sent ? t("resent") : t("resend")}
        </Button>
      ) : null}
      {failed ? (
        <p className="text-danger mt-3 text-sm" role="alert">
          {t("resendFailed")}
        </p>
      ) : null}
    </div>
  )
}
