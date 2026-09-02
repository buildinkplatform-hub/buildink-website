"use client"

import * as React from "react"
import { io, type Socket } from "socket.io-client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

import type { PortalNotification } from "@/features/dashboard/data/portal-client"
import {
  listPortalNotificationsAction,
  getPortalUnreadCountAction,
  unregisterPortalPushSubscriptionAction,
} from "@/features/dashboard/notifications/actions"
import { portalNotificationTitle } from "@/features/dashboard/notifications/notification-copy"
import { usePortalNotificationStore } from "@/features/dashboard/notifications/notification-store"
import {
  usePortalMessageStore,
  type RealtimeMessage,
} from "@/features/dashboard/messages/message-store"
import {
  usePortalSupportMessageStore,
  type RealtimeSupportMessage,
} from "@/features/dashboard/messages/support-message-store"
import { getBackendBaseUrl } from "@/lib/backend/url"
import { createClient } from "@/lib/supabase/client"

export function PortalRealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const replaceNotifications = usePortalNotificationStore(
    (state) => state.replace,
  )
  const resetNotifications = usePortalNotificationStore((state) => state.reset)
  const upsertNotification = usePortalNotificationStore((state) => state.upsert)
  const setNotificationConnected = usePortalNotificationStore(
    (state) => state.setConnected,
  )
  const appendMessage = usePortalMessageStore((state) => state.appendMessage)
  const updateConversation = usePortalMessageStore(
    (state) => state.updateConversation,
  )
  const resetMessages = usePortalMessageStore((state) => state.reset)
  const appendSupportMessage = usePortalSupportMessageStore(
    (state) => state.appendMessage,
  )
  const resetSupportMessages = usePortalSupportMessageStore(
    (state) => state.reset,
  )
  const eventT = useTranslations("dashboard.notificationEvents")

  React.useEffect(() => {
    let active = true
    let socket: Socket | undefined
    let unsubscribeAuth: (() => void) | undefined
    let viewerId: string | undefined
    let currentUserId: string | null = null

    const resetRealtimeAccountState = () => {
      resetNotifications()
      resetMessages()
      resetSupportMessages()
    }

    const refreshNotifications = async () => {
      try {
        const result = await listPortalNotificationsAction()
        if (active) replaceNotifications(result.items, result.unreadCount)
      } catch {
        // Session expiry is handled by the protected layout.
      }
    }

    const connectSocket = (token: string) => {
      socket?.disconnect()
      socket = io(`${getBackendBaseUrl()}/realtime`, {
        transports: ["websocket"],
        auth: { token },
        reconnection: true,
      })

      socket.on("connect", () => setNotificationConnected(true))
      socket.on("disconnect", () => setNotificationConnected(false))
      socket.on("connect_error", () => setNotificationConnected(false))

      socket.on("notification.created", (notification: PortalNotification) => {
        upsertNotification(notification)
        if (
          notification.type === "conversation.message" ||
          notification.type === "portal.support_reply"
        ) {
          toast.info(portalNotificationTitle(eventT, notification.type))
        } else if (["high", "critical"].includes(notification.priority)) {
          toast.info(portalNotificationTitle(eventT, notification.type))
        }
      })

      socket.on("notification.updated", (notification: PortalNotification) => {
        upsertNotification(notification)
      })

      socket.on("message.created", (message: RealtimeMessage) => {
        appendMessage(message, viewerId)
      })

      socket.on(
        "conversation.updated",
        (summary: {
          id: string
          lastMessageAt: string | null
          unreadCount: number
        }) => {
          updateConversation(summary)
        },
      )

      socket.on(
        "support.message.created",
        (message: RealtimeSupportMessage) => {
          appendSupportMessage(message)
        },
      )

      socket.io.on("reconnect", () => void refreshNotifications())
    }

    const connect = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const session = data.session
      const token = session?.access_token
      viewerId = session?.user.id
      currentUserId = session?.user.id ?? null

      if (!token || !currentUserId || !active) {
        resetRealtimeAccountState()
        return
      }

      // A provider mount can occur after an in-tab account transition. Clear
      // every account-scoped realtime store before loading the current user.
      resetRealtimeAccountState()
      await refreshNotifications()
      if (!active) return
      connectSocket(token)

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, nextSession: Session | null) => {
          if (!active) return
          const nextUserId = nextSession?.user.id ?? null
          const nextToken = nextSession?.access_token
          viewerId = nextSession?.user.id

          if (!nextUserId || !nextToken) {
            currentUserId = null
            socket?.disconnect()
            socket = undefined
            resetRealtimeAccountState()

            if (_event === "SIGNED_OUT") {
              const registration =
                await navigator.serviceWorker?.getRegistration("/sw.js")
              const pushHandle =
                await registration?.pushManager.getSubscription()
              if (pushHandle) {
                await unregisterPortalPushSubscriptionAction(
                  pushHandle.endpoint,
                ).catch(() => undefined)
                await pushHandle.unsubscribe().catch(() => undefined)
              }
            }
            return
          }

          const accountChanged = currentUserId !== nextUserId
          currentUserId = nextUserId
          if (accountChanged) {
            resetRealtimeAccountState()
            await refreshNotifications()
          }
          if (!active) return
          connectSocket(nextToken)
        },
      )

      unsubscribeAuth = () => {
        authListener.subscription.unsubscribe()
      }
    }

    const scheduleConnect = () => {
      void connect()
    }
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(scheduleConnect, { timeout: 2500 })
    } else {
      timeoutId = setTimeout(scheduleConnect, 1200)
    }

    const poll = setInterval(() => {
      void getPortalUnreadCountAction()
        .then(({ count }) => {
          if (!usePortalNotificationStore.getState().connected) {
            const state = usePortalNotificationStore.getState()
            replaceNotifications(state.items, count)
          }
        })
        .catch(() => undefined)
    }, 60_000)

    return () => {
      active = false
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) clearTimeout(timeoutId)
      clearInterval(poll)
      unsubscribeAuth?.()
      socket?.disconnect()
      resetRealtimeAccountState()
    }
  }, [
    appendMessage,
    appendSupportMessage,
    eventT,
    replaceNotifications,
    resetMessages,
    resetNotifications,
    resetSupportMessages,
    setNotificationConnected,
    updateConversation,
    upsertNotification,
  ])

  return children
}
