"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  removeWorkspaceMemberAction,
  updateWorkspaceMemberAction,
} from "@/features/dashboard/actions/portal.actions"
import { useRouter } from "@/i18n/navigation"

const memberRoles = [
  "COMPANY_ADMIN",
  "PROJECT_MANAGER",
  "BID_MANAGER",
  "PROCUREMENT_MANAGER",
  "HR_WORKFORCE",
  "FINANCE",
  "EDITOR",
  "VIEWER",
  "SUPERVISOR",
  "MEMBER",
] as const

export function MemberActions({
  companyId,
  membershipId,
  name,
  role,
  title,
  department,
  version,
  canEdit,
  canRemove,
}: {
  companyId: string
  membershipId: string
  name: string
  role: string
  title: string | null
  department: string | null
  version: number
  canEdit: boolean
  canRemove: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState(role)
  const [memberTitle, setMemberTitle] = useState(title ?? "")
  const [memberDepartment, setMemberDepartment] = useState(department ?? "")
  const [pending, setPending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState<string>()

  return (
    <>
      {canEdit ? (
        <Select
          value={selectedRole}
          disabled={pending}
          onValueChange={(nextRole) => {
            const previous = selectedRole
            setSelectedRole(nextRole)
            setPending(true)
          setMessage(undefined)
          void updateWorkspaceMemberAction(companyId, membershipId, {
            role: nextRole as (typeof memberRoles)[number],
              title: memberTitle || null,
              department: memberDepartment || null,
              version,
            }).then((result) => {
              setPending(false)
              if (result.ok) router.refresh()
              else {
                setSelectedRole(previous)
                setMessage(result.message)
              }
            })
          }}
        >
          <SelectTrigger
            className="min-h-9 w-44 text-xs"
            aria-label={t("dashboard.inviteMemberRole")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {memberRoles.map((value) => (
              <SelectItem key={value} value={value}>
                {value.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {canEdit ? (
        <Input
          className="min-h-9 w-36 text-xs"
          value={memberTitle}
          aria-label={t("dashboard.members.title")}
          placeholder={t("dashboard.members.title")}
          disabled={pending}
          onChange={(event) => setMemberTitle(event.target.value)}
        />
      ) : null}
      {canEdit ? (
        <Input
          className="min-h-9 w-36 text-xs"
          value={memberDepartment}
          aria-label={t("dashboard.members.department")}
          placeholder={t("dashboard.members.department")}
          disabled={pending}
          onChange={(event) => setMemberDepartment(event.target.value)}
        />
      ) : null}
      {canEdit ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setPending(true)
            setMessage(undefined)
            void updateWorkspaceMemberAction(companyId, membershipId, {
              title: memberTitle || null,
              department: memberDepartment || null,
              version,
            }).then((result) => {
              setPending(false)
              if (result.ok) router.refresh()
              else setMessage(result.message)
            })
          }}
        >
          {t("common.save")}
        </Button>
      ) : null}
      {canRemove ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          aria-label={t("dashboard.savedSearch.delete")}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
      {message ? (
        <span role="alert" className="text-danger text-xs">
          {message}
        </span>
      ) : null}
      {canRemove ? (
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("common.removeConfirmTitle")}
          description={t("common.removeConfirmBody", { name })}
          confirmLabel={t("dashboard.savedSearch.delete")}
          cancelLabel={t("common.cancel")}
          destructive
          pending={pending}
          onConfirm={() => {
            setPending(true)
            void removeWorkspaceMemberAction(companyId, membershipId).then(
              (result) => {
                setPending(false)
                if (result.ok) {
                  setConfirmOpen(false)
                  router.refresh()
                } else setMessage(result.message)
              },
            )
          }}
        />
      ) : null}
    </>
  )
}
