"use server"

import {
  getPortalUnreadNotificationCount,
  getPortalVapidPublicKey,
  listMyReviews,
  listPortalNotifications,
  markAllPortalNotificationsRead,
  registerPortalPushSubscription,
  setPortalNotificationRead,
  unregisterPortalPushSubscription,
} from "@/features/dashboard/data/portal-client"

export async function listPortalNotificationsAction() {
  return listPortalNotifications({ page: 1, pageSize: 20 })
}

export async function getPortalUnreadCountAction() {
  return getPortalUnreadNotificationCount()
}

export async function setPortalNotificationReadAction(
  id: string,
  read: boolean,
) {
  return setPortalNotificationRead(id, read)
}

export async function markAllPortalNotificationsReadAction() {
  return markAllPortalNotificationsRead()
}

export async function getPortalVapidPublicKeyAction() {
  return getPortalVapidPublicKey()
}

export async function registerPortalPushSubscriptionAction(input: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}) {
  return registerPortalPushSubscription(input)
}

export async function unregisterPortalPushSubscriptionAction(endpoint: string) {
  return unregisterPortalPushSubscription(endpoint)
}

export async function listMyReviewsAction() {
  return listMyReviews({ page: 1, pageSize: 20 })
}
