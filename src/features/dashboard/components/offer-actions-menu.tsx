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
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"
import { Link } from "@/i18n/navigation"

type Labels = {
  actions: string
  details: string
  accept: string
  reject: string
  requestChanges: string
  shortlist: string
  withdraw: string
  cancel: string
}

export function OfferActionsMenu({
  mode,
  companyId,
  id,
  version,
  viewHref,
  labels,
}: {
  mode: "buyer" | "bidder"
  companyId?: string
  id: string
  version: number
  viewHref: string
  labels: Labels
}) {
  const runMutation = usePortalMutationRunner()
  const [confirmAction, setConfirmAction] = useState<ReasonedAction | null>(
    null,
  )
  const [requestChangesOpen, setRequestChangesOpen] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const [reason, setReason] = useState("")
  const [currentVersion, setCurrentVersion] = useState(version)

  async function runStatusAction(
    task: () => Promise<{
      ok: boolean
      message?: string
      [key: string]: unknown
    }>,
    status: string,
  ) {
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(task, {
      optimistic: {
        id,
        patch: { status, version: optimisticVersion },
      },
    })
    if (!result.ok) throw new Error(result.message ?? "Could not update offer")
    const payload = (result.data ?? result.offer) as
      { version?: number } | undefined
    setCurrentVersion(payload?.version ?? optimisticVersion)
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
    status: string,
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
      onConfirm: () => runStatusAction(task, status),
    })
  }

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
          <DropdownMenuSeparator />
          {mode === "buyer" && companyId ? (
            <>
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
              <DropdownMenuItem onSelect={() => setRequestChangesOpen(true)}>
                <PencilLine /> {labels.requestChanges}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  confirm(labels.shortlist, "SHORTLISTED", () =>
                    shortlistWorkspaceOfferAction(
                      companyId,
                      id,
                      currentVersion,
                    ),
                  )
                }
              >
                <ListChecks /> {labels.shortlist}
              </DropdownMenuItem>
            </>
          ) : (
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
          )}
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
