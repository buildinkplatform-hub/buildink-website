import { create } from "zustand"

import type { PortalNotification } from "@/features/dashboard/data/portal-client"

interface NotificationState {
  items: PortalNotification[]
  unreadCount: number
  connected: boolean
  replace: (items: PortalNotification[], unreadCount: number) => void
  reset: () => void
  upsert: (item: PortalNotification) => void
  setRead: (id: string, read: boolean) => void
  markAllRead: () => void
  setConnected: (connected: boolean) => void
}

const workforceAlertTypes = new Set([
  "workforce.alert.created",
  "workforce.alert.escalated",
])

/**
 * Workforce alerts are company-scoped operational notifications. Historical
 * rows may contain a project-specific `/dashboard/projects/:id/alerts` URL,
 * which can become stale when the alert's project is no longer available to
 * the active workspace. Route them through the stable company alert inbox.
 */
export function normalizePortalNotification(
  item: PortalNotification,
): PortalNotification {
  if (
    workforceAlertTypes.has(item.type) &&
    item.actionUrl?.startsWith("/dashboard/projects/") &&
    item.actionUrl.endsWith("/alerts")
  ) {
    return { ...item, actionUrl: "/dashboard/operations/alerts" }
  }
  return item
}

export const usePortalNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  connected: false,
  replace: (items, unreadCount) =>
    set({ items: items.map(normalizePortalNotification), unreadCount }),
  reset: () => set({ items: [], unreadCount: 0, connected: false }),
  upsert: (incoming) =>
    set((state) => {
      const item = normalizePortalNotification(incoming)
      const existing = state.items.find((current) => current.id === item.id)
      return {
        items: [
          item,
          ...state.items.filter((current) => current.id !== item.id),
        ].slice(0, 50),
        unreadCount: existing
          ? state.unreadCount +
            (existing.readAt && !item.readAt
              ? 1
              : !existing.readAt && item.readAt
                ? -1
                : 0)
          : state.unreadCount + (item.readAt ? 0 : 1),
      }
    }),
  setRead: (id, read) =>
    set((state) => {
      const item = state.items.find((current) => current.id === id)
      if (!item || Boolean(item.readAt) === read) return state
      return {
        items: state.items.map((current) =>
          current.id === id
            ? { ...current, readAt: read ? new Date().toISOString() : null }
            : current,
        ),
        unreadCount: Math.max(0, state.unreadCount + (read ? -1 : 1)),
      }
    }),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),
  setConnected: (connected) => set({ connected }),
}))
