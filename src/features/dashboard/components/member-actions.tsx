"use client"

import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  Settings2,
  Trash2,
  XCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  cancelWorkspaceMemberInviteAction,
  removeWorkspaceMemberAction,
  resendWorkspaceMemberInviteAction,
  updateWorkspaceMemberAction,
} from "@/features/dashboard/actions/portal.actions"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"

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

const memberStatuses = ["INVITED", "PENDING", "ACTIVE", "SUSPENDED"] as const

function labelize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function MemberActions({
  companyId,
  membershipId,
  detailHref,
  name,
  role,
  status,
  title,
  department,
  version,
  canEdit,
  canResend = canEdit,
  canRemove,
}: {
  companyId: string
  membershipId: string
  detailHref?: string
  name: string
  role: string
  status: string
  title: string | null
  department: string | null
  version: number
  canEdit: boolean
  canResend?: boolean
  canRemove: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(role)
  const [selectedStatus, setSelectedStatus] = useState(status)
  const [memberTitle, setMemberTitle] = useState(title ?? "")
  const [memberDepartment, setMemberDepartment] = useState(department ?? "")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const invited = status === "INVITED"

  async function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setPending(true)
    setMessage(undefined)
    const result = await action()
    setPending(false)
    if (result.ok) {
      setEditOpen(false)
      setRemoveOpen(false)
      router.refresh()
    } else {
      setMessage(result.message)
    }
  }

  if (!canEdit && !canResend && !canRemove) return null

  return (
    <div className="flex items-center justify-end gap-2">
      {canResend && invited ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            void run(() =>
              resendWorkspaceMemberInviteAction(companyId, membershipId),
            )
          }
          aria-label={t("dashboard.members.resendInvite")}
          title={t("dashboard.members.resendInvite")}
        >
          <RefreshCw className="size-4" />
          <span className="hidden xl:inline">
            {t("dashboard.members.resendInvite")}
          </span>
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label={t("dashboard.members.actions")}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {detailHref ? (
            <DropdownMenuItem asChild>
              <Link href={detailHref}>
                <Eye />
                {t("dashboard.table.details")}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Settings2 />
              {t("dashboard.members.edit")}
            </DropdownMenuItem>
          ) : null}
          {canEdit && status === "PENDING" ? (
            <>
              <DropdownMenuItem
                onSelect={() =>
                  void run(() =>
                    updateWorkspaceMemberAction(companyId, membershipId, {
                      role: selectedRole as (typeof memberRoles)[number],
                      status: "ACTIVE",
                      title: memberTitle || null,
                      department: memberDepartment || null,
                      version,
                    }),
                  )
                }
              >
                {t("dashboard.members.approveJoin")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-danger"
                onSelect={() => setRemoveOpen(true)}
              >
                {t("dashboard.members.rejectJoin")}
              </DropdownMenuItem>
            </>
          ) : null}
          {canResend && invited ? (
            <DropdownMenuItem
              onSelect={() =>
                void run(() =>
                  resendWorkspaceMemberInviteAction(companyId, membershipId),
                )
              }
            >
              <RefreshCw />
              {t("dashboard.members.resendInvite")}
            </DropdownMenuItem>
          ) : null}
          {canRemove ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger"
                onSelect={() => setRemoveOpen(true)}
              >
                {invited ? <XCircle /> : <Trash2 />}
                {invited
                  ? t("dashboard.members.cancelInvite")
                  : t("dashboard.members.remove")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.members.editTitle", { name })}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.members.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid min-w-0 gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              void run(() =>
                updateWorkspaceMemberAction(companyId, membershipId, {
                  role: selectedRole as (typeof memberRoles)[number],
                  status: selectedStatus as (typeof memberStatuses)[number],
                  title: memberTitle || null,
                  department: memberDepartment || null,
                  version,
                }),
              )
            }}
          >
            <Field
              label={t("dashboard.inviteMemberRole")}
              htmlFor={`member-role-${membershipId}`}
            >
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={pending}
              >
                <SelectTrigger id={`member-role-${membershipId}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelize(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label={t("dashboard.members.status")}
              htmlFor={`member-status-${membershipId}`}
            >
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={pending}
              >
                <SelectTrigger id={`member-status-${membershipId}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memberStatuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelize(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label={t("dashboard.members.title")}
              htmlFor={`member-title-${membershipId}`}
            >
              <Input
                id={`member-title-${membershipId}`}
                value={memberTitle}
                disabled={pending}
                onChange={(event) => setMemberTitle(event.target.value)}
              />
            </Field>
            <Field
              label={t("dashboard.members.department")}
              htmlFor={`member-department-${membershipId}`}
            >
              <Input
                id={`member-department-${membershipId}`}
                value={memberDepartment}
                disabled={pending}
                onChange={(event) => setMemberDepartment(event.target.value)}
              />
            </Field>
            {message ? <p className="text-danger text-sm">{message}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={t("common.removeConfirmTitle")}
        description={t("common.removeConfirmBody", { name })}
        confirmLabel={
          invited
            ? t("dashboard.members.cancelInvite")
            : t("dashboard.members.remove")
        }
        cancelLabel={t("common.cancel")}
        destructive
        pending={pending}
        onConfirm={() =>
          void run(() =>
            invited
              ? cancelWorkspaceMemberInviteAction(companyId, membershipId)
              : removeWorkspaceMemberAction(companyId, membershipId),
          )
        }
      />
    </div>
  )
}
