"use client"

import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import { PromptDialog } from "@/components/feedback/prompt-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  mutateTenderCollaborationAction,
  type TenderCollaborationOperation,
} from "@/features/dashboard/actions/tender-collaboration.actions"
import type { PortalTenderCollaboration } from "@/features/dashboard/data/portal-client"

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export function TenderCollaboration({
  collaboration,
  companyId,
}: {
  collaboration: PortalTenderCollaboration
  companyId?: string
}) {
  const t = useTranslations("dashboard.tenderCollaboration")
  const common = useTranslations("common")
  const [state, setState] = useState(collaboration)
  const [pendingAction, setPendingAction] = useState<string>()
  const [question, setQuestion] = useState("")
  const [privateQuestion, setPrivateQuestion] = useState(false)
  const [recipientCompanyId, setRecipientCompanyId] = useState("")
  const [invitationMessage, setInvitationMessage] = useState("")
  const [addendumTitle, setAddendumTitle] = useState("")
  const [addendumBody, setAddendumBody] = useState("")
  const [answerQuestionId, setAnswerQuestionId] = useState<string>()
  const [answer, setAnswer] = useState("")

  async function run(operation: TenderCollaborationOperation) {
    const actionKey =
      operation.kind === "respond"
        ? `${operation.kind}:${operation.invitationId}:${operation.status}`
        : operation.kind === "acknowledge"
          ? `${operation.kind}:${operation.addendumId}`
          : operation.kind === "answer"
            ? `${operation.kind}:${operation.questionId}`
            : operation.kind
    setPendingAction(actionKey)
    try {
      const result = await mutateTenderCollaborationAction(operation)
      if (!result.ok) return result
      const payload = record(result.data)

      setState((current) => {
        switch (operation.kind) {
          case "invite": {
            if (!payload) return current
            const invitation = payload as (typeof current.invitations)[number]
            return {
              ...current,
              invitations: [
                invitation,
                ...current.invitations.filter(
                  (item) => item.id !== invitation.id,
                ),
              ],
            }
          }
          case "respond":
            return {
              ...current,
              invitations: current.invitations.map((item) =>
                item.id === operation.invitationId
                  ? ({
                      ...item,
                      status: operation.status,
                      ...payload,
                    } as typeof item)
                  : item,
              ),
            }
          case "ask": {
            if (!payload) return current
            const asked = payload as (typeof current.questions)[number]
            return {
              ...current,
              questions: [
                ...current.questions.filter((item) => item.id !== asked.id),
                asked,
              ],
            }
          }
          case "answer":
            return {
              ...current,
              questions: current.questions.map((item) =>
                item.id === operation.questionId
                  ? ({
                      ...item,
                      answer: operation.answer,
                      ...payload,
                    } as typeof item)
                  : item,
              ),
            }
          case "addendum": {
            if (!payload) return current
            const addendum = payload as (typeof current.addenda)[number]
            return {
              ...current,
              addenda: [
                addendum,
                ...current.addenda.filter((item) => item.id !== addendum.id),
              ],
            }
          }
          case "acknowledge":
            return {
              ...current,
              addenda: current.addenda.map((item) =>
                item.id === operation.addendumId
                  ? ({
                      ...item,
                      acknowledgedAt: new Date().toISOString(),
                      ...payload,
                    } as typeof item)
                  : item,
              ),
            }
        }
      })

      if (operation.kind === "invite") {
        setRecipientCompanyId("")
        setInvitationMessage("")
      }
      if (operation.kind === "ask") {
        setQuestion("")
        setPrivateQuestion(false)
      }
      if (operation.kind === "addendum") {
        setAddendumTitle("")
        setAddendumBody("")
      }
      return result
    } finally {
      setPendingAction(undefined)
    }
  }

  return (
    <section className="border-line space-y-5 rounded-xl border p-4">
      <h3 className="text-foreground text-lg font-semibold">{t("title")}</h3>
      {state.tender.owner && companyId ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={recipientCompanyId}
            onChange={(event) => setRecipientCompanyId(event.target.value)}
            placeholder={t("recipientCompany")}
          />
          <Input
            value={invitationMessage}
            onChange={(event) => setInvitationMessage(event.target.value)}
            placeholder={t("invitationMessage")}
          />
          <Button
            type="button"
            disabled={pendingAction === "invite" || !recipientCompanyId}
            aria-busy={pendingAction === "invite"}
            onClick={() =>
              void run({
                kind: "invite",
                companyId,
                tenderId: state.tender.id,
                recipientCompanyId,
                message: invitationMessage,
              })
            }
          >
            {pendingAction === "invite" ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {t("invite")}
          </Button>
        </div>
      ) : null}

      {state.invitations.map((invitation) => {
        const interestedKey = `respond:${invitation.id}:INTERESTED`
        const declinedKey = `respond:${invitation.id}:DECLINED`
        return (
          <div
            key={invitation.id}
            className="bg-muted/20 rounded-lg p-3 text-sm"
          >
            <p>{t("invitationStatus", { status: invitation.status })}</p>
            {!state.tender.owner && invitation.status === "INVITED" ? (
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  disabled={Boolean(pendingAction)}
                  aria-busy={pendingAction === interestedKey}
                  onClick={() =>
                    void run({
                      kind: "respond",
                      invitationId: invitation.id,
                      status: "INTERESTED",
                    })
                  }
                >
                  {pendingAction === interestedKey ? (
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : null}
                  {t("interested")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={Boolean(pendingAction)}
                  aria-busy={pendingAction === declinedKey}
                  onClick={() =>
                    void run({
                      kind: "respond",
                      invitationId: invitation.id,
                      status: "DECLINED",
                    })
                  }
                >
                  {pendingAction === declinedKey ? (
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : null}
                  {t("decline")}
                </Button>
              </div>
            ) : null}
          </div>
        )
      })}

      <div className="space-y-2">
        <h4 className="font-semibold">{t("questions")}</h4>
        {state.questions.map((item) => (
          <div key={item.id} className="bg-muted/20 rounded-lg p-3 text-sm">
            <p className="font-medium">{item.question}</p>
            <p className="text-muted-foreground mt-1">
              {item.answer ?? t("unanswered")}
            </p>
            {state.tender.owner && companyId && !item.answer ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2"
                disabled={Boolean(pendingAction)}
                onClick={() => setAnswerQuestionId(item.id)}
              >
                {t("answer")}
              </Button>
            ) : null}
          </div>
        ))}
        {!state.tender.owner ? (
          <div className="space-y-2">
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t("questionPlaceholder")}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={privateQuestion}
                onChange={(event) => setPrivateQuestion(event.target.checked)}
              />
              {t("privateQuestion")}
            </label>
            <Button
              disabled={pendingAction === "ask" || !question.trim()}
              aria-busy={pendingAction === "ask"}
              onClick={() =>
                void run({
                  kind: "ask",
                  tenderId: state.tender.id,
                  question,
                  visibility: privateQuestion ? "PRIVATE" : "PUBLIC",
                  companyId,
                })
              }
            >
              {pendingAction === "ask" ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : null}
              {t("ask")}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">{t("addenda")}</h4>
        {state.addenda.map((item) => {
          const acknowledgeKey = `acknowledge:${item.id}`
          return (
            <div key={item.id} className="bg-muted/20 rounded-lg p-3 text-sm">
              <p className="font-medium">
                v{item.version} · {item.title}
              </p>
              <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                {item.body}
              </p>
              {!state.tender.owner &&
              item.requiresAck &&
              !item.acknowledgedAt ? (
                <Button
                  size="sm"
                  className="mt-2"
                  disabled={Boolean(pendingAction)}
                  aria-busy={pendingAction === acknowledgeKey}
                  onClick={() =>
                    void run({
                      kind: "acknowledge",
                      addendumId: item.id,
                      companyId,
                    })
                  }
                >
                  {pendingAction === acknowledgeKey ? (
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : null}
                  {t("acknowledge")}
                </Button>
              ) : item.acknowledgedAt ? (
                <p className="mt-2 text-xs">{t("acknowledged")}</p>
              ) : null}
            </div>
          )
        })}
        {state.tender.owner && companyId ? (
          <div className="space-y-2">
            <Input
              value={addendumTitle}
              onChange={(event) => setAddendumTitle(event.target.value)}
              placeholder={t("addendumTitle")}
            />
            <Textarea
              value={addendumBody}
              onChange={(event) => setAddendumBody(event.target.value)}
              placeholder={t("addendumBody")}
            />
            <Button
              disabled={
                pendingAction === "addendum" ||
                !addendumTitle.trim() ||
                !addendumBody.trim()
              }
              aria-busy={pendingAction === "addendum"}
              onClick={() =>
                void run({
                  kind: "addendum",
                  companyId,
                  tenderId: state.tender.id,
                  title: addendumTitle,
                  body: addendumBody,
                  requiresAck: true,
                })
              }
            >
              {pendingAction === "addendum" ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : null}
              {t("issueAddendum")}
            </Button>
          </div>
        ) : null}
      </div>
      <PromptDialog
        open={Boolean(answerQuestionId)}
        onOpenChange={(open) => {
          if (!open && pendingAction !== `answer:${answerQuestionId ?? ""}`) {
            setAnswerQuestionId(undefined)
            setAnswer("")
          }
        }}
        title={t("answer")}
        description={t("answerPrompt")}
        value={answer}
        onValueChange={setAnswer}
        confirmLabel={t("answer")}
        cancelLabel={common("cancel")}
        pending={pendingAction === `answer:${answerQuestionId ?? ""}`}
        minLength={2}
        onConfirm={() => {
          if (!answerQuestionId || !companyId) return
          const questionId = answerQuestionId
          void run({
            kind: "answer",
            companyId,
            questionId,
            answer: answer.trim(),
          }).then((result) => {
            if (!result?.ok) return
            setAnswerQuestionId(undefined)
            setAnswer("")
          })
        }}
      />
    </section>
  )
}
