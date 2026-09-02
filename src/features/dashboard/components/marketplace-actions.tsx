"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { PromptDialog } from "@/components/feedback/prompt-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  decideWorkspaceApplicationAction,
  decideWorkspaceOfferAction,
  requestWorkspaceOfferChangesAction,
  shortlistWorkspaceOfferAction,
  withdrawPortalOfferAction,
  withdrawPortalApplicationAction,
  stageWorkspaceApplicationAction,
  sendPortalMessageAction,
} from "@/features/dashboard/actions/portal.actions"
import { canDecideOffer } from "@/features/dashboard/lib/offer-decision"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"

export function OfferDecisionActions({
  companyId,
  id,
  version,
  status,
  acceptLabel,
  rejectLabel,
  requestChangesLabel,
  shortlistLabel,
}: {
  companyId: string
  id: string
  version: number
  status: string
  acceptLabel: string
  rejectLabel: string
  requestChangesLabel: string
  shortlistLabel?: string
}) {
  const runMutation = usePortalMutationRunner()
  const common = useTranslations("common")
  const [pendingAction, setPendingAction] = useState<string>()
  const [requestOpen, setRequestOpen] = useState(false)
  const [changeReason, setChangeReason] = useState("")
  const canAccept = canDecideOffer(status, "ACCEPTED")
  const canReject = canDecideOffer(status, "REJECTED")
  const canRequestChanges = canDecideOffer(status, "CHANGES_REQUESTED")
  const canShortlist =
    Boolean(shortlistLabel) && canDecideOffer(status, "SHORTLISTED")

  async function decide(decision: "accept" | "reject") {
    setPendingAction(decision)
    try {
      await runMutation(
        () => decideWorkspaceOfferAction(companyId, id, decision, version),
        {
          optimistic: {
            id,
            patch: {
              status: decision === "accept" ? "ACCEPTED" : "REJECTED",
              version: version + 1,
            },
          },
        },
      )
    } finally {
      setPendingAction(undefined)
    }
  }

  async function shortlist() {
    if (!canShortlist) return
    setPendingAction("shortlist")
    try {
      await runMutation(
        () => shortlistWorkspaceOfferAction(companyId, id, version),
        {
          optimistic: {
            id,
            patch: { status: "SHORTLISTED", version: version + 1 },
          },
        },
      )
    } finally {
      setPendingAction(undefined)
    }
  }

  async function requestChanges() {
    if (!canRequestChanges) return
    const reason = changeReason.trim()
    if (!reason) return
    setPendingAction("changes")
    try {
      const result = await runMutation(
        () =>
          requestWorkspaceOfferChangesAction(companyId, id, reason, version),
        {
          optimistic: {
            id,
            patch: { status: "CHANGES_REQUESTED", version: version + 1 },
          },
        },
      )
      if (result.ok) {
        setRequestOpen(false)
        setChangeReason("")
      }
    } finally {
      setPendingAction(undefined)
    }
  }

  if (!canAccept && !canReject && !canRequestChanges && !canShortlist)
    return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {canAccept ? (
        <Button
          size="sm"
          disabled={Boolean(pendingAction)}
          onClick={() => void decide("accept")}
        >
          {pendingAction === "accept" ? (
            <Loader2 className="animate-spin" />
          ) : null}
          {acceptLabel}
        </Button>
      ) : null}
      {canReject ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={Boolean(pendingAction)}
          onClick={() => void decide("reject")}
        >
          {pendingAction === "reject" ? (
            <Loader2 className="animate-spin" />
          ) : null}
          {rejectLabel}
        </Button>
      ) : null}
      {canRequestChanges ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={Boolean(pendingAction)}
          onClick={() => setRequestOpen(true)}
        >
          {requestChangesLabel}
        </Button>
      ) : null}
      {canShortlist && shortlistLabel ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={Boolean(pendingAction)}
          onClick={() => void shortlist()}
        >
          {pendingAction === "shortlist" ? (
            <Loader2 className="animate-spin" />
          ) : null}
          {shortlistLabel}
        </Button>
      ) : null}
      {canRequestChanges ? (
        <PromptDialog
          open={requestOpen}
          onOpenChange={setRequestOpen}
          title={requestChangesLabel}
          description={requestChangesLabel}
          value={changeReason}
          onValueChange={setChangeReason}
          confirmLabel={requestChangesLabel}
          cancelLabel={common("cancel")}
          pending={pendingAction === "changes"}
          minLength={3}
          onConfirm={() => void requestChanges()}
        />
      ) : null}
    </div>
  )
}

