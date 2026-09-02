import { beforeEach, describe, expect, it } from "vitest"

import {
  normalizePortalNotification,
  usePortalNotificationStore,
} from "./notification-store"

function notification(
  overrides: Partial<Parameters<typeof normalizePortalNotification>[0]> = {},
) {
  return {
    id: "notification-1",
    type: "conversation.message",
    category: "messages",
    priority: "normal",
    entityType: null,
    entityId: null,
    actionUrl: null,
    payload: {},
    actor: null,
    seenAt: null,
    readAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe("portal notification store", () => {
  beforeEach(() => {
    usePortalNotificationStore.getState().reset()
  })

  it("clears account-scoped notification state", () => {
    usePortalNotificationStore.setState({
      items: [notification()],
      unreadCount: 4,
      connected: true,
    })

    usePortalNotificationStore.getState().reset()

    expect(usePortalNotificationStore.getState()).toMatchObject({
      items: [],
      unreadCount: 0,
      connected: false,
    })
  })

  it("normalizes stale project workforce-alert links to the company alert inbox", () => {
    const item = notification({
      type: "workforce.alert.created",
      category: "workforce",
      actionUrl: "/dashboard/projects/project-1/alerts",
    })

    usePortalNotificationStore.getState().replace([item], 1)

    expect(usePortalNotificationStore.getState().items[0]?.actionUrl).toBe(
      "/dashboard/operations/alerts",
    )
  })

  it("normalizes realtime workforce-alert upserts too", () => {
    usePortalNotificationStore.getState().upsert(
      notification({
        id: "alert-2",
        type: "workforce.alert.escalated",
        category: "workforce",
        actionUrl: "/dashboard/projects/project-2/alerts",
      }),
    )

    expect(usePortalNotificationStore.getState().items[0]?.actionUrl).toBe(
      "/dashboard/operations/alerts",
    )
  })

  it("preserves unrelated notification action URLs", () => {
    const item = notification({
      type: "conversation.message",
      actionUrl: "/dashboard/messages/conversation-1",
    })

    expect(normalizePortalNotification(item).actionUrl).toBe(
      "/dashboard/messages/conversation-1",
    )
  })
})
