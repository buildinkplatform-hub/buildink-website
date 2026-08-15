"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { ConversationThread } from "@/features/dashboard/components/conversation-thread"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import type { PortalConversation } from "@/features/dashboard/data/portal-client"
import { usePortalMessageStore } from "@/features/dashboard/messages/message-store"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export function MessagesModuleClient({
  conversations,
  conversation,
  labels,
  emptyLabel,
  messagesLabel,
  counterpartLabel,
  lockedLabel,
  placeholder,
  sendLabel,
  detailId,
}: {
  conversations: PortalConversation[]
  conversation: PortalConversation | null
  labels: PortalTableLabels
  emptyLabel: string
  messagesLabel: string
  counterpartLabel: string
  lockedLabel: string
  placeholder: string
  sendLabel: string
  detailId?: string
}) {
  const t = useTranslations("dashboard.messages")
  const setConversations = usePortalMessageStore((state) => state.setConversations)
  const conversationSummaries = usePortalMessageStore((state) => state.conversations)

  useEffect(() => {
    setConversations(
      conversations.map((item) => ({
        id: item.id,
        lastMessageAt: item.lastMessageAt,
        unreadCount: item.unreadCount,
      })),
    )
  }, [conversations, setConversations])

  if (!conversations.length) {
    return <p className="text-muted">{emptyLabel}</p>
  }

  return (
    <div className="space-y-4">
      {!detailId ? (
        <PortalDataTable
          empty={emptyLabel}
          labels={labels}
          rows={conversations.map((item) => {
            const unreadCount =
              conversationSummaries[item.id]?.unreadCount ?? item.unreadCount
            return {
              id: item.id,
              title: item.subject || messagesLabel,
              secondary:
                item.counterpart?.displayName ?? counterpartLabel,
              meta:
                item.contactUnlocked && item.counterpart?.email
                  ? item.counterpart.email
                  : lockedLabel,
              detailHref: `/dashboard/messages/${item.id}`,
              badge: unreadCount > 0 ? String(unreadCount) : undefined,
            }
          })}
        />
      ) : (
        <Link
          href="/dashboard/messages"
          className="text-primary inline-flex text-sm font-semibold"
        >
          ← {labels.previous}
        </Link>
      )}
      {conversation ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-brand-navy text-lg font-bold">
                {conversation.subject || messagesLabel}
              </h2>
              <p className="text-muted text-sm">
                {conversation.counterpart?.displayName ?? counterpartLabel}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                "bg-primary/10 text-primary",
              )}
            >
              {t("live")}
            </span>
          </div>
          <ConversationThread
            conversationId={conversation.id}
            initialMessages={conversation.messages.map((message) => ({
              ...message,
              conversationId: conversation.id,
            }))}
            placeholder={placeholder}
            sendLabel={sendLabel}
          />
        </div>
      ) : detailId ? (
        <Card className="p-4">
          <p className="text-muted text-sm">{t("notFound")}</p>
        </Card>
      ) : null}
    </div>
  )
}
