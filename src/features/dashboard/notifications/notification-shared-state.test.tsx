import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "@/messages/en"
import type { PortalNotification } from "@/features/dashboard/data/portal-client"
import { NotificationInbox } from "./notification-inbox"
import { PortalNotificationMenu } from "./notification-menu"
import { usePortalNotificationStore } from "./notification-store"

const usePortalNotifications = vi.hoisted(() => vi.fn())
const useSetPortalNotificationRead = vi.hoisted(() => vi.fn())
const useMarkAllPortalNotificationsRead = vi.hoisted(() => vi.fn())

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("@/features/dashboard/query/use-portal-notifications", () => ({
  usePortalNotifications,
  useSetPortalNotificationRead,
  useMarkAllPortalNotificationsRead,
}))

const items: PortalNotification[] = Array.from({ length: 10 }, (_, index) => ({
  id: `notification-${index + 1}`,
  type: "conversation.message",
  category: "messages",
  priority: "normal",
  actionUrl: "/dashboard/messages/conversation-1",
  payload: null,
  seenAt: null,
  readAt: null,
  createdAt: `2026-09-01T08:${String(index).padStart(2, "0")}:00.000Z`,
}))

beforeEach(() => {
  usePortalNotificationStore.getState().reset()
  usePortalNotifications.mockReset()
  useSetPortalNotificationRead.mockReset()
  useMarkAllPortalNotificationsRead.mockReset()

  usePortalNotifications.mockReturnValue({
    data: { items, unreadCount: items.length },
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  })
  useSetPortalNotificationRead.mockReturnValue({
    mutate: vi.fn(),
    isError: false,
    isPending: false,
  })
  useMarkAllPortalNotificationsRead.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ updated: items.length }),
    isError: false,
    isPending: false,
  })
})

function provider(children: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}

describe("portal notification shared state", () => {
  it("keeps all notifications in the shared store while the header previews eight", async () => {
    const user = userEvent.setup()
    render(provider(<PortalNotificationMenu />))

    const trigger = await screen.findByRole("button", {
      name: "Open notifications, 10 unread",
    })
    expect(usePortalNotificationStore.getState().items).toHaveLength(10)

    await user.click(trigger)

    expect(screen.getAllByText("New message")).toHaveLength(8)
    expect(usePortalNotificationStore.getState().items).toHaveLength(10)
  })

  it("renders the complete query-backed result on the Notifications page", async () => {
    render(
      provider(
        <NotificationInbox
          initialItems={items}
          initialUnreadCount={items.length}
        />,
      ),
    )

    expect(await screen.findAllByText("New message")).toHaveLength(10)
    expect(screen.getByText("10 unread")).toBeVisible()
    expect(usePortalNotificationStore.getState().items).toHaveLength(10)
  })
})
