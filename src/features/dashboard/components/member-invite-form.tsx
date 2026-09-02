"use client"

import { useState } from "react"
import { Loader2, UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
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
  PortalFormActions,
  PortalFormSection,
  PortalInlineAlert,
} from "@/features/dashboard/components/portal-form-layout"
import { inviteWorkspaceMemberAction } from "@/features/dashboard/actions/portal.actions"

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

function roleLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function MemberInviteForm({ companyId }: { companyId: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<(typeof memberRoles)[number]>("MEMBER")
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error"
    message: string
  }>()

  return (
    <form
      className="min-w-0"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault()
        if (pending || !email.trim()) return
        setPending(true)
        setFeedback(undefined)
        void inviteWorkspaceMemberAction(companyId, {
          invitationEmail: email.trim(),
          role,
          title: title.trim() || null,
          department: department.trim() || null,
        }).then((result) => {
          setPending(false)
          if (result.ok) {
            setEmail("")
            setTitle("")
            setDepartment("")
            setFeedback({
              tone: "success",
              message: t("dashboard.members.invited"),
            })
            router.refresh()
          } else {
            setFeedback({ tone: "error", message: result.message })
          }
        })
      }}
    >
      <PortalFormSection
        title={t("dashboard.inviteMemberSend")}
        description={t("dashboard.descriptions.members")}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label={t("dashboard.inviteMemberEmail")}
            htmlFor="member-email"
            required
          >
            <Input
              id="member-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={pending}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label={t("dashboard.inviteMemberRole")} htmlFor="member-role">
            <Select
              value={role}
              disabled={pending}
              onValueChange={(value) =>
                setRole(value as (typeof memberRoles)[number])
              }
            >
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {memberRoles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {roleLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("dashboard.members.title")} htmlFor="member-title">
            <Input
              id="member-title"
              value={title}
              disabled={pending}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.members.department")}
            htmlFor="member-department"
          >
            <Input
              id="member-department"
              value={department}
              disabled={pending}
              onChange={(event) => setDepartment(event.target.value)}
            />
          </Field>
        </div>

        {feedback ? (
          <PortalInlineAlert
            tone={feedback.tone}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </PortalInlineAlert>
        ) : null}

        <PortalFormActions
          sticky={false}
          hint={`${roleLabel(role)} · ${department.trim() || t("dashboard.members.department")}`}
        >
          <Button type="submit" disabled={pending || !email.trim()}>
            {pending ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {t("dashboard.inviteMemberSend")}
          </Button>
        </PortalFormActions>
      </PortalFormSection>
    </form>
  )
}
