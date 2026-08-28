"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Headphones,
  Loader2,
  MessageCircleMore,
  Plus,
  Send,
  ShieldCheck,
  TicketCheck,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  createPortalSupportTicketAction,
  replyPortalSupportTicketAction,
} from "@/features/dashboard/actions/portal-support.actions"
import type {
  PortalPaged,
  PortalSupportTicket,
} from "@/features/dashboard/data/portal-client"
import {
  usePortalSupportMessageStore,
  type RealtimeSupportMessage,
} from "@/features/dashboard/messages/support-message-store"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  prefetchPortalSupportTicket,
  prefetchPortalSupportTickets,
  usePortalSupportTicket,
  usePortalSupportTickets,
} from "@/features/dashboard/query/portal-support-query"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"
import { Link, useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

const activeStatuses = new Set(["OPEN", "IN_PROGRESS", "WAITING"])
const closedStatuses = new Set(["RESOLVED", "CLOSED"])

export function PortalSupportCenter({
  initialTickets,
  initialTicket,
  detailId,
  initialPage = 1,
}: {
  initialTickets?: PortalPaged<PortalSupportTicket>
  initialTicket?: PortalSupportTicket
  detailId?: string
  initialPage?: number
}) {
  if (detailId) {
    return (
      <PortalSupportTicketView id={detailId} initialTicket={initialTicket} />
    )
  }
  return (
    <PortalSupportTicketList
      initialTickets={initialTickets}
      initialPage={initialPage}
    />
  )
}

function PortalSupportTicketList({
  initialTickets,
  initialPage,
}: {
  initialTickets?: PortalPaged<PortalSupportTicket>
  initialPage: number
}) {
  const t = useTranslations("dashboard.support")
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const router = useRouter()
  const [page, setPage] = useState(initialPage)
  const ticketsQuery = usePortalSupportTickets(
    page,
    page === initialPage ? initialTickets : undefined,
  )
  const data = ticketsQuery.data ?? initialTickets
  const tickets = data?.items ?? []
  const activeTicket = tickets.find((ticket) =>
    activeStatuses.has(ticket.status),
  )

  useEffect(() => {
    if (!data) return
    if (page > 1) void prefetchPortalSupportTickets(queryClient, page - 1)
    if (data.pageInfo.hasNextPage) {
      void prefetchPortalSupportTickets(queryClient, page + 1)
    }
  }, [data, page, queryClient])

  function changePage(nextPage: number) {
    const safePage = Math.max(1, nextPage)
    setPage(safePage)
    const params = new URLSearchParams(window.location.search)
    if (safePage > 1) params.set("page", String(safePage))
    else params.delete("page")
    window.history.pushState(
      null,
      "",
      params.toString() ? `${pathname}?${params}` : pathname,
    )
  }

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SupportMetric
          icon={Headphones}
          label="Support channel"
          value="Direct"
          detail="A private conversation between you and the Buildink support team."
        />
        <SupportMetric
          icon={CalendarClock}
          label="Active request"
          value={activeTicket ? "1 open" : "None"}
          detail={
            activeTicket
              ? `${activeTicket.reference} is currently being handled.`
              : "You can open one support ticket whenever you need help."
          }
        />
        <SupportMetric
          icon={MessageCircleMore}
          label="Updates"
          value="Realtime"
          detail="Admin replies arrive in the conversation without a page refresh."
        />
      </div>

      {activeTicket ? (
        <Card className="border-primary/20 bg-primary/[0.035] overflow-hidden rounded-[24px] shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 gap-3">
              <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <MessageCircleMore className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  Continue your active ticket
                </p>
                <h2 className="text-foreground mt-1 truncate text-lg font-semibold">
                  {activeTicket.subject}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeTicket.reference} · {formatStatus(activeTicket.status)}{" "}
                  · {activeTicket.assigneeName ?? "Awaiting assignment"}
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href={`/dashboard/support/${activeTicket.id}`} prefetch>
                Open conversation
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <SupportTicketComposer
          onCreated={(ticket) => {
            seedCreatedTicket(queryClient, ticket)
            router.push(`/dashboard/support/${ticket.id}`)
          }}
        />
      )}

      <Card className="overflow-hidden rounded-[24px] shadow-sm">
        <div className="bg-muted/15 flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Your support history
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Reopen previous conversations for context. Resolved tickets remain
              read-only.
            </p>
          </div>
          {ticketsQuery.isFetching ? (
            <span className="text-muted-foreground inline-flex items-center gap-2 text-xs font-medium">
              <Loader2 className="size-3.5 animate-spin" /> Updating
            </span>
          ) : null}
        </div>

        <div className="divide-y">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/support/${ticket.id}`}
              prefetch
              onMouseEnter={() => {
                void prefetchPortalSupportTicket(queryClient, ticket.id)
              }}
              onFocus={() => {
                void prefetchPortalSupportTicket(queryClient, ticket.id)
              }}
              className="group hover:bg-muted/30 focus-visible:ring-ring flex flex-col gap-4 p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none sm:flex-row sm:items-center sm:p-5"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  activeStatuses.has(ticket.status)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {closedStatuses.has(ticket.status) ? (
                  <TicketCheck className="size-5" />
                ) : (
                  <MessageCircleMore className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-foreground group-hover:text-primary truncate font-semibold">
                    {ticket.subject}
                  </p>
                  <SupportPill value={ticket.status} />
                  <SupportPill value={ticket.priority} tone="muted" />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {ticket.reference} · {ticket.category} · SLA{" "}
                  {formatStatus(ticket.slaState)}
                </p>
              </div>
              <div className="text-muted-foreground text-left text-xs sm:text-right">
                <p>{ticket.assigneeName ?? "Unassigned"}</p>
                <p className="mt-1">Updated {relativeDate(ticket.updatedAt)}</p>
              </div>
            </Link>
          ))}
          {!tickets.length && !ticketsQuery.isLoading ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
                <Headphones className="size-5" />
              </span>
              <p className="text-foreground mt-4 font-semibold">
                No support tickets yet
              </p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                When you need help, open a ticket above and continue the
                conversation here.
              </p>
            </div>
          ) : null}
        </div>

        {data ? (
          <div className="bg-muted/10 flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
            <p className="text-muted-foreground text-xs">
              Page {data.pageInfo.page} · {data.pageInfo.total} ticket
              {data.pageInfo.total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
                aria-label="Previous support page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={!data.pageInfo.hasNextPage}
                onClick={() => changePage(page + 1)}
                aria-label="Next support page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

function SupportTicketComposer({
  onCreated,
}: {
  onCreated: (ticket: PortalSupportTicket) => void
}) {
  const t = useTranslations("dashboard.support")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("technical")
  const [priority, setPriority] = useState("MEDIUM")
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function submit() {
    if (pending || subject.trim().length < 4 || body.trim().length < 8) return
    setPending(true)
    setError(undefined)
    const result = await createPortalSupportTicketAction({
      subject: subject.trim(),
      category,
      priority,
      body: body.trim(),
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onCreated(result.ticket)
  }

  return (
    <Card className="overflow-hidden rounded-[24px] shadow-sm">
      <div className="bg-muted/15 border-b p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Plus className="size-5" />
          </span>
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Open a support ticket
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
              Describe one issue clearly. You can keep chatting with support in
              the same ticket until it is resolved.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <Field label={t("subject")} htmlFor="support-subject">
          <Input
            id="support-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Short summary of the issue"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Field label="Priority" htmlFor="support-priority">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="support-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label={t("message")} htmlFor="support-body">
            <Textarea
              id="support-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-32 resize-y"
              placeholder="What happened, what did you expect, and what have you already tried?"
            />
          </Field>
        </div>
        {error ? (
          <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-4 py-3 text-sm lg:col-span-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
      <div className="bg-muted/10 flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-muted-foreground text-xs">
          One active ticket per account. Open another after the current ticket
          is resolved or closed.
        </p>
        <Button
          type="button"
          disabled={
            pending || subject.trim().length < 4 || body.trim().length < 8
          }
          onClick={() => void submit()}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Headphones className="size-4" />
          )}
          {pending ? "Opening ticket…" : t("submit")}
        </Button>
      </div>
    </Card>
  )
}

function PortalSupportTicketView({
  id,
  initialTicket,
}: {
  id: string
  initialTicket?: PortalSupportTicket
}) {
  const t = useTranslations("dashboard.support")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const ticketQuery = usePortalSupportTicket(id, initialTicket)
  const ticket = ticketQuery.data ?? initialTicket
  const [reply, setReply] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const storeMessages = usePortalSupportMessageStore(
    (state) => state.messagesByTicket[id],
  )
  const setInitialMessages = usePortalSupportMessageStore(
    (state) => state.setInitialMessages,
  )

  useEffect(() => {
    if (!ticket?.messages) return
    setInitialMessages(
      id,
      ticket.messages.map((message) => ({
        ...message,
        ticketId: id,
        authorId: null,
        internalNote: false,
      })),
    )
  }, [id, setInitialMessages, ticket?.messages])

  const threadMessages = useMemo<RealtimeSupportMessage[]>(
    () =>
      storeMessages ??
      (ticket?.messages ?? []).map((message) => ({
        ...message,
        ticketId: id,
        authorId: null,
        internalNote: false,
      })),
    [id, storeMessages, ticket?.messages],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [threadMessages.length])

  if (!ticket) {
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          eyebrow="Support"
          title="Ticket unavailable"
          description="This ticket could not be loaded or is not available to your account."
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard/support">
                <ArrowLeft className="size-4" /> Back to support
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const closed = closedStatuses.has(ticket.status)
  const ticketId = ticket.id

  async function send() {
    const message = reply.trim()
    if (!ticket || !message || pending || closed) return
    setPending(true)
    setError(undefined)
    const result = await replyPortalSupportTicketAction(ticketId, message)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setReply("")
    queryClient.setQueryData(
      portalQueryKeys.resource("support-ticket", { id: ticketId }),
      result.ticket,
    )
    patchTicketLists(queryClient, result.ticket)
    if (result.ticket.messages) {
      setInitialMessages(
        ticketId,
        result.ticket.messages.map((item) => ({
          ...item,
          ticketId,
          authorId: null,
          internalNote: false,
        })),
      )
    }
  }

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={`${ticket.reference} · ${ticket.category}`}
        title={ticket.subject}
        description="Private support conversation"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/support" prefetch>
              <ArrowLeft className="size-4" /> {t("back")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TicketInfo
          label="Status"
          value={formatStatus(ticket.status)}
          icon={MessageCircleMore}
        />
        <TicketInfo
          label="Priority"
          value={formatStatus(ticket.priority)}
          icon={CircleAlert}
        />
        <TicketInfo
          label="SLA"
          value={formatStatus(ticket.slaState)}
          icon={CalendarClock}
        />
        <TicketInfo
          label="Support owner"
          value={ticket.assigneeName ?? "Awaiting assignment"}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-hidden rounded-[24px] shadow-sm">
          <div className="bg-muted/15 flex items-center gap-3 border-b p-4 sm:p-5">
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <MessageCircleMore className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground font-semibold">Conversation</p>
              <p className="text-muted-foreground text-xs">
                Messages from you and Buildink support appear here in realtime.
              </p>
            </div>
            {ticketQuery.isFetching ? (
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            ) : null}
          </div>

          <div className="bg-muted/10 max-h-[min(62vh,620px)] min-h-[360px] space-y-4 overflow-y-auto p-4 sm:p-5">
            {threadMessages.map((message, index) => {
              const fromSupport = Boolean(
                ticket.assigneeName && message.author === ticket.assigneeName,
              )
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    fromSupport ? "justify-start" : "justify-end",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[72%]",
                      fromSupport
                        ? "bg-card rounded-bl-md"
                        : "border-primary/15 bg-primary text-primary-foreground rounded-br-md",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span>
                        {fromSupport
                          ? "Buildink Support"
                          : index === 0
                            ? message.author
                            : "You"}
                      </span>
                      {fromSupport ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap">
                      {message.body}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[10px]",
                        fromSupport
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70",
                      )}
                    >
                      {format.dateTime(new Date(message.createdAt), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {closed ? (
            <div className="border-t bg-emerald-500/5 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-foreground font-semibold">
                    This ticket is {ticket.status.toLowerCase()}.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {ticket.resolutionNote ??
                      "The conversation is read-only. You can open a new ticket from Support if you need more help."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card space-y-3 border-t p-4 sm:p-5">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                className="min-h-24 resize-y"
                placeholder="Write a reply to support…"
                disabled={pending}
              />
              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  Replies are visible to your assigned support team.
                </p>
                <Button
                  type="button"
                  disabled={pending || reply.trim().length < 2}
                  onClick={() => void send()}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {pending ? "Sending…" : t("sendReply")}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="rounded-[24px] p-5 shadow-sm xl:sticky xl:top-24">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Ticket details
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <DetailRow label="Reference" value={ticket.reference} />
            <DetailRow label="Category" value={ticket.category} />
            <DetailRow
              label="Created"
              value={format.dateTime(new Date(ticket.createdAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <DetailRow
              label="Last updated"
              value={format.dateTime(new Date(ticket.updatedAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <DetailRow
              label="SLA due"
              value={format.dateTime(new Date(ticket.dueAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
          </dl>
        </Card>
      </div>
    </div>
  )
}

function SupportMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Headphones
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="rounded-[22px] p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
            {label}
          </p>
          <p className="text-foreground mt-1 text-xl font-bold tracking-tight">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {detail}
          </p>
        </div>
      </div>
    </Card>
  )
}

function TicketInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Headphones
  label: string
  value: string
}) {
  return (
    <Card className="rounded-[20px] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-xl">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
            {label}
          </p>
          <p className="text-foreground mt-0.5 truncate text-sm font-semibold">
            {value}
          </p>
        </div>
      </div>
    </Card>
  )
}

function SupportPill({
  value,
  tone = "primary",
}: {
  value: string
  tone?: "primary" | "muted"
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        tone === "primary"
          ? "border-primary/20 bg-primary/8 text-primary"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {formatStatus(value)}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground mt-1 font-medium break-words">{value}</dd>
    </div>
  )
}

function seedCreatedTicket(
  queryClient: ReturnType<typeof useQueryClient>,
  ticket: PortalSupportTicket,
) {
  queryClient.setQueryData(
    portalQueryKeys.resource("support-ticket", { id: ticket.id }),
    ticket,
  )
  patchTicketLists(queryClient, ticket, true)
}

function patchTicketLists(
  queryClient: ReturnType<typeof useQueryClient>,
  ticket: PortalSupportTicket,
  prepend = false,
) {
  queryClient.setQueriesData<PortalPaged<PortalSupportTicket>>(
    { queryKey: ["portal", "support-tickets"] },
    (current) => {
      if (!current) return current
      const exists = current.items.some((item) => item.id === ticket.id)
      const items = exists
        ? current.items.map((item) =>
            item.id === ticket.id ? { ...item, ...ticket } : item,
          )
        : prepend && current.pageInfo.page === 1
          ? [ticket, ...current.items].slice(0, current.pageInfo.pageSize)
          : current.items
      return {
        ...current,
        items,
        pageInfo: {
          ...current.pageInfo,
          total: exists
            ? current.pageInfo.total
            : current.pageInfo.total + (prepend ? 1 : 0),
        },
      }
    },
  )
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function relativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diff / 60_000))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
