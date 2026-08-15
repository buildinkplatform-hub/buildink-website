"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

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

export function MemberInviteForm({ companyId }: { companyId: string }) {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<(typeof memberRoles)[number]>("MEMBER")
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  return (
    <form
      className="border-line grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_160px_160px_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        setPending(true)
        void inviteWorkspaceMemberAction(companyId, {
          invitationEmail: email,
          role,
          title: title || null,
          department: department || null,
        }).then((result) => {
          setPending(false)
          if (result.ok) {
            setEmail("")
            setTitle("")
            setDepartment("")
            setMessage(undefined)
          } else {
            setMessage(result.message)
          }
        })
      }}
    >
      <Field
        label={t("dashboard.inviteMemberEmail")}
        htmlFor="member-email"
        required
      >
        <Input
          id="member-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      <Field label={t("dashboard.members.title")} htmlFor="member-title">
        <Input
          id="member-title"
          value={title}
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
          onChange={(event) => setDepartment(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.inviteMemberRole")} htmlFor="member-role">
        <Select
          value={role}
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
                {item.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || !email}>
          {t("dashboard.inviteMemberSend")}
        </Button>
      </div>
      {message ? (
        <p className="text-danger text-sm sm:col-span-2 xl:col-span-5">
          {message}
        </p>
      ) : null}
    </form>
  )
}
