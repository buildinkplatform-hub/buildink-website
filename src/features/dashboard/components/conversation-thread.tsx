"use client"

import { AlertCircle, Send } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { sendConversationMessageAction } from "@/features/dashboard/actions/message-thread.actions"
import { markPortalConversationReadAction } from "@/features/dashboard/actions/portal.actions"
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
  const updateConversation = usePortalMessageStore(
    (state) => state.updateConversation,
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
      const result = await sendConversationMessageAction(
        conversationId,
        next,
        clientMessageId,
      )
      if (result.ok) {
        const conversation = result.conversation
        setInitialMessages(
          conversation.id,
          conversation.messages.map((message) => ({
            ...message,
            conversationId: conversation.id,
          })),
        )
        updateConversation({
          id: conversation.id,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount: conversation.unreadCount,
        })
        setBody("")
      } else {
        setActionError(result.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      {actionError ? (
        <div
          className="border-danger/15 bg-danger/5 text-danger flex items-start gap-2 border-b px-4 py-3 text-sm sm:px-5"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="portal-scrollbar max-h-[min(60vh,560px)] min-h-[280px] space-y-3 overflow-y-auto bg-slate-50/35 px-4 py-5 sm:px-5 dark:bg-white/[0.015]">
        {messages.length ? (
          messages.map((message) => (
            <article
              key={message.id}
              className={
                message.mine
                  ? "ms-auto max-w-[85%] sm:max-w-[72%]"
                  : "me-auto max-w-[85%] sm:max-w-[72%]"
              }
            >
              <div
                className={
                  message.mine
                    ? "border-primary/15 bg-primary/8 rounded-2xl rounded-ee-md border px-4 py-3"
                    : "border-border/90 bg-card rounded-2xl rounded-es-md border px-4 py-3 shadow-[var(--shadow-xs)]"
                }
              >
                <p className="text-foreground text-sm leading-6 whitespace-pre-wrap">
                  {message.body}
                </p>
              </div>
              <p
                className={
                  message.mine
                    ? "text-muted-foreground mt-1 text-end text-[11px]"
                    : "text-muted-foreground mt-1 text-[11px]"
                }
              >
                {format.dateTime(new Date(message.sentAt), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </article>
          ))
        ) : (
          <div className="grid min-h-[240px] place-items-center text-center">
            <p className="text-muted-foreground text-sm">{t("emptyThread")}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-border/70 bg-card flex items-center gap-2 border-t p-3 sm:p-4"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <Input
          value={body}
          disabled={pending}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 shadow-none"
        />
        <Button
          type="submit"
          size="icon"
          className="size-11 min-h-11 shrink-0 rounded-xl"
          disabled={pending || !body.trim()}
          aria-label={sendLabel}
          title={sendLabel}
        >
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </Card>
  )
}
