"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  getPortalVapidPublicKeyAction,
  registerPortalPushSubscriptionAction,
  unregisterPortalPushSubscriptionAction,
} from "@/features/dashboard/notifications/actions"

const AUTO_PROMPT_STORAGE_KEY = "buildink-portal-push-auto-prompted"

type PermissionState = NotificationPermission | "unsupported"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }
  return outputArray
}

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

function hasAutoPrompted() {
  try {
    return window.localStorage.getItem(AUTO_PROMPT_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function markAutoPrompted() {
  try {
    window.localStorage.setItem(AUTO_PROMPT_STORAGE_KEY, "1")
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
}

export function usePortalPushNotifications(enabled: boolean) {
  const [permission, setPermission] = useState<PermissionState>(
    isPushSupported() ? Notification.permission : "unsupported",
  )
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const syncPushRegistration = useCallback(async () => {
    if (!isPushSupported() || !enabled) return
    const registration = await navigator.serviceWorker.getRegistration("/sw.js")
    if (!registration) {
      setSubscribed(false)
      return
    }
    const pushHandle = await registration.pushManager.getSubscription()
    setSubscribed(Boolean(pushHandle))
    setPermission(Notification.permission)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !isPushSupported()) return

    const registerWorker = async () => {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      await syncPushRegistration()
    }

    void registerWorker()

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
        void syncPushRegistration()
      }
    }
    navigator.serviceWorker.addEventListener("message", handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage)
    }
  }, [enabled, syncPushRegistration])

  const subscribe = useCallback(async () => {
    if (!isPushSupported()) return false
    setLoading(true)
    try {
      const { publicKey } = await getPortalVapidPublicKeyAction()
      if (!publicKey) return false

      let nextPermission = Notification.permission
      if (nextPermission === "default") {
        nextPermission = await Notification.requestPermission()
      }
      setPermission(nextPermission)
      if (nextPermission !== "granted") return false

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })
      await navigator.serviceWorker.ready

      let pushHandle = await registration.pushManager.getSubscription()
      if (!pushHandle) {
        pushHandle = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      const json = pushHandle.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("Push registration payload is incomplete")
      }

      await registerPortalPushSubscriptionAction({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        userAgent: navigator.userAgent,
      })
      setSubscribed(true)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!isPushSupported()) return false
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js")
      const pushHandle = await registration?.pushManager.getSubscription()
      if (!pushHandle) {
        setSubscribed(false)
        return true
      }
      await unregisterPortalPushSubscriptionAction(pushHandle.endpoint)
      await pushHandle.unsubscribe()
      setSubscribed(false)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    supported: isPushSupported(),
    permission,
    subscribed,
    loading,
    subscribe,
    unsubscribe,
  }
}

export function PortalPushPermissionBootstrap() {
  const push = usePortalPushNotifications(true)
  const started = useRef(false)
  const { supported, subscribe } = push

  useEffect(() => {
    if (started.current || !supported) return
    const permission = Notification.permission
    if (permission === "denied") return
    if (permission === "granted") {
      started.current = true
      void subscribe()
      return
    }
    if (hasAutoPrompted()) return
    started.current = true
    markAutoPrompted()
    void subscribe()
  }, [supported, subscribe])

  return null
}
