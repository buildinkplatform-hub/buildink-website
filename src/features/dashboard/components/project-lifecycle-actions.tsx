"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import {
  archiveProjectAction,
  publishProjectAction,
  transitionProjectAction,
} from "@/features/dashboard/actions/portal.actions"
import {
  hasPortalPermission,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"
import { usePortalMutationRunner } from "@/features/dashboard/query/use-portal-mutation"

const transitions: Record<string, string[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED", "ARCHIVED"],
  PENDING_REVIEW: ["DRAFT", "PUBLISHED", "CANCELLED", "ARCHIVED"],
  PUBLISHED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED", "ARCHIVED"],
  IN_PROGRESS: ["ON_HOLD", "COMPLETED", "CANCELLED", "ARCHIVED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
}

const permissionByTransition: Record<string, CompanyPermission> = {
  PUBLISHED: "projects.publish",
  ARCHIVED: "projects.archive",
}

export function ProjectLifecycleActions({
  id,
  version,
  status,
  permissions,
}: {
  id: string
  version: number
  status: string
  permissions: readonly string[]
}) {
  const t = useTranslations()
  const runMutation = usePortalMutationRunner()
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const [message, setMessage] = useState<string>()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentVersion, setCurrentVersion] = useState(version)
  const available = (transitions[currentStatus] ?? []).filter((next) =>
    hasPortalPermission(
      permissions,
      permissionByTransition[next] ?? "projects.edit",
    ),
  )

  async function confirm(nextStatus: string, reason: string) {
    setMessage(undefined)
    const optimisticVersion = currentVersion + 1
    const result = await runMutation(
      () =>
        nextStatus === "PUBLISHED"
          ? publishProjectAction(id, currentVersion)
          : nextStatus === "ARCHIVED"
            ? archiveProjectAction(id, currentVersion)
            : transitionProjectAction(id, {
                status: nextStatus as
                  | "DRAFT"
                  | "IN_PROGRESS"
                  | "COMPLETED"
                  | "ON_HOLD"
                  | "CANCELLED"
                  | "ARCHIVED",
                reason: reason.trim() || undefined,
                version: currentVersion,
              }),
      {
        optimistic: {
          id,
          patch: {
            status: nextStatus,
            ...(nextStatus === "PUBLISHED"
              ? { publicationStatus: "PUBLISHED" }
              : {}),
            version: optimisticVersion,
          },
        },
      },
    )
    if (!result.ok) {
      setMessage(result.message)
      throw new Error(result.message ?? "Could not update project")
    }
    const payload = result.data as
      { status?: string; version?: number } | undefined
    setCurrentStatus(payload?.status ?? nextStatus)
    setCurrentVersion(payload?.version ?? optimisticVersion)
  }

  if (!available.length) return null
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {available.map((next) => (
          <Button
            key={next}
            type="button"
            size="sm"
            variant={
              next === "ARCHIVED" || next === "CANCELLED"
                ? "secondary"
                : "primary"
            }
            onClick={() => {
              setMessage(undefined)
              setAction({
                title: t("dashboard.projects.lifecycle.confirmTitle"),
                description: t(
                  "dashboard.projects.lifecycle.confirmDescription",
                  {
                    status: t(`dashboard.projects.lifecycle.${next}`),
                  },
                ),
                confirmLabel: t(`dashboard.projects.lifecycle.${next}`),
                cancelLabel: t("common.cancel"),
                pendingLabel: t("dashboard.projects.table.processing"),
                destructive: next === "ARCHIVED" || next === "CANCELLED",
                requireReason: next === "ARCHIVED" || next === "CANCELLED",
                reasonLabel: t("dashboard.projects.table.reasonLabel"),
                reasonPlaceholder: t(
                  "dashboard.projects.table.reasonPlaceholder",
                ),
                onConfirm: (reason) => confirm(next, reason),
              })
            }}
          >
            {t(`dashboard.projects.lifecycle.${next}`)}
          </Button>
        ))}
      </div>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      >
        {message ? <p className="text-danger text-sm">{message}</p> : null}
      </ReasonConfirmationDialog>
    </div>
  )
}
