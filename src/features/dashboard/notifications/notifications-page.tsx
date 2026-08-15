import { getTranslations } from "next-intl/server"

import { listPortalNotifications } from "@/features/dashboard/data/portal-client"
import { MyReviewsPanel } from "@/features/dashboard/notifications/my-reviews-panel"
import { NotificationInbox } from "@/features/dashboard/notifications/notification-inbox"
import { PortalPushBanner } from "@/features/dashboard/notifications/push-banner"

export async function PortalNotificationsPage() {
  const t = await getTranslations()
  const result = await listPortalNotifications({ page: 1, pageSize: 20 })
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-brand-navy text-3xl font-bold">
          {t("dashboard.nav.notifications")}
        </h1>
        <p className="text-muted mt-2">
          {t("dashboard.descriptions.notifications")}
        </p>
      </div>
      <PortalPushBanner />
      <NotificationInbox
        initialItems={result.items}
        initialUnreadCount={result.unreadCount}
      />
      <MyReviewsPanel />
    </div>
  )
}
