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
    <div className="auth-panel rounded-[30px] p-8 text-center sm:p-10">
      <div className="border-primary/10 bg-primary/6 mx-auto flex size-14 items-center justify-center rounded-2xl border">
        <MailCheck className="text-primary size-7" />
      </div>
      <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
        {t("verifyTitle")}
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-md leading-7">
        {t("verifyBody")}
      </p>
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
        <p
          className="text-danger border-danger/15 bg-danger/5 mt-4 rounded-xl border px-4 py-3 text-sm"
          role="alert"
        >
          {t("resendFailed")}
        </p>
      ) : null}
    </div>
  )
}
