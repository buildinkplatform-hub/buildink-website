"use client"

import { BellRing } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePortalPushNotifications } from "@/features/dashboard/notifications/use-push-notifications"

export function PortalPushBanner() {
  const t = useTranslations("dashboard.inbox")
  const push = usePortalPushNotifications(true)

  if (!push.supported || (push.permission === "granted" && push.subscribed)) {
    return null
  }

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="bg-light-blue text-primary grid size-10 place-items-center rounded-xl">
          <BellRing className="size-5" />
        </span>
        <div>
          <p className="text-brand-navy font-semibold">{t("pushTitle")}</p>
          <p className="text-muted text-sm">
            {push.permission === "denied" ? t("pushDenied") : t("pushBody")}
          </p>
        </div>
      </div>
      {push.permission !== "denied" ? (
        <Button
          type="button"
          disabled={push.loading}
          onClick={() => void push.subscribe()}
        >
          {t("pushEnable")}
        </Button>
      ) : null}
    </Card>
  )
}
