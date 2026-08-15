"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import {
  archiveProjectAction,
  publishProjectAction,
  transitionProjectAction,
} from "@/features/dashboard/actions/portal.actions"
import {
  hasPortalPermission,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"

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
  const router = useRouter()
  const [selected, setSelected] = useState<string>()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const available = (transitions[status] ?? []).filter((next) =>
    hasPortalPermission(
      permissions,
      permissionByTransition[next] ?? "projects.edit",
    ),
  )

  async function confirm() {
    if (!selected) return
    setPending(true)
    setMessage(undefined)
    const result =
      selected === "PUBLISHED"
        ? await publishProjectAction(id, version)
        : selected === "ARCHIVED"
          ? await archiveProjectAction(id, version)
          : await transitionProjectAction(id, {
              status: selected as
                | "DRAFT"
                | "IN_PROGRESS"
                | "COMPLETED"
                | "ON_HOLD"
                | "CANCELLED"
                | "ARCHIVED",
              version,
            })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setSelected(undefined)
    router.refresh()
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
            onClick={() => setSelected(next)}
          >
            {t(`dashboard.projects.lifecycle.${next}`)}
          </Button>
        ))}
      </div>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <ConfirmationDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
        title={t("dashboard.projects.lifecycle.confirmTitle")}
        description={t("dashboard.projects.lifecycle.confirmDescription", {
          status: selected ? t(`dashboard.projects.lifecycle.${selected}`) : "",
        })}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        pending={pending}
        destructive={selected === "ARCHIVED" || selected === "CANCELLED"}
        onConfirm={() => void confirm()}
      />
    </div>
  )
}
