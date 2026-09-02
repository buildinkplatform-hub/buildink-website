"use client"

import { useState } from "react"
import {
  Check,
  Eye,
  ListChecks,
  MoreHorizontal,
  PencilLine,
  X,
  XCircle,
} from "lucide-react"
import { PromptDialog } from "@/components/feedback/prompt-dialog"
import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  decideWorkspaceOfferAction,
  requestWorkspaceOfferChangesAction,
  shortlistWorkspaceOfferAction,
  withdrawPortalOfferAction,
} from "@/features/dashboard/actions/portal.actions"
import { canDecideOffer } from "@/features/dashboard/lib/offer-decision"
import { canWithdrawOffer } from "@/features/dashboard/lib/offer-withdraw"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"
import { Link } from "@/i18n/navigation"

type Labels = {
  actions: string
  details: string
  editDraft: string
  accept: string
  reject: string
  requestChanges: string
  shortlist: string
  withdraw: string
  cancel: string
}

type OfferActionsMenuProps = {
  mode: "buyer" | "bidder"
  companyId?: string
  id: string
  version: number
  status: string
  viewHref: string
  editHref?: string
  labels: Labels
}

export function OfferActionsMenu(props: OfferActionsMenuProps) {
  return (
    <OfferActionsMenuStateful
      key={`${props.id}:${props.version}:${props.status}`}
      {...props}
    />
  )
}

function OfferActionsMenuStateful({
  mode,
  companyId,
  id,
  version,
  status,
  viewHref,
  editHref,
  labels,
}: OfferActionsMenuProps) {
  const runMutation = usePortalMutationRunner()
  const [confirmAction, setConfirmAction] = useState<ReasonedAction | null>(
    null,
  )
  const [requestChangesOpen, setRequestChangesOpen] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const [reason, setReason] = useState("")
  const [currentVersion, setCurrentVersion] = useState(version)
  const [currentStatus, setCurrentStatus] = useState(status)

  async function runStatusAction(
    task: () => Promise<{
      ok: boolean
      message?: string
      [key: string]: unknown
    }>,
    nextStatus: string,
  ) {
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(task, {
      optimistic: {
        id,
        patch: { status: nextStatus, version: optimisticVersion },
      },
    })
    if (!result.ok) throw new Error(result.message ?? "Could not update offer")
    const payload = (result.data ?? result.offer) as
      { version?: number } | undefined
    setCurrentVersion(payload?.version ?? optimisticVersion)
    setCurrentStatus(nextStatus)
  }

  async function requestChanges() {
    if (!companyId || reason.trim().length < 3) return
    setRequestPending(true)
    try {
      await runStatusAction(
        () =>
          requestWorkspaceOfferChangesAction(
            companyId,
            id,
            reason.trim(),
            currentVersion,
          ),
        "CHANGES_REQUESTED",
      )
      setReason("")
      setRequestChangesOpen(false)
    } finally {
      setRequestPending(false)
    }
  }

  function confirm(
    title: string,
    nextStatus: string,
    task: () => Promise<{
      ok: boolean
      message?: string
      [key: string]: unknown
    }>,
    destructive = false,
  ) {
    setConfirmAction({
      title,
      description: `Confirm ${title.toLowerCase()} for this offer.`,
      confirmLabel: title,
      cancelLabel: labels.cancel,
      destructive,
      pendingLabel: "Processing…",
      onConfirm: () => runStatusAction(task, nextStatus),
    })
  }

  const canEditBidderOffer =
    mode === "bidder" &&
    (currentStatus === "DRAFT" || currentStatus === "CHANGES_REQUESTED") &&
    Boolean(editHref)
  const canAccept =
    mode === "buyer" &&
    Boolean(companyId) &&
    canDecideOffer(currentStatus, "ACCEPTED")
  const canReject =
    mode === "buyer" &&
    Boolean(companyId) &&
    canDecideOffer(currentStatus, "REJECTED")
  const canRequestChanges =
    mode === "buyer" &&
    Boolean(companyId) &&
    canDecideOffer(currentStatus, "CHANGES_REQUESTED")
  const canShortlist =
    mode === "buyer" &&
    Boolean(companyId) &&
    canDecideOffer(currentStatus, "SHORTLISTED")
  const canWithdrawBidderOffer =
    mode === "bidder" && canWithdrawOffer(currentStatus)
  const hasStatusAction =
    canAccept ||
    canReject ||
    canRequestChanges ||
    canShortlist ||
    canWithdrawBidderOffer

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="size-12 rounded-xl shadow-sm"
            aria-label={labels.actions}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={viewHref} prefetch>
              <Eye /> {labels.details}
            </Link>
          </DropdownMenuItem>
          {canEditBidderOffer && editHref ? (
            <DropdownMenuItem asChild>
              <Link href={editHref} prefetch>
                <PencilLine /> {labels.editDraft}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {hasStatusAction ? <DropdownMenuSeparator /> : null}
          {canAccept && companyId ? (
            <DropdownMenuItem
              onSelect={() =>
                confirm(labels.accept, "ACCEPTED", () =>
                  decideWorkspaceOfferAction(
                    companyId,
                    id,
                    "accept",
                    currentVersion,
                  ),
                )
              }
            >
              <Check /> {labels.accept}
            </DropdownMenuItem>
          ) : null}
          {canReject && companyId ? (
            <DropdownMenuItem
              onSelect={() =>
                confirm(
                  labels.reject,
                  "REJECTED",
                  () =>
                    decideWorkspaceOfferAction(
                      companyId,
                      id,
                      "reject",
                      currentVersion,
                    ),
                  true,
                )
              }
            >
              <XCircle /> {labels.reject}
            </DropdownMenuItem>
          ) : null}
          {canRequestChanges ? (
            <DropdownMenuItem onSelect={() => setRequestChangesOpen(true)}>
              <PencilLine /> {labels.requestChanges}
            </DropdownMenuItem>
          ) : null}
          {canShortlist && companyId ? (
            <DropdownMenuItem
              onSelect={() =>
                confirm(labels.shortlist, "SHORTLISTED", () =>
                  shortlistWorkspaceOfferAction(companyId, id, currentVersion),
                )
              }
            >
              <ListChecks /> {labels.shortlist}
            </DropdownMenuItem>
          ) : null}
          {canWithdrawBidderOffer ? (
            <DropdownMenuItem
              onSelect={() =>
                confirm(
                  labels.withdraw,
                  "WITHDRAWN",
                  () => withdrawPortalOfferAction(id, currentVersion),
                  true,
                )
              }
              className="text-danger"
            >
              <X /> {labels.withdraw}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReasonConfirmationDialog
        action={confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      />

      <PromptDialog
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        title={labels.requestChanges}
        description={labels.requestChanges}
        value={reason}
        onValueChange={setReason}
        confirmLabel={labels.requestChanges}
        cancelLabel={labels.cancel}
        pending={requestPending}
        minLength={3}
        onConfirm={() => void requestChanges()}
      />
    </>
  )
}
