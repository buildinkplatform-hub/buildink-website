import { AlertTriangle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Card, CardContent } from "@/components/ui/card"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { RetryButton } from "@/features/dashboard/components/marketplace-create"
import { listPortalNotifications } from "@/features/dashboard/data/portal-client"
import { MyReviewsPanel } from "@/features/dashboard/notifications/my-reviews-panel"
import { NotificationInbox } from "@/features/dashboard/notifications/notification-inbox"
import { PortalPushBanner } from "@/features/dashboard/notifications/push-banner"

export async function PortalNotificationsPage() {
  const t = await getTranslations()
  const result = await listPortalNotifications({ page: 1, pageSize: 20 }).catch(
    () => null,
  )

  return (
    <div className="w-full space-y-5">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.notifications")}
        description={t("dashboard.descriptions.notifications")}
      />
      <PortalPushBanner />
      {result ? (
        <NotificationInbox
          initialItems={result.items}
          initialUnreadCount={result.unreadCount}
        />
      ) : (
        <Card className="border-warning/25 bg-warning/[0.025]">
          <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <div className="flex items-start gap-3">
              <span className="border-warning/20 bg-warning/10 text-warning grid size-10 shrink-0 place-items-center rounded-xl border">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
              <p className="text-muted-foreground pt-1 text-sm leading-6">
                {t("dashboard.bootstrapUnavailable")}
              </p>
            </div>
            <RetryButton label={t("dashboard.retry")} />
          </CardContent>
        </Card>
      )}
      <MyReviewsPanel />
    </div>
  )
}
