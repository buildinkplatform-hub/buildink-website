import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "@/messages/en"
import { usePortalMessageStore } from "@/features/dashboard/messages/message-store"
import { ConversationThread } from "./conversation-thread"

const sendConversationMessageAction = vi.hoisted(() => vi.fn())
const markPortalConversationReadAction = vi.hoisted(() => vi.fn())

vi.mock("@/features/dashboard/actions/message-thread.actions", () => ({
  sendConversationMessageAction,
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  markPortalConversationReadAction,
}))

beforeEach(() => {
  usePortalMessageStore.setState({
    messagesByConversation: {},
    conversations: {
      "conversation-1": {
        id: "conversation-1",
        lastMessageAt: "2026-09-01T08:00:00.000Z",
        unreadCount: 1,
      },
    },
    totalUnread: 1,
  })
  sendConversationMessageAction.mockReset()
  markPortalConversationReadAction.mockReset()
  markPortalConversationReadAction.mockResolvedValue({ ok: true })
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  })
})

function renderThread() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      <ConversationThread
        conversationId="conversation-1"
        initialMessages={[
          {
            id: "message-1",
            conversationId: "conversation-1",
            senderId: "other-user",
            body: "Existing message",
            sentAt: "2026-09-01T08:00:00.000Z",
            mine: false,
          },
        ]}
        placeholder="Write a message"
        sendLabel="Send"
      />
    </NextIntlClientProvider>,
  )
}

describe("ConversationThread", () => {
  it("renders the authoritative sent message immediately after the action succeeds", async () => {
    const user = userEvent.setup()
    sendConversationMessageAction.mockResolvedValue({
      ok: true,
      conversation: {
        id: "conversation-1",
        subject: "Tender discussion",
        status: "OPEN",
        offerId: "offer-1",
        applicationId: null,
        contactUnlocked: true,
        unreadCount: 0,
        counterpart: null,
        lastMessageAt: "2026-09-01T08:05:00.000Z",
        messages: [
          {
            id: "message-1",
            senderId: "other-user",
            body: "Existing message",
            sentAt: "2026-09-01T08:00:00.000Z",
            mine: false,
          },
          {
            id: "message-2",
            senderId: "current-user",
            body: "Fresh response",
            sentAt: "2026-09-01T08:05:00.000Z",
            mine: true,
          },
        ],
      },
    })

    renderThread()

    const composer = screen.getByPlaceholderText("Write a message")
    await user.type(composer, "Fresh response")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByText("Fresh response")).toBeVisible()
    expect(composer).toHaveValue("")
    expect(sendConversationMessageAction).toHaveBeenCalledTimes(1)
    expect(sendConversationMessageAction).toHaveBeenCalledWith(
      "conversation-1",
      "Fresh response",
      expect.any(String),
    )
    expect(usePortalMessageStore.getState().totalUnread).toBe(0)
  })

  it("keeps the composer text and shows an alert when sending fails", async () => {
    const user = userEvent.setup()
    sendConversationMessageAction.mockResolvedValue({
      ok: false,
      code: "MESSAGE_FAILED",
      message: "Message could not be sent",
    })

    renderThread()

    const composer = screen.getByPlaceholderText("Write a message")
    await user.type(composer, "Please retry this")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent(
      "Message could not be sent",
    )
    expect(composer).toHaveValue("Please retry this")
  })
})
