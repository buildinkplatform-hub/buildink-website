"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  answerBidQuestionAction,
  askBidQuestionAction,
  createBidAddendumAction,
  createBidInviteAction,
  evaluateOfferAction,
  respondBidInviteAction,
} from "@/features/dashboard/actions/portal.actions"
import type {
  PortalBidAddendum,
  PortalBidInvite,
  PortalBidQuestion,
  PortalLevelingRow,
} from "@/features/dashboard/data/portal-client"

export function BidInviteForm({ tenderId }: { tenderId: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [inviteeProfileId, setInviteeProfileId] = useState("")
  const [inviteeCompanyId, setInviteeCompanyId] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        setPending(true)
        void createBidInviteAction({
          tenderId,
          inviteeProfileId: inviteeProfileId || undefined,
          inviteeCompanyId: inviteeCompanyId || undefined,
          message: message || undefined,
        }).then((result) => {
          setPending(false)
          if (!result.ok) {
            setError(result.message)
            return
          }
          setInviteeProfileId("")
          setInviteeCompanyId("")
          setMessage("")
          router.refresh()
        })
      }}
    >
      <p className="text-brand-navy text-sm font-semibold">
        {t("dashboard.bidding.inviteTitle")}
      </p>
      <Field label={t("dashboard.bidding.inviteeProfile")} htmlFor="invite-profile">
        <Input
          id="invite-profile"
          value={inviteeProfileId}
          onChange={(event) => setInviteeProfileId(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.bidding.inviteeCompany")} htmlFor="invite-company">
        <Input
          id="invite-company"
          value={inviteeCompanyId}
          onChange={(event) => setInviteeCompanyId(event.target.value)}
        />
      </Field>
      <p className="text-muted text-xs">{t("dashboard.bidding.inviteXorHint")}</p>
      <Field label={t("dashboard.bidding.inviteMessage")} htmlFor="invite-message">
        <Textarea
          id="invite-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      <Button type="submit" disabled={pending || (!inviteeProfileId && !inviteeCompanyId)}>
        {t("dashboard.bidding.sendInvite")}
      </Button>
    </form>
  )
}

