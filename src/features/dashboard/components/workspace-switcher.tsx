"use client"

import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { getActiveWorkspace } from "@/features/dashboard/lib/active-workspace"
import { activateWorkspaceAction } from "@/features/dashboard/actions/portal.actions"
import { useRouter } from "@/i18n/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SwitchableWorkspace {
  companyId: string
  name: string
  role: string
  status: string
  isPrimary: boolean
  version: number
}

export function WorkspaceSwitcher({
  workspaces,
}: {
  workspaces: SwitchableWorkspace[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const active = getActiveWorkspace(workspaces)
  const [selected, setSelected] = useState(active?.companyId ?? "")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  if (!active) return null

  return (
    <div className="min-w-0 shrink-0">
      <Select
        value={selected}
        disabled={pending || workspaces.length < 2}
        onValueChange={(companyId) => {
          const workspace = workspaces.find(
            (item) => item.companyId === companyId,
          )
          if (!workspace || workspace.companyId === active.companyId) return
          setSelected(companyId)
          setPending(true)
          setMessage(undefined)
          void activateWorkspaceAction(companyId, workspace.version).then(
            (result) => {
              setPending(false)
              if (!result.ok) {
                setSelected(active.companyId)
                setMessage(result.message)
                return
              }
              router.refresh()
            },
          )
        }}
      >
        <SelectTrigger
          id="portal-workspace"
          aria-label={t("dashboard.workspaceSwitcher.label")}
          aria-describedby={message ? "portal-workspace-error" : undefined}
          className="size-11 min-h-11 justify-center px-0 sm:h-11 sm:w-auto sm:max-w-56 sm:justify-between sm:px-3 [&>span]:hidden sm:[&>span]:block [&>svg]:hidden sm:[&>svg]:block"
        >
          <Building2
            className="text-primary size-4 shrink-0"
            aria-hidden="true"
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {workspaces
            .filter((item) => item.status === "ACTIVE")
            .map((item) => (
              <SelectItem key={item.companyId} value={item.companyId}>
                {item.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {message ? (
        <span id="portal-workspace-error" className="sr-only" role="alert">
          {message}
        </span>
      ) : null}
    </div>
  )
}
