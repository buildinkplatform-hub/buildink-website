"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import {
  portalNotificationListContract,
  type PortalNotificationContract,
} from "./portal-contracts"
import { portalBrowserRequest } from "./portal-browser-api"
import { portalQueryKeys } from "./portal-query-keys"

const readResultContract = z.object({ id: z.string(), read: z.boolean() })
const readAllResultContract = z.object({
  updated: z.number().int().nonnegative(),
})

const defaultFilters = { page: 1, pageSize: 20 } as const

export function usePortalNotifications() {
  return useQuery({
    queryKey: portalQueryKeys.notifications(defaultFilters),
    queryFn: ({ signal }) =>
      portalBrowserRequest(
        "/api/v1/me/notifications?page=1&pageSize=20",
        portalNotificationListContract,
        { signal },
      ),
  })
}

export function useSetPortalNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      portalBrowserRequest(
        `/api/v1/me/notifications/${id}/${read ? "read" : "unread"}`,
        readResultContract,
        { method: "POST" },
      ),
    onMutate: async ({ id, read }) => {
      const key = portalQueryKeys.notifications(defaultFilters)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      queryClient.setQueryData(key, (current: unknown) => {
        const parsed = portalNotificationListContract.safeParse(current)
        if (!parsed.success) return current
        const item = parsed.data.items.find((candidate) => candidate.id === id)
        const wasUnread = item ? !item.readAt : false
        return {
          ...parsed.data,
          items: parsed.data.items.map((candidate) =>
            candidate.id === id
              ? { ...candidate, readAt: read ? new Date().toISOString() : null }
              : candidate,
          ),
          unreadCount: Math.max(
            0,
            parsed.data.unreadCount +
              (read ? (wasUnread ? -1 : 0) : wasUnread ? 0 : 1),
          ),
        }
      })
      return { previous, key }
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [...portalQueryKeys.all, "notifications"],
      }),
  })
}

export function useMarkAllPortalNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      portalBrowserRequest(
        "/api/v1/me/notifications/read-all",
        readAllResultContract,
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.setQueriesData(
        { queryKey: [...portalQueryKeys.all, "notifications"] },
        (current: unknown) => {
          const parsed = portalNotificationListContract.safeParse(current)
          if (!parsed.success) return current
          const readAt = new Date().toISOString()
          return {
            ...parsed.data,
            unreadCount: 0,
            items: parsed.data.items.map(
              (item: PortalNotificationContract) => ({
                ...item,
                readAt: item.readAt ?? readAt,
              }),
            ),
          }
        },
      )
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [...portalQueryKeys.all, "notifications"],
      }),
  })
}