export function BidInviteInbox({ invites }: { invites: PortalBidInvite[] }) {
  const t = useTranslations()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string>()
  if (!invites.length) {
    return <p className="text-muted text-sm">{t("dashboard.bidding.invitesEmpty")}</p>
  }
  return (
    <div className="space-y-3">
      <p className="text-brand-navy text-sm font-semibold">
        {t("dashboard.bidding.invitesTitle")}
      </p>
      {invites.map((item) => (
        <div key={item.id} className="rounded-xl border p-3">
          <p className="font-semibold">{item.targetTitle ?? item.id}</p>
          <p className="text-muted text-xs">
            {item.status} · {item.inviteeLabel ?? ""}
          </p>
          {item.status === "PENDING" ? (
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                disabled={pendingId === item.id}
                onClick={() => {
                  setPendingId(item.id)
                  void respondBidInviteAction(item.id, "accept").then(() => {
                    setPendingId(undefined)
                    router.refresh()
                  })
                }}
              >
                {t("dashboard.bidding.accept")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pendingId === item.id}
                onClick={() => {
                  setPendingId(item.id)
                  void respondBidInviteAction(item.id, "decline").then(() => {
                    setPendingId(undefined)
                    router.refresh()
                  })
                }}
              >
                {t("dashboard.bidding.decline")}
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function BidQuestionThread({
  tenderId,
  canAnswer,
  questions,
}: {
  tenderId: string
  canAnswer: boolean
  questions: PortalBidQuestion[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  return (
    <div className="space-y-3">
      <p className="text-brand-navy text-sm font-semibold">
        {t("dashboard.bidding.qaTitle")}
      </p>
      {questions.map((item) => (
        <div key={item.id} className="rounded-xl border p-3">
          <p className="text-sm font-semibold">{item.question}</p>
          <p className="text-muted text-xs">{item.askedByLabel}</p>
          {item.answer ? (
            <p className="mt-2 text-sm">{item.answer}</p>
          ) : canAnswer ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={answers[item.id] ?? ""}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [item.id]: event.target.value,
                  }))
                }
              />
              <Button
                size="sm"
                disabled={pending || !(answers[item.id] ?? "").trim()}
                onClick={() => {
                  setPending(true)
                  void answerBidQuestionAction(item.id, answers[item.id] ?? "").then(
                    () => {
                      setPending(false)
                      router.refresh()
                    },
                  )
                }}
              >
                {t("dashboard.bidding.answer")}
              </Button>
            </div>
          ) : (
            <p className="text-muted mt-2 text-xs">{t("dashboard.bidding.awaitingAnswer")}</p>
          )}
        </div>
      ))}
      {!canAnswer ? (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            setPending(true)
            void askBidQuestionAction(tenderId, question).then(() => {
              setPending(false)
              setQuestion("")
              router.refresh()
            })
          }}
        >
          <Field label={t("dashboard.bidding.ask")} htmlFor="bid-question">
            <Textarea
              id="bid-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </Field>
          <Button type="submit" disabled={pending || question.trim().length < 8}>
            {t("dashboard.bidding.sendQuestion")}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

export function BidAddendumForm({
  tenderId,
  addenda,
}: {
  tenderId: string
  addenda: PortalBidAddendum[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  return (
    <div className="space-y-3">
      <p className="text-brand-navy text-sm font-semibold">
        {t("dashboard.bidding.addendaTitle")}
      </p>
      {addenda.map((item) => (
        <div key={item.id} className="rounded-xl border p-3">
          <p className="font-semibold">
            {item.sequence}. {item.title}
          </p>
          <p className="text-muted text-xs">{item.status}</p>
          <p className="mt-2 text-sm">{item.body}</p>
        </div>
      ))}
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault()
          setPending(true)
          void createBidAddendumAction({
            tenderId,
            title,
            body,
            publish: true,
          }).then(() => {
            setPending(false)
            setTitle("")
            setBody("")
            router.refresh()
          })
        }}
      >
        <Field label={t("dashboard.bidding.addendumTitle")} htmlFor="addendum-title">
          <Input
            id="addendum-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label={t("dashboard.bidding.addendumBody")} htmlFor="addendum-body">
          <Textarea
            id="addendum-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </Field>
        <Button type="submit" disabled={pending || title.trim().length < 3 || body.trim().length < 10}>
          {t("dashboard.bidding.publishAddendum")}
        </Button>
      </form>
    </div>
  )
}

export function BidLevelingTable({ rows }: { rows: PortalLevelingRow[] }) {
  const t = useTranslations()
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, string>>({})
  const [pendingId, setPendingId] = useState<string>()
  return (
    <div className="space-y-3">
      <p className="text-brand-navy text-sm font-semibold">
        {t("dashboard.bidding.levelingTitle")}
      </p>
      {!rows.length ? (
        <p className="text-muted text-sm">{t("dashboard.bidding.levelingEmpty")}</p>
      ) : (
        rows.map((row) => (
          <div key={row.offerId} className="rounded-xl border p-3">
            <p className="font-semibold">{row.submitterLabel}</p>
            <p className="text-muted text-xs">
              {row.status} · {t("dashboard.bidding.priceRank")} {row.rankByPrice} ·{" "}
              {t("dashboard.bidding.durationRank")} {row.rankByDuration}
            </p>
            <p className="mt-1 text-sm">
              {row.proposedPriceMinor ?? "—"} {row.currency ?? ""} ·{" "}
              {row.proposedDurationDays ?? "—"} {t("dashboard.bidding.days")}
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <Field label={t("dashboard.bidding.score")} htmlFor={`score-${row.offerId}`}>
                <Input
                  id={`score-${row.offerId}`}
                  type="number"
                  min={0}
                  max={100}
                  value={scores[row.offerId] ?? (row.score == null ? "" : String(row.score))}
                  onChange={(event) =>
                    setScores((current) => ({
                      ...current,
                      [row.offerId]: event.target.value,
                    }))
                  }
                />
              </Field>
              <Button
                size="sm"
                disabled={pendingId === row.offerId}
                onClick={() => {
                  const score = Number(scores[row.offerId] ?? row.score ?? 0)
                  setPendingId(row.offerId)
                  void evaluateOfferAction(row.offerId, score).then(() => {
                    setPendingId(undefined)
                    router.refresh()
                  })
                }}
              >
                {t("dashboard.bidding.saveScore")}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
