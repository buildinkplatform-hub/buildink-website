"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createWorkerRecordAction,
  deleteWorkerRecordAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalWorkforceOverview } from "@/features/dashboard/data/portal-client"
import { WorkerAvailabilityCalendar } from "@/features/dashboard/components/worker-availability-calendar"

const availabilityKinds = ["AVAILABLE", "UNAVAILABLE", "PREFERRED"] as const

export function WorkerProfileRecords({ data }: { data: PortalWorkforceOverview }) {
  const t = useTranslations("dashboard.workforce")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [availableFrom, setAvailableFrom] = useState("")
  const [availableTo, setAvailableTo] = useState("")
  const [availabilityKind, setAvailabilityKind] =
    useState<(typeof availabilityKinds)[number]>("AVAILABLE")
  const [credentialTitle, setCredentialTitle] = useState("")
  const [credentialIssuer, setCredentialIssuer] = useState("")
  const [credentialExpiry, setCredentialExpiry] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [workStartsOn, setWorkStartsOn] = useState("")

  async function create(
    kind: "availability" | "credentials" | "work-history",
    body: Record<string, unknown>,
  ) {
    setPending(true)
    const result = await createWorkerRecordAction(kind, body)
    setPending(false)
    if (result.ok) router.refresh()
  }

  async function remove(
    kind: "availability" | "credentials" | "work-history",
    id: string,
  ) {
    setPending(true)
    const result = await deleteWorkerRecordAction(kind, id)
    setPending(false)
    if (result.ok) router.refresh()
  }

  return (
    <section className="border-line space-y-5 rounded-xl border p-4">
      <h2 className="text-brand-navy text-lg font-semibold">{t("title")}</h2>
      <WorkerAvailabilityCalendar
        availability={data.availability}
        busyPeriods={data.busyPeriods ?? []}
      />
      <div className="space-y-2">
        <h3 className="font-semibold">{t("availability")}</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <DatePicker
            value={availableFrom}
            onChange={setAvailableFrom}
            placeholder={t("from")}
          />
          <DatePicker
            value={availableTo}
            onChange={setAvailableTo}
            placeholder={t("to")}
            fromDate={availableFrom ? parseDate(availableFrom) : undefined}
          />
          <Select
            value={availabilityKind}
            onValueChange={(value) =>
              setAvailabilityKind(value as typeof availabilityKind)
            }
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availabilityKinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={pending || !availableFrom}
            onClick={() =>
              void create("availability", {
                startsOn: availableFrom,
                endsOn: availableTo || null,
                kind: availabilityKind,
              })
            }
          >
            {t("add")}
          </Button>
        </div>
        {data.availability.map((item) => (
          <Record key={item.id} text={`${item.kind} · ${date(item.startsOn)} – ${item.endsOn ? date(item.endsOn) : t("openEnded")}`} onDelete={() => remove("availability", item.id)} disabled={pending} label={t("remove")} />
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{t("credentials")}</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input placeholder={t("credentialTitle")} value={credentialTitle} onChange={(event) => setCredentialTitle(event.target.value)} />
          <Input placeholder={t("issuer")} value={credentialIssuer} onChange={(event) => setCredentialIssuer(event.target.value)} />
          <Input type="date" aria-label={t("expires")} value={credentialExpiry} onChange={(event) => setCredentialExpiry(event.target.value)} />
          <Button disabled={pending || !credentialTitle.trim()} onClick={() => void create("credentials", { title: credentialTitle, issuer: credentialIssuer || null, expiresOn: credentialExpiry || null })}>{t("add")}</Button>
        </div>
        {data.credentials.map((item) => (
          <Record key={item.id} text={`${item.title} · ${item.status}${item.expiresOn ? ` · ${date(item.expiresOn)}` : ""}`} onDelete={() => remove("credentials", item.id)} disabled={pending} label={t("remove")} />
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{t("workHistory")}</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input placeholder={t("companyName")} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          <Input placeholder={t("roleTitle")} value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} />
          <Input type="date" aria-label={t("from")} value={workStartsOn} onChange={(event) => setWorkStartsOn(event.target.value)} />
          <Button disabled={pending || !companyName.trim() || !roleTitle.trim() || !workStartsOn} onClick={() => void create("work-history", { companyName, roleTitle, startsOn: workStartsOn })}>{t("add")}</Button>
        </div>
        {data.workHistory.map((item) => (
          <Record key={item.id} text={`${item.roleTitle} · ${item.companyName} · ${item.verificationStatus}`} onDelete={() => remove("work-history", item.id)} disabled={pending} label={t("remove")} />
        ))}
      </div>
    </section>
  )
}

function Record({ text, onDelete, disabled, label }: { text: string; onDelete: () => void; disabled: boolean; label: string }) {
  return (
    <div className="bg-muted/20 flex items-center justify-between gap-3 rounded-lg p-3 text-sm">
      <span>{text}</span>
      <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void onDelete()}>{label}</Button>
    </div>
  )
}

function date(value: string) {
  return value.slice(0, 10)
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}
