"use client"

import { CheckCheck, Inbox } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  portalNotificationHref,
  portalNotificationTitle,
} from "@/features/dashboard/notifications/notification-copy"
import { usePortalNotificationStore } from "@/features/dashboard/notifications/notification-store"
import {
  useMarkAllPortalNotificationsRead,
  usePortalNotifications,
  useSetPortalNotificationRead,
} from "@/features/dashboard/query/use-portal-notifications"
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
  const notifications = usePortalNotifications()
  const setReadMutation = useSetPortalNotificationRead()
  const markAllReadMutation = useMarkAllPortalNotificationsRead()

  useEffect(() => {
    if (items.length) return
    replace(initialItems, initialUnreadCount)
  }, [initialItems, initialUnreadCount, items.length, replace])

  useEffect(() => {
    if (!notifications.data) return
    replace(notifications.data.items, notifications.data.unreadCount)
  }, [notifications.data, replace])

  const mutationFailed = setReadMutation.isError || markAllReadMutation.isError

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-border/70 flex-row items-center justify-between gap-4 border-b bg-slate-50/55 dark:bg-white/[0.02]">
        <div className="min-w-0">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {unreadCount ? t("unread", { count: unreadCount }) : t("caughtUp")}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          disabled={!unreadCount || markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          {t("markAllRead")}
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-0">
        {mutationFailed ? (
          <p
            className="border-danger/15 bg-danger/5 text-danger border-b px-5 py-3 text-sm"
            role="alert"
          >
            {t("loadError")}
          </p>
        ) : null}
        {items.length ? (
          <ul className="divide-border/70 divide-y">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={portalNotificationHref(item.actionUrl)}
                  onClick={() => {
                    if (!item.readAt) {
                      setReadMutation.mutate({ id: item.id, read: true })
                    }
                  }}
                  className="flex min-h-16 items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 focus-visible:bg-slate-50/70 sm:px-5 dark:hover:bg-white/[0.025]"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      item.readAt ? "bg-border" : "bg-primary",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-brand-navy block text-sm leading-5 font-semibold">
                      {portalNotificationTitle(eventT, item.type)}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
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
          <div className="flex min-h-52 flex-col items-center justify-center px-4 py-10 text-center">
            <span className="border-primary/10 bg-primary/8 text-primary grid size-11 place-items-center rounded-xl border">
              <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="text-brand-navy mt-3 text-sm font-semibold">
              {t("empty")}
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-6">
              {t("emptyDescription")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
