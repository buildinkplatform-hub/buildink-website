"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"

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

export function OfferDecisionActions({
  companyId,
  id,
  version,
  acceptLabel,
  rejectLabel,
  requestChangesLabel,
  shortlistLabel,
}: {
  companyId: string
  id: string
  version: number
  acceptLabel: string
  rejectLabel: string
  requestChangesLabel: string
  shortlistLabel?: string
}) {
  const router = useRouter()
  const common = useTranslations("common")
  const [pending, setPending] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [changeReason, setChangeReason] = useState("")
  async function decide(decision: "accept" | "reject") {
    setPending(true)
    await decideWorkspaceOfferAction(companyId, id, decision, version)
    router.refresh()
    setPending(false)
  }
  async function shortlist() {
    setPending(true)
    await shortlistWorkspaceOfferAction(companyId, id, version)
    router.refresh()
    setPending(false)
  }
  async function requestChanges() {
    const reason = changeReason.trim()
    if (!reason) return
    setPending(true)
    await requestWorkspaceOfferChangesAction(companyId, id, reason, version)
    setRequestOpen(false)
    setChangeReason("")
    router.refresh()
    setPending(false)
  }
  return (
    <div className="mt-3 flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => void decide("accept")}
      >
        {acceptLabel}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => void decide("reject")}
      >
        {rejectLabel}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => setRequestOpen(true)}
      >
        {requestChangesLabel}
      </Button>
      {shortlistLabel ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => void shortlist()}
        >
          {shortlistLabel}
        </Button>
      ) : null}
      <PromptDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        title={requestChangesLabel}
        description={requestChangesLabel}
        value={changeReason}
        onValueChange={setChangeReason}
        confirmLabel={requestChangesLabel}
        cancelLabel={common("cancel")}
        pending={pending}
        minLength={3}
        onConfirm={() => void requestChanges()}
      />
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
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void withdrawPortalOfferAction(id, version).then(() => router.refresh())
      }}
    >
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
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void withdrawPortalApplicationAction(id, version).then(() =>
          router.refresh(),
        )
      }}
    >
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
  const router = useRouter()
  const [pending, setPending] = useState(false)
  async function decide(decision: "accept" | "reject") {
    setPending(true)
    await decideWorkspaceApplicationAction(companyId, id, decision, version)
    router.refresh()
    setPending(false)
  }
  return (
    <div className="mt-3 flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => void decide("accept")}
      >
        {acceptLabel}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => void decide("reject")}
      >
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
  const router = useRouter()
  const [stage, setStage] =
    useState<(typeof hiringStages)[number]>("UNDER_REVIEW")
  const [pending, setPending] = useState(false)
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Select
        value={stage}
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
            await stageWorkspaceApplicationAction(companyId, id, stage, version)
            router.refresh()
            setPending(false)
          })()
        }
      >
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
    if (!next) return
    setPending(true)
    await sendPortalMessageAction(conversationId, next)
    setBody("")
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
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        className="border-input bg-background min-h-11 flex-1 rounded-xl border px-3 text-sm"
      />
      <Button type="submit" disabled={pending || !body.trim()}>
        {sendLabel}
      </Button>
    </form>
  )
}
