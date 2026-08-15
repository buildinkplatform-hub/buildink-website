"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  markPortalConversationReadAction,
  sendPortalMessageAction,
} from "@/features/dashboard/actions/portal.actions"
import {
  usePortalMessageStore,
  type RealtimeMessage,
} from "@/features/dashboard/messages/message-store"

export function ConversationThread({
  conversationId,
  initialMessages,
  placeholder,
  sendLabel,
}: {
  conversationId: string
  initialMessages: RealtimeMessage[]
  placeholder: string
  sendLabel: string
}) {
  const t = useTranslations("dashboard.messages")
  const format = useFormatter()
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const storeMessages = usePortalMessageStore(
    (state) => state.messagesByConversation[conversationId],
  )
  const setInitialMessages = usePortalMessageStore(
    (state) => state.setInitialMessages,
  )
  const clearConversationUnread = usePortalMessageStore(
    (state) => state.clearConversationUnread,
  )

  useEffect(() => {
    setInitialMessages(conversationId, initialMessages)
  }, [conversationId, initialMessages, setInitialMessages])

  useEffect(() => {
    void markPortalConversationReadAction(conversationId).then((result) => {
      if (result.ok) clearConversationUnread(conversationId)
      else setActionError(result.message)
    })
  }, [clearConversationUnread, conversationId])

  const messages = useMemo(
    () => storeMessages ?? initialMessages,
    [initialMessages, storeMessages],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  async function send() {
    const next = body.trim()
    if (!next || pending) return
    setPending(true)
    setActionError(null)
    const clientMessageId = crypto.randomUUID()
    try {
      const result = await sendPortalMessageAction(
        conversationId,
        next,
        clientMessageId,
      )
      if (result.ok) setBody("")
      else setActionError(result.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <p className="text-danger text-sm" role="alert" aria-live="assertive">
          {actionError}
        </p>
      ) : null}
      <div className="border-line max-h-[min(60vh,520px)] space-y-3 overflow-y-auto rounded-2xl border bg-white/70 p-3">
        {messages.length ? (
          messages.map((message) => (
            <Card
              key={message.id}
              className={
                message.mine
                  ? "border-primary/20 bg-primary/5 ms-8 p-3"
                  : "border-line me-8 p-3"
              }
            >
              <p className="text-sm whitespace-pre-wrap">{message.body}</p>
              <p className="text-muted mt-1 text-xs">
                {format.dateTime(new Date(message.sentAt), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </Card>
          ))
        ) : (
          <p className="text-muted px-2 py-6 text-center text-sm">
            {t("emptyThread")}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          className="border-input bg-background min-h-11 flex-1 rounded-xl border px-3 text-sm"
        />
        <Button type="submit" disabled={pending || !body.trim()}>
          {sendLabel}
        </Button>
      </form>
    </div>
  )
}
