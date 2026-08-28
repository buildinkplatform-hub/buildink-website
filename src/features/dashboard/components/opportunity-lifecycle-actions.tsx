"use client"

import { Edit3, Eye, MoreHorizontal, Send, XCircle } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

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
  publishOpportunityAction,
  withdrawOpportunityAction,
} from "@/features/dashboard/actions/portal.actions"
import {
  portalDetailPath,
  portalEditPath,
} from "@/features/dashboard/config/portal-routes"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"
import { Link } from "@/i18n/navigation"

export function OpportunityLifecycleActions({
  id,
  status,
  title,
  version,
  canEdit,
}: {
  id: string
  status: string | null | undefined
  title: string
  version?: number
  canEdit: boolean
}) {
  const t = useTranslations()
  const runMutation = usePortalMutationRunner()
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const [message, setMessage] = useState<string>()
  const [currentStatus, setCurrentStatus] = useState(status ?? "DRAFT")
  const [currentVersion, setCurrentVersion] = useState(version)
  const canPublish =
    canEdit && ["DRAFT", "PENDING_REVIEW"].includes(currentStatus)
  const canWithdraw =
    canEdit &&
    ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "OPEN", "PAUSED"].includes(
      currentStatus,
    )

  async function publish() {
    if (!currentVersion) return
    setMessage(undefined)
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(
      () => publishOpportunityAction(id, currentVersion),
      {
        optimistic: {
          id,
          patch: {
            statusV1: "PUBLISHED",
            publicationStatus: "PUBLISHED",
            version: optimisticVersion,
          },
        },
      },
    )
    if (!result.ok) {
      setMessage(result.message)
      throw new Error(result.message ?? "Could not publish opportunity")
    }
    const payload = result.data as
      | { statusV1?: string; publicationStatus?: string; version?: number }
      | undefined
    setCurrentStatus(payload?.statusV1 ?? "PUBLISHED")
    setCurrentVersion(payload?.version ?? optimisticVersion)
  }

  async function withdraw(reason: string) {
    if (!currentVersion) return
    setMessage(undefined)
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(
      () => withdrawOpportunityAction(id, currentVersion, reason),
      {
        optimistic: {
          id,
          patch: {
            statusV1: "CANCELLED",
            publicationStatus: "UNPUBLISHED",
            version: optimisticVersion,
          },
        },
      },
    )
    if (!result.ok) {
      setMessage(result.message)
      throw new Error(result.message ?? "Could not withdraw opportunity")
    }
    const payload = result.data as
      | { statusV1?: string; publicationStatus?: string; version?: number }
      | undefined
    setCurrentStatus(payload?.statusV1 ?? "CANCELLED")
    setCurrentVersion(payload?.version ?? optimisticVersion)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={t("dashboard.opportunity.actionsFor", { title })}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={portalDetailPath("opportunities", id)} prefetch>
              <Eye className="size-4" />
              {t("dashboard.table.details")}
            </Link>
          </DropdownMenuItem>
          {canEdit ? (
            <DropdownMenuItem asChild>
              <Link href={portalEditPath("opportunities", id)} prefetch>
                <Edit3 className="size-4" />
                {t("dashboard.edit.open")}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canPublish || canWithdraw ? <DropdownMenuSeparator /> : null}
          {canPublish ? (
            <DropdownMenuItem
              onSelect={() => {
                setMessage(undefined)
                setAction({
                  title: t("dashboard.publish.publish"),
                  description: t("dashboard.publish.confirmOpportunity"),
                  confirmLabel: t("dashboard.publish.publish"),
                  cancelLabel: t("common.cancel"),
                  pendingLabel: t("dashboard.opportunity.processing"),
                  onConfirm: publish,
                })
              }}
            >
              <Send className="size-4" />
              {t("dashboard.publish.publish")}
            </DropdownMenuItem>
          ) : null}
          {canWithdraw ? (
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onSelect={() => {
                setMessage(undefined)
                setAction({
                  title: t("dashboard.opportunity.withdraw"),
                  description: t("dashboard.opportunity.withdrawDescription", {
                    title,
                  }),
                  confirmLabel: t("dashboard.opportunity.withdraw"),
                  cancelLabel: t("common.cancel"),
                  destructive: true,
                  pendingLabel: t("dashboard.opportunity.processing"),
                  reasonLabel: t("dashboard.opportunity.reasonLabel"),
                  reasonPlaceholder: t(
                    "dashboard.opportunity.reasonPlaceholder",
                  ),
                  requireReason: true,
                  onConfirm: withdraw,
                })
              }}
            >
              <XCircle className="size-4" />
              {t("dashboard.opportunity.withdraw")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      >
        {message ? <p className="text-danger text-sm">{message}</p> : null}
      </ReasonConfirmationDialog>
    </>
  )
}
