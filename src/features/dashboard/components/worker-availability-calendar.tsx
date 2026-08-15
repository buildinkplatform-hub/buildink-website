"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import type { Matcher } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils/cn"

export type AvailabilityWindow = {
  id: string
  startsOn: string
  endsOn: string | null
  kind: string
  notes?: string | null
}

export type BusyPeriod = {
  id: string
  title: string | null
  startsAt: string | null
  expectedEndAt: string | null
  status: string
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function dateInWindow(date: Date, start: string, end: string | null) {
  const day = date.setHours(0, 0, 0, 0)
  const from = parseIsoDate(start)?.setHours(0, 0, 0, 0)
  if (from === undefined) return false
  if (!end) return day >= from
  const to = parseIsoDate(end)?.setHours(0, 0, 0, 0)
  if (to === undefined) return day >= from
  return day >= from && day <= to
}

function buildMatcher(
  windows: Array<{ startsOn: string; endsOn: string | null }>,
): Matcher {
  return (date) =>
    windows.some((window) => dateInWindow(date, window.startsOn, window.endsOn))
}

export function WorkerAvailabilityCalendar({
  availability,
  busyPeriods = [],
  className,
}: {
  availability: AvailabilityWindow[]
  busyPeriods?: BusyPeriod[]
  className?: string
}) {
  const t = useTranslations("dashboard.workforce")
  const locale = useLocale()
  const [month, setMonth] = useState(() => new Date())

  const available = useMemo(
    () => availability.filter((item) => item.kind === "AVAILABLE"),
    [availability],
  )
  const preferred = useMemo(
    () => availability.filter((item) => item.kind === "PREFERRED"),
    [availability],
  )
  const unavailable = useMemo(
    () => availability.filter((item) => item.kind === "UNAVAILABLE"),
    [availability],
  )
  const busy = useMemo(
    () =>
      busyPeriods
        .filter((item) =>
          ["PENDING_START", "ACTIVE", "PAUSED"].includes(item.status),
        )
        .map((item) => ({
          startsOn: item.startsAt ?? "",
          endsOn: item.expectedEndAt,
        }))
        .filter((item) => item.startsOn),
    [busyPeriods],
  )

  const modifiers = useMemo(
    () => ({
      available: buildMatcher(available),
      preferred: buildMatcher(preferred),
      unavailable: buildMatcher(unavailable),
      busy: buildMatcher(busy),
    }),
    [available, preferred, unavailable, busy],
  )

  const modifiersClassNames = {
    available: "bg-emerald-100 text-emerald-900 font-semibold rounded-md",
    preferred: "bg-sky-100 text-sky-900 font-semibold rounded-md",
    unavailable: "bg-rose-100 text-rose-900 line-through rounded-md",
    busy: "bg-amber-200 text-amber-950 font-semibold rounded-md ring-2 ring-amber-400",
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald-100" label={t("legendAvailable")} />
        <Legend color="bg-sky-100" label={t("legendPreferred")} />
        <Legend color="bg-rose-100" label={t("legendUnavailable")} />
        <Legend color="bg-amber-200 ring-amber-400 ring-2" label={t("legendBusy")} />
      </div>
      <Calendar
        dir={locale === "ar" ? "rtl" : "ltr"}
        mode="single"
        month={month}
        onMonthChange={setMonth}
        numberOfMonths={2}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="rounded-xl border p-2"
      />
      {busyPeriods.length ? (
        <ul className="space-y-1 text-sm">
          {busyPeriods.map((item) => (
            <li key={item.id} className="text-muted">
              {item.title ?? t("engagement")} · {item.status}
              {item.startsAt ? ` · ${item.startsAt.slice(0, 10)}` : ""}
              {item.expectedEndAt ? ` – ${item.expectedEndAt.slice(0, 10)}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-3 rounded-sm", color)} />
      {label}
    </span>
  )
}
