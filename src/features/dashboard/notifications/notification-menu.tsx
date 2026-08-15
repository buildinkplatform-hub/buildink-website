"use client"

import { Bell, CheckCheck } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export function PortalNotificationMenu() {
  const t = useTranslations("dashboard.inbox")
  const eventT = useTranslations("dashboard.notificationEvents")
  const format = useFormatter()
  const items = usePortalNotificationStore((state) => state.items)
  const unreadCount = usePortalNotificationStore((state) => state.unreadCount)
  const replace = usePortalNotificationStore((state) => state.replace)
  const setRead = usePortalNotificationStore((state) => state.setRead)
  const markAllReadStore = usePortalNotificationStore(
    (state) => state.markAllRead,
  )
  const notifications = usePortalNotifications()
  const setReadMutation = useSetPortalNotificationRead()
  const markAllReadMutation = useMarkAllPortalNotificationsRead()

  useEffect(() => {
    if (!notifications.data) return
    replace(
      notifications.data.items.slice(0, 8),
      notifications.data.unreadCount,
    )
  }, [notifications.data, replace])

  const readAll = async () => {
    await markAllReadMutation.mutateAsync()
    markAllReadStore()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="relative"
          aria-label={t("open", { count: unreadCount })}
        >
          <Bell className="size-5" />
          {unreadCount ? (
            <span className="bg-danger absolute -end-1 -top-1 flex min-w-4 items-center justify-center rounded-full border-2 border-white px-1 text-[9px] leading-3 font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(390px,calc(100vw-1rem))] p-0"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-brand-navy text-sm font-semibold">
              {t("title")}
            </p>
            <p className="text-muted text-[11px]">
              {unreadCount
                ? t("unread", { count: unreadCount })
                : t("caughtUp")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!unreadCount || markAllReadMutation.isPending}
            onClick={() => void readAll()}
          >
            <CheckCheck className="size-3.5" />
            {t("markAllRead")}
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[min(65vh,420px)] overflow-y-auto p-1.5">
          {items.map((item) => (
            <DropdownMenuItem key={item.id} asChild className="p-0">
              <Link
                href={portalNotificationHref(item.actionUrl)}
                onClick={() => {
                  if (!item.readAt) {
                    setRead(item.id, true)
                    setReadMutation.mutate({ id: item.id, read: true })
                  }
                }}
                className="flex items-start gap-3 rounded-xl p-3"
              >
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    item.readAt ? "bg-transparent" : "bg-primary",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="text-brand-navy block text-xs font-semibold">
                    {portalNotificationTitle(eventT, item.type)}
                  </span>
                  <span className="text-muted mt-1 block text-[10px] font-medium">
                    {format.dateTime(new Date(item.createdAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
          {notifications.isError ? (
            <div className="px-4 py-8 text-center">
              <p className="text-danger text-sm">{t("loadError")}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => void notifications.refetch()}
              >
                {t("retry")}
              </Button>
            </div>
          ) : null}
          {!notifications.isError && !items.length ? (
            <p className="text-muted px-4 py-8 text-center text-sm">
              {notifications.isPending ? t("loading") : t("empty")}
            </p>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button asChild variant="ghost" className="w-full">
            <Link href="/dashboard/notifications">{t("viewAll")}</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
