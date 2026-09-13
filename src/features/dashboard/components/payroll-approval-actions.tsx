"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("operations.payrollApproval")
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
          ? t("closeTitle")
          : next === "APPROVED"
            ? t("approveTitle")
            : t("submitTitle"),
      description:
        t("description"),
      confirmLabel:
        next === "CLOSED"
          ? t("closePeriod")
          : next === "APPROVED"
            ? t("approve")
            : t("submit"),
      requireReason: next === "CLOSED",
      reasonLabel: t("closeReason"),
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
        toast.success(t("updated"))
      },
    })
  }
  return (
    <>
      {next ? (
        <Button size="sm" onClick={open}>
          {next === "CLOSED"
            ? t("close")
            : next === "APPROVED"
              ? t("approve")
              : t("submit")}
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
