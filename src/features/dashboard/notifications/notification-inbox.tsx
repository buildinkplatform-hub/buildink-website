"use client"

import { CheckCheck, Inbox } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  markAllPortalNotificationsReadAction,
  setPortalNotificationReadAction,
} from "@/features/dashboard/notifications/actions"
import {
  portalNotificationHref,
  portalNotificationTitle,
} from "@/features/dashboard/notifications/notification-copy"
import { usePortalNotificationStore } from "@/features/dashboard/notifications/notification-store"
import type { PortalNotification } from "@/features/dashboard/data/portal-client"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export function NotificationInbox({
  initialItems,
  initialUnreadCount,
}: {
  initialItems: PortalNotification[]
  initialUnreadCount: number
}) {
  const t = useTranslations("dashboard.inbox")
  const eventT = useTranslations("dashboard.notificationEvents")
  const format = useFormatter()
  const items = usePortalNotificationStore((state) => state.items)
  const unreadCount = usePortalNotificationStore((state) => state.unreadCount)
  const replace = usePortalNotificationStore((state) => state.replace)
  const setRead = usePortalNotificationStore((state) => state.setRead)
  const markAllReadStore = usePortalNotificationStore((state) => state.markAllRead)

  useEffect(() => {
    if (items.length) return
    replace(initialItems, initialUnreadCount)
  }, [initialItems, initialUnreadCount, items.length, replace])

  const readAll = async () => {
    await markAllPortalNotificationsReadAction()
    markAllReadStore()
  }

  return (
    <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-brand-navy font-bold">{t("title")}</h2>
          <p className="text-muted mt-1 text-sm">
            {unreadCount ? t("unread", { count: unreadCount }) : t("caughtUp")}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!unreadCount}
          onClick={() => void readAll()}
        >
          <CheckCheck className="size-4" />
          {t("markAllRead")}
        </Button>
      </div>
      {items.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={portalNotificationHref(item.actionUrl)}
                onClick={() => {
                  if (!item.readAt) {
                    setRead(item.id, true)
                    void setPortalNotificationReadAction(item.id, true)
                  }
                }}
                className="bg-canvas hover:bg-light-blue/70 flex items-start gap-3 rounded-2xl border border-transparent p-4 transition hover:border-slate-200/80"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    item.readAt ? "bg-transparent" : "bg-primary",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="text-brand-navy block text-sm font-semibold">
                    {portalNotificationTitle(eventT, item.type)}
                  </span>
                  <span className="text-muted mt-1 block text-xs">
                    {format.dateTime(new Date(item.createdAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <Inbox className="text-muted mb-2 size-6" />
          <p className="text-brand-navy text-sm font-semibold">{t("empty")}</p>
          <p className="text-muted mt-1 text-sm">{t("emptyDescription")}</p>
        </div>
      )}
    </Card>
  )
}
