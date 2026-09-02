"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

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
  stageWorkspaceApplicationAction,
} from "@/features/dashboard/actions/portal.actions"
import {
  availableApplicationStages,
  canDecideApplication,
  type ApplicationHiringStage,
} from "@/features/dashboard/lib/application-decision"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"

export function ApplicationReviewActions({
  companyId,
  id,
  version,
  status,
  updateStageLabel,
  acceptLabel,
  rejectLabel,
}: {
  companyId: string
  id: string
  version: number
  status: string
  updateStageLabel: string
  acceptLabel: string
  rejectLabel: string
}) {
  const runMutation = usePortalMutationRunner()
  const stages = useMemo(() => availableApplicationStages(status), [status])
  const [stage, setStage] = useState<ApplicationHiringStage | undefined>(
    stages[0],
  )
  const [pendingAction, setPendingAction] = useState<string>()
  const canAccept = canDecideApplication(status, "ACCEPTED")
  const canReject = canDecideApplication(status, "REJECTED")

  async function moveStage() {
    if (!stage || !stages.includes(stage)) return
    setPendingAction("stage")
    try {
      await runMutation(
        () => stageWorkspaceApplicationAction(companyId, id, stage, version),
        {
          optimistic: {
            id,
            patch: { status: stage, version: version + 1 },
          },
        },
      )
    } finally {
      setPendingAction(undefined)
    }
  }

  async function decide(decision: "accept" | "reject") {
    if (
      (decision === "accept" && !canAccept) ||
      (decision === "reject" && !canReject)
    ) {
      return
    }
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

  if (!stages.length && !canAccept && !canReject) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.length ? (
        <>
          <Select
            value={stage}
            disabled={Boolean(pendingAction)}
            onValueChange={(value) => setStage(value as ApplicationHiringStage)}
          >
            <SelectTrigger
              aria-label={updateStageLabel}
              className="min-h-9 min-w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="secondary"
            disabled={Boolean(pendingAction) || !stage}
            onClick={() => void moveStage()}
          >
            {pendingAction === "stage" ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {updateStageLabel}
          </Button>
        </>
      ) : null}
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
    </div>
  )
}
