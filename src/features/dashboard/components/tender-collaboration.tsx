"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"

import { PromptDialog } from "@/components/feedback/prompt-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { tenderCollaborationAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalTenderCollaboration } from "@/features/dashboard/data/portal-client"

export function TenderCollaboration({
  collaboration,
  companyId,
}: {
  collaboration: PortalTenderCollaboration
  companyId?: string
}) {
  const t = useTranslations("dashboard.tenderCollaboration")
  const common = useTranslations("common")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [question, setQuestion] = useState("")
  const [privateQuestion, setPrivateQuestion] = useState(false)
  const [recipientCompanyId, setRecipientCompanyId] = useState("")
  const [invitationMessage, setInvitationMessage] = useState("")
  const [addendumTitle, setAddendumTitle] = useState("")
  const [addendumBody, setAddendumBody] = useState("")
  const [answerQuestionId, setAnswerQuestionId] = useState<string>()
  const [answer, setAnswer] = useState("")

  async function run(
    operation: Parameters<typeof tenderCollaborationAction>[0],
  ) {
    setPending(true)
    const result = await tenderCollaborationAction(operation)
    setPending(false)
    if (result.ok) router.refresh()
  }

  return (
    <section className="border-line space-y-5 rounded-xl border p-4">
      <h3 className="text-brand-navy text-lg font-semibold">{t("title")}</h3>
      {collaboration.tender.owner && companyId ? (
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
            disabled={pending || !recipientCompanyId}
            onClick={() =>
              void run({
                kind: "invite",
                companyId,
                tenderId: collaboration.tender.id,
                recipientCompanyId,
                message: invitationMessage,
              })
            }
          >
            {t("invite")}
          </Button>
        </div>
      ) : null}

      {collaboration.invitations.map((invitation) => (
        <div key={invitation.id} className="bg-muted/20 rounded-lg p-3 text-sm">
          <p>{t("invitationStatus", { status: invitation.status })}</p>
          {!collaboration.tender.owner && invitation.status === "INVITED" ? (
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  void run({
                    kind: "respond",
                    invitationId: invitation.id,
                    status: "INTERESTED",
                  })
                }
              >
                {t("interested")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  void run({
                    kind: "respond",
                    invitationId: invitation.id,
                    status: "DECLINED",
                  })
                }
              >
                {t("decline")}
              </Button>
            </div>
          ) : null}
        </div>
      ))}

      <div className="space-y-2">
        <h4 className="font-semibold">{t("questions")}</h4>
        {collaboration.questions.map((item) => (
          <div key={item.id} className="bg-muted/20 rounded-lg p-3 text-sm">
            <p className="font-medium">{item.question}</p>
            <p className="text-muted mt-1">{item.answer ?? t("unanswered")}</p>
            {collaboration.tender.owner && companyId && !item.answer ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2"
                disabled={pending}
                onClick={() => setAnswerQuestionId(item.id)}
              >
                {t("answer")}
              </Button>
            ) : null}
          </div>
        ))}
        {!collaboration.tender.owner ? (
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
              disabled={pending || !question.trim()}
              onClick={() =>
                void run({
                  kind: "ask",
                  tenderId: collaboration.tender.id,
                  question,
                  visibility: privateQuestion ? "PRIVATE" : "PUBLIC",
                  companyId,
                })
              }
            >
              {t("ask")}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">{t("addenda")}</h4>
        {collaboration.addenda.map((item) => (
          <div key={item.id} className="bg-muted/20 rounded-lg p-3 text-sm">
            <p className="font-medium">
              v{item.version} · {item.title}
            </p>
            <p className="text-muted mt-1 whitespace-pre-wrap">{item.body}</p>
            {!collaboration.tender.owner &&
            item.requiresAck &&
            !item.acknowledgedAt ? (
              <Button
                size="sm"
                className="mt-2"
                disabled={pending}
                onClick={() =>
                  void run({
                    kind: "acknowledge",
                    addendumId: item.id,
                    companyId,
                  })
                }
              >
                {t("acknowledge")}
              </Button>
            ) : item.acknowledgedAt ? (
              <p className="mt-2 text-xs">{t("acknowledged")}</p>
            ) : null}
          </div>
        ))}
        {collaboration.tender.owner && companyId ? (
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
                pending || !addendumTitle.trim() || !addendumBody.trim()
              }
              onClick={() =>
                void run({
                  kind: "addendum",
                  companyId,
                  tenderId: collaboration.tender.id,
                  title: addendumTitle,
                  body: addendumBody,
                  requiresAck: true,
                })
              }
            >
              {t("issueAddendum")}
            </Button>
          </div>
        ) : null}
      </div>
      <PromptDialog
        open={Boolean(answerQuestionId)}
        onOpenChange={(open) => {
          if (!open) {
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
        pending={pending}
        minLength={2}
        onConfirm={() => {
          if (!answerQuestionId || !companyId) return
          void run({
            kind: "answer",
            companyId,
            questionId: answerQuestionId,
            answer: answer.trim(),
          }).then(() => {
            setAnswerQuestionId(undefined)
            setAnswer("")
          })
        }}
      />
    </section>
  )
}