export function OfferWithdrawAction({
  id,
  version,
  label,
}: {
  id: string
  version: number
  label: string
}) {
  const runMutation = usePortalMutationRunner()
  const [pending, setPending] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void runMutation(() => withdrawPortalOfferAction(id, version), {
          optimistic: {
            id,
            patch: { status: "WITHDRAWN", version: version + 1 },
          },
        }).finally(() => setPending(false))
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {label}
    </Button>
  )
}

export function ApplicationWithdrawAction({
  id,
  version,
  label,
}: {
  id: string
  version: number
  label: string
}) {
  const runMutation = usePortalMutationRunner()
  const [pending, setPending] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void runMutation(() => withdrawPortalApplicationAction(id, version), {
          optimistic: {
            id,
            patch: { status: "WITHDRAWN", version: version + 1 },
          },
        }).finally(() => setPending(false))
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {label}
    </Button>
  )
}

export function ApplicationDecisionActions({
  companyId,
  id,
  version,
  acceptLabel,
  rejectLabel,
}: {
  companyId: string
  id: string
  version: number
  acceptLabel: string
  rejectLabel: string
}) {
  const runMutation = usePortalMutationRunner()
  const [pendingAction, setPendingAction] = useState<string>()

  async function decide(decision: "accept" | "reject") {
    setPendingAction(decision)
    try {
      await runMutation(
        () =>
          decideWorkspaceApplicationAction(companyId, id, decision, version),
        {
          optimistic: {
            id,
            patch: {
              status: decision === "accept" ? "ACCEPTED" : "REJECTED",
              version: version + 1,
            },
          },
        },
      )
    } finally {
      setPendingAction(undefined)
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button
        size="sm"
        disabled={Boolean(pendingAction)}
        onClick={() => void decide("accept")}
      >
        {pendingAction === "accept" ? (
          <Loader2 className="animate-spin" />
        ) : null}
        {acceptLabel}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={Boolean(pendingAction)}
        onClick={() => void decide("reject")}
      >
        {pendingAction === "reject" ? (
          <Loader2 className="animate-spin" />
        ) : null}
        {rejectLabel}
      </Button>
    </div>
  )
}

const hiringStages = [
  "UNDER_REVIEW",
  "SHORTLISTED",
  "CONTACTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
] as const

export function ApplicationStageActions({
  companyId,
  id,
  version,
  label,
}: {
  companyId: string
  id: string
  version: number
  label: string
}) {
  const runMutation = usePortalMutationRunner()
  const [stage, setStage] =
    useState<(typeof hiringStages)[number]>("UNDER_REVIEW")
  const [pending, setPending] = useState(false)
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Select
        value={stage}
        disabled={pending}
        onValueChange={(value) => setStage(value as typeof stage)}
      >
        <SelectTrigger className="min-h-9 w-auto min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hiringStages.map((value) => (
            <SelectItem key={value} value={value}>
              {value.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          void (async () => {
            setPending(true)
            try {
              await runMutation(
                () =>
                  stageWorkspaceApplicationAction(
                    companyId,
                    id,
                    stage,
                    version,
                  ),
                {
                  optimistic: {
                    id,
                    patch: { status: stage, version: version + 1 },
                  },
                },
              )
            } finally {
              setPending(false)
            }
          })()
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        {label}
      </Button>
    </div>
  )
}

export function ConversationComposer({
  conversationId,
  placeholder,
  sendLabel,
}: {
  conversationId: string
  placeholder: string
  sendLabel: string
}) {
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  async function send() {
    const next = body.trim()
    if (!next || pending) return
    setPending(true)
    const result = await sendPortalMessageAction(conversationId, next)
    if (result.ok) setBody("")
    setPending(false)
  }
  return (
    <form
      className="mt-4 flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <input
        value={body}
        disabled={pending}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        className="border-input bg-background min-h-11 flex-1 rounded-xl border px-3 text-sm"
      />
      <Button type="submit" disabled={pending || !body.trim()}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {sendLabel}
      </Button>
    </form>
  )
}
