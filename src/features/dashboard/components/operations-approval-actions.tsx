"use client"

import { useState } from "react"
import { Check, RotateCcw, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { transitionOperationsRecordAction } from "@/features/dashboard/actions/operations.actions"

type Resource =
  | "production"
  | "costs"
  | "materials/transactions"
  | "equipment-usage"
  | "forecasts"
  | "sal"

export function OperationsApprovalActions({
  companyId,
  projectId,
  resource,
  record,
}: {
  companyId: string
  projectId: string
  resource: Resource
  record: { id: string; status: string; version: number }
}) {
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const t = useTranslations("operations.approval")
  const run = (status: string, reason = "") =>
    transitionOperationsRecordAction(
      companyId,
      projectId,
      resource,
      record.id,
      { status, reason: reason || null, version: record.version },
    )
      .then((result) => {
        if (!result.ok) throw new Error(result.message)
        toast.success(t("updated"))
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t("failed"))
        throw error
      })
  const confirm = (status: string, title: string, destructive = false) =>
    setAction({
      title,
      description: t("transitionDescription"),
      confirmLabel: title,
      destructive,
      requireReason: destructive,
      reasonLabel: t("reason"),
      reasonPlaceholder: t("reasonPlaceholder"),
      onConfirm: (reason) => run(status, reason),
    })
  const dual = ["costs", "materials/transactions", "equipment-usage"].includes(
    resource,
  )
  return (
    <div className="flex min-w-max items-center justify-end gap-1">
      {record.status === "DRAFT" ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void run("SUBMITTED")}
        >
          <ShieldCheck className="size-3.5" /> {t("submit")}
        </Button>
      ) : null}
      {record.status === "SUBMITTED" ? (
        <Button
          size="sm"
          onClick={() =>
            confirm(
              dual ? "OPERATIONALLY_APPROVED" : "APPROVED",
              dual ? t("operationallyApprove") : t("approve"),
            )
          }
        >
          <Check className="size-3.5" /> {dual ? t("pmApprove") : t("approve")}
        </Button>
      ) : null}
      {record.status === "OPERATIONALLY_APPROVED" ? (
        <Button size="sm" onClick={() => confirm("APPROVED", t("postToLedger"))}>
          <Check className="size-3.5" /> {t("financePost")}
        </Button>
      ) : null}
      {["SUBMITTED", "OPERATIONALLY_APPROVED"].includes(record.status) ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-700"
          onClick={() => confirm("REJECTED", t("reject"), true)}
        >
          <X className="size-3.5" /> {t("reject")}
        </Button>
      ) : null}
      {["APPROVED", "REJECTED"].includes(record.status) ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => confirm("REOPENED", t("reopen"), true)}
        >
          <RotateCcw className="size-3.5" /> {t("reopen")}
        </Button>
      ) : null}
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      />
    </div>
  )
}
