"use client"

import { MailCheck } from "lucide-react"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { resendVerificationAction } from "@/features/auth/actions/auth.actions"
import { isLocale } from "@/shared/constants/platform"

export default function VerifyEmailPage() {
  const requestedLocale = useLocale()
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const email = useSearchParams().get("email") ?? ""
  const [sent, setSent] = useState(false)
  return (
    <div className="border-line rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <MailCheck className="text-primary mx-auto size-12" />
      <h1 className="text-brand-navy mt-5 text-3xl font-bold">Verify your email</h1>
      <p className="text-muted mt-3 leading-7">Open the confirmation link sent to your email before starting onboarding.</p>
      {email ? <Button className="mt-7" variant="secondary" onClick={async () => { await resendVerificationAction(locale, email); setSent(true) }}>{sent ? "Email sent" : "Resend verification email"}</Button> : null}
    </div>
  )
}
