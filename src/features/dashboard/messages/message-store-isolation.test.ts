import { beforeEach, describe, expect, it } from "vitest"

import { usePortalMessageStore } from "./message-store"
import { usePortalSupportMessageStore } from "./support-message-store"

describe("portal realtime message isolation", () => {
  beforeEach(() => {
    usePortalMessageStore.getState().reset()
    usePortalSupportMessageStore.getState().reset()
  })

  it("clears conversation summaries and message bodies when the account boundary resets", () => {
    usePortalMessageStore.getState().setConversations([
      {
        id: "conversation-a",
        lastMessageAt: "2026-09-01T10:00:00.000Z",
        unreadCount: 2,
      },
    ])
    usePortalMessageStore.getState().setInitialMessages("conversation-a", [
      {
        id: "message-a",
        conversationId: "conversation-a",
        senderId: "user-a",
        body: "private account A message",
        sentAt: "2026-09-01T10:00:00.000Z",
      },
    ])

    usePortalMessageStore.getState().reset()

    expect(usePortalMessageStore.getState().messagesByConversation).toEqual({})
    expect(usePortalMessageStore.getState().conversations).toEqual({})
    expect(usePortalMessageStore.getState().totalUnread).toBe(0)
  })

  it("clears support ticket messages when the account boundary resets", () => {
    usePortalSupportMessageStore.getState().setInitialMessages("ticket-a", [
      {
        id: "support-a",
        ticketId: "ticket-a",
        authorId: "support-user",
        author: "Support",
        body: "private ticket reply",
        createdAt: "2026-09-01T10:00:00.000Z",
        internalNote: false,
      },
    ])

    usePortalSupportMessageStore.getState().reset()

    expect(usePortalSupportMessageStore.getState().messagesByTicket).toEqual({})
  })
})
