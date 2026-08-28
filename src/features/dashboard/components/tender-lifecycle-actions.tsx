"use client"

import { useState } from "react"

import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { transitionTenderAction } from "@/features/dashboard/actions/portal.actions"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"

const transitions: Record<
  string,
  Array<"OPEN" | "CLOSED" | "EVALUATION" | "AWARDED" | "CANCELLED" | "ARCHIVED">
> = {
  DRAFT: ["OPEN", "CANCELLED", "ARCHIVED"],
  OPEN: ["CLOSED", "CANCELLED", "ARCHIVED"],
  CLOSED: ["EVALUATION", "CANCELLED", "ARCHIVED"],
  EVALUATION: ["AWARDED", "CANCELLED", "ARCHIVED"],
  AWARDED: ["ARCHIVED"],
}

export function TenderLifecycleActions({
  id,
  version,
  status,
}: {
  id: string
  version: number
  status: string
}) {
  const runMutation = usePortalMutationRunner()
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const [message, setMessage] = useState<string>()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentVersion, setCurrentVersion] = useState(version)
  const available = transitions[currentStatus] ?? []

  if (!available.length) return null

  async function confirm(next: (typeof available)[number], reason: string) {
    setMessage(undefined)
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(
      () =>
        transitionTenderAction(id, {
          status: next,
          reason: reason.trim() || undefined,
          version: currentVersion,
        }),
      {
        optimistic: {
          id,
          patch: { status: next, version: optimisticVersion },
        },
      },
    )
    if (!result.ok) {
      setMessage(result.message)
      throw new Error(result.message ?? "Could not update tender")
    }
    const payload = result.data as
      { status?: string; version?: number } | undefined
    setCurrentStatus(payload?.status ?? next)
    setCurrentVersion(payload?.version ?? optimisticVersion)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {available.map((next) => (
          <Button
            key={next}
            type="button"
            size="sm"
            variant={
              next === "CANCELLED" || next === "ARCHIVED"
                ? "secondary"
                : "primary"
            }
            onClick={() =>
              setAction({
                title: `Move tender to ${next.replaceAll("_", " ")}`,
                description: "Confirm this tender lifecycle change.",
                confirmLabel: next.replaceAll("_", " "),
                cancelLabel: "Cancel",
                pendingLabel: "Updating…",
                destructive: next === "CANCELLED" || next === "ARCHIVED",
                requireReason: next === "CANCELLED" || next === "ARCHIVED",
                reasonLabel: "Reason",
                reasonPlaceholder: "Explain this change",
                onConfirm: (reason) => confirm(next, reason),
              })
            }
          >
            {next.replaceAll("_", " ")}
          </Button>
        ))}
      </div>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => !open && setAction(null)}
      />
    </div>
  )
}
