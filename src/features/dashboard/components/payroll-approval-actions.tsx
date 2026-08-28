"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { transitionPayrollAction } from "@/features/dashboard/actions/operations.actions"

export function PayrollApprovalActions({
  companyId,
  row,
}: {
  companyId: string
  row: { id: string; status: string; version: number }
}) {
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const next =
    row.status === "DRAFT"
      ? "REVIEW"
      : row.status === "REVIEW"
        ? "APPROVED"
        : row.status === "APPROVED"
          ? "CLOSED"
          : null
  const open = () => {
    if (!next) return
    setAction({
      title:
        next === "CLOSED"
          ? "Close payroll period"
          : next === "APPROVED"
            ? "Approve payroll"
            : "Submit payroll for review",
      description:
        "Payroll is derived only from approved attendance and frozen rate snapshots.",
      confirmLabel:
        next === "CLOSED"
          ? "Close period"
          : next === "APPROVED"
            ? "Approve"
            : "Submit",
      requireReason: next === "CLOSED",
      reasonLabel: "Close reason",
      onConfirm: async (reason) => {
        const result = await transitionPayrollAction(companyId, row.id, {
          status: next,
          version: row.version,
          reason: reason || null,
        })
        if (!result.ok) {
          toast.error(result.message)
          throw new Error(result.message)
        }
        toast.success("Payroll status updated")
      },
    })
  }
  return (
    <>
      {next ? (
        <Button size="sm" onClick={open}>
          {next === "CLOSED"
            ? "Close"
            : next === "APPROVED"
              ? "Approve"
              : "Submit"}
        </Button>
      ) : null}
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(openState) => {
          if (!openState) setAction(null)
        }}
      />
    </>
  )
}
