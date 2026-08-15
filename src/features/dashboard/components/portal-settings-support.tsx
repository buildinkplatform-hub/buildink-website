"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useFormatter, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  replySupportTicketAction,
  updateNotificationPreferencesAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalNotificationPreferences } from "@/features/dashboard/data/portal-client"
import {
  usePortalSupportMessageStore,
  type RealtimeSupportMessage,
} from "@/features/dashboard/messages/support-message-store"
import { Link } from "@/i18n/navigation"

export function SettingsModuleClient({
  preferences,
}: {
  preferences: PortalNotificationPreferences | null
}) {
  const t = useTranslations("dashboard.settings")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [values, setValues] = useState({
    emailEnabled: preferences?.emailEnabled ?? true,
    pushEnabled: preferences?.pushEnabled ?? true,
    inAppEnabled: preferences?.inAppEnabled ?? true,
    marketingEnabled: preferences?.marketingEnabled ?? false,
    digestFrequency: preferences?.digestFrequency ?? "DAILY",
  })

  async function save() {
    if (!preferences) return
    setPending(true)
    setMessage(undefined)
    const result = await updateNotificationPreferencesAction({
      ...values,
      version: preferences.version,
    })
    setPending(false)
    setMessage(result.ok ? t("saved") : result.message)
    if (result.ok) router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("account")}
        </h2>
        <p className="text-muted text-sm">{t("accountHint")}</p>
        <Link
          href="/dashboard/profile"
          className="text-primary text-sm font-semibold"
        >
          {t("editProfile")} →
        </Link>
      </Card>
      <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("notifications")}
        </h2>
        {preferences ? (
          <div className="space-y-3">
            {(
              [
                ["emailEnabled", t("emailEnabled")],
                ["pushEnabled", t("pushEnabled")],
                ["inAppEnabled", t("inAppEnabled")],
                ["marketingEnabled", t("marketingEnabled")],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={values[key]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                />
                {label}
              </label>
            ))}
            <Field label={t("digestFrequency")} htmlFor="digest-frequency">
              <Select
                value={values.digestFrequency}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    digestFrequency: value as typeof values.digestFrequency,
                  }))
                }
              >
                <SelectTrigger id="digest-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["IMMEDIATE", "DAILY", "WEEKLY", "MONTHLY", "OFF"].map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {t(`digest.${value}`)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Button disabled={pending} onClick={() => void save()}>
              {t("save")}
            </Button>
            {message ? <p className="text-muted text-sm">{message}</p> : null}
          </div>
        ) : (
          <p className="text-muted text-sm">{t("prefsUnavailable")}</p>
        )}
      </Card>
      <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("privacy")}
        </h2>
        <Link
          href="/dashboard/profile"
          className="text-primary text-sm font-semibold"
        >
          {t("visibilitySettings")} →
        </Link>
      </Card>
    </div>
  )
}

export function SupportTicketCreateForm({
  onCreated,
}: {
  onCreated?: () => void
}) {
  const t = useTranslations("dashboard.support")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("technical")
  const [body, setBody] = useState("")

  async function submit() {
    setPending(true)
    const { createSupportTicketAction } =
      await import("@/features/dashboard/actions/portal.actions")
    const result = await createSupportTicketAction({ subject, category, body })
    setPending(false)
    if (result.ok) {
      setSubject("")
      setBody("")
      onCreated?.()
      router.refresh()
    }
  }

  return (
    <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
      <h2 className="text-brand-navy text-lg font-semibold">{t("create")}</h2>
      <Field label={t("subject")} htmlFor="support-subject">
        <Input
          id="support-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </Field>
      <Field label={t("category")} htmlFor="support-category">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="support-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "account",
              "billing",
              "marketplace",
              "verification",
              "technical",
              "other",
            ].map((value) => (
              <SelectItem key={value} value={value}>
                {t(`categories.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("message")} htmlFor="support-body">
        <Textarea
          id="support-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </Field>
      <Button
        disabled={pending || subject.length < 4 || body.length < 8}
        onClick={() => void submit()}
      >
        {t("submit")}
      </Button>
    </Card>
  )
}

export function SupportConversation({
  ticketId,
  messages,
}: {
  ticketId: string
  messages: Array<{
    id: string
    author: string
    body: string
    createdAt: string
  }>
}) {
  const t = useTranslations("dashboard.support")
  const format = useFormatter()
  const [reply, setReply] = useState("")
  const [pending, setPending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const storeMessages = usePortalSupportMessageStore(
    (state) => state.messagesByTicket[ticketId],
  )
  const setInitialMessages = usePortalSupportMessageStore(
    (state) => state.setInitialMessages,
  )

  useEffect(() => {
    setInitialMessages(
      ticketId,
      messages.map((message) => ({
        ...message,
        ticketId,
        authorId: null,
        internalNote: false,
      })),
    )
  }, [messages, setInitialMessages, ticketId])

  const threadMessages = useMemo<RealtimeSupportMessage[]>(
    () => storeMessages ?? messages.map((message) => ({
      ...message,
      ticketId,
      authorId: null,
      internalNote: false,
    })),
    [messages, storeMessages, ticketId],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threadMessages.length])

  async function send() {
    if (!reply.trim() || pending) return
    setPending(true)
    await replySupportTicketAction(ticketId, reply.trim())
    setReply("")
    setPending(false)
  }

  return (
    <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
      <div className="border-line max-h-[min(60vh,520px)] space-y-3 overflow-y-auto rounded-2xl border bg-white/70 p-3">
        {threadMessages.map((message) => (
          <div
            key={message.id}
            className="rounded-2xl border border-slate-200/80 bg-light-blue/35 p-3 text-sm shadow-sm"
          >
            <p className="text-brand-navy font-semibold">{message.author}</p>
            <p className="text-muted mt-1 text-xs">
              {format.dateTime(new Date(message.createdAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <Field label={t("reply")} htmlFor="support-reply">
        <Textarea
          id="support-reply"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
      </Field>
      <Button
        disabled={pending || reply.trim().length < 2}
        onClick={() => void send()}
      >
        {t("sendReply")}
      </Button>
    </Card>
  )
}
