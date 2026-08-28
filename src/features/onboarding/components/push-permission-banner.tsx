"use client"

import { BellRing, CheckCircle2, LoaderCircle, Settings } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { usePortalPushNotifications } from "@/features/dashboard/notifications/use-push-notifications"

export function OnboardingPushBanner() {
  const t = useTranslations("onboarding")
  const push = usePortalPushNotifications(true)

  if (!push.supported) return null

  if (push.permission === "denied") {
    return (
      <div className="border-line flex items-start gap-3 rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
        <span className="bg-light-blue text-primary grid size-10 shrink-0 place-items-center rounded-xl">
          <Settings className="size-5" />
        </span>
        <p className="text-muted pt-2 text-sm leading-6">{t("pushDenied")}</p>
      </div>
    )
  }

  if (push.permission === "granted" && push.subscribed) {
    return (
      <div className="border-line flex items-center gap-3 rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50">
          <CheckCircle2 className="size-5 text-emerald-600" />
        </span>
        <p className="text-brand-navy text-sm font-semibold">{t("pushDone")}</p>
      </div>
    )
  }

  return (
    <div className="border-line flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="bg-light-blue text-primary grid size-10 shrink-0 place-items-center rounded-xl">
          <BellRing className="size-5" />
        </span>
        <div>
          <p className="text-brand-navy font-semibold">{t("pushTitle")}</p>
          <p className="text-muted mt-1 text-sm leading-6">{t("pushBody")}</p>
        </div>
      </div>
      <Button
        type="button"
        className="shrink-0"
        disabled={push.loading}
        onClick={() => void push.subscribe()}
      >
        {push.loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {t("pushEnable")}
      </Button>
    </div>
  )
}
