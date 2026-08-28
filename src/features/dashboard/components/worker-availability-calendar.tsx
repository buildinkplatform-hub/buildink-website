"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  XCircle,
} from "lucide-react"
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
  const [monthCount, setMonthCount] = useState(2)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)")
    const sync = () => setMonthCount(query.matches ? 2 : 1)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

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
  const activeBusyPeriods = useMemo(
    () =>
      busyPeriods.filter((item) =>
        ["PENDING_START", "ACTIVE", "PAUSED"].includes(item.status),
      ),
    [busyPeriods],
  )
  const busy = useMemo(
    () =>
      activeBusyPeriods
        .map((item) => ({
          startsOn: item.startsAt ?? "",
          endsOn: item.expectedEndAt,
        }))
        .filter((item) => item.startsOn),
    [activeBusyPeriods],
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
    available:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold rounded-md",
    preferred:
      "bg-sky-500/15 text-sky-800 dark:text-sky-300 font-semibold rounded-md",
    unavailable:
      "bg-rose-500/15 text-rose-800 dark:text-rose-300 line-through rounded-md",
    busy: "bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold rounded-md ring-2 ring-amber-500/50",
  }

  return (
    <section className={cn("space-y-5", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AvailabilityStat
          icon={CheckCircle2}
          label={t("legendAvailable")}
          value={available.length}
          tone="available"
        />
        <AvailabilityStat
          icon={Sparkles}
          label={t("legendPreferred")}
          value={preferred.length}
          tone="preferred"
        />
        <AvailabilityStat
          icon={XCircle}
          label={t("legendUnavailable")}
          value={unavailable.length}
          tone="unavailable"
        />
        <AvailabilityStat
          icon={BriefcaseBusiness}
          label={t("legendBusy")}
          value={activeBusyPeriods.length}
          tone="busy"
        />
      </div>

      <div className="bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/15 flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <h3 className="text-foreground font-semibold">
                Availability calendar
              </h3>
              <p className="text-muted-foreground mt-0.5 text-sm">
                See preferred dates, blocked time and active engagements
                together.
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-2 text-xs">
            <Legend tone="available" label={t("legendAvailable")} />
            <Legend tone="preferred" label={t("legendPreferred")} />
            <Legend tone="unavailable" label={t("legendUnavailable")} />
            <Legend tone="busy" label={t("legendBusy")} />
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <Calendar
            dir={locale === "ar" ? "rtl" : "ltr"}
            mode="single"
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={monthCount}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="mx-auto w-fit max-w-full rounded-xl border-0 p-2 sm:p-3"
          />
        </div>
      </div>

      <div className="bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/15 flex items-center gap-3 border-b px-4 py-4 sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Clock3 className="size-4.5" />
          </span>
          <div>
            <h3 className="text-foreground font-semibold">
              Current engagements
            </h3>
            <p className="text-muted-foreground text-sm">
              Scheduled work that affects when you can accept another
              assignment.
            </p>
          </div>
        </div>

        {activeBusyPeriods.length ? (
          <ul className="divide-y">
            {activeBusyPeriods.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate font-semibold">
                    {item.title ?? t("engagement")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatRange(item.startsAt, item.expectedEndAt)}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {labelize(item.status)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center">
            <CheckCircle2 className="mx-auto size-7 text-emerald-600 dark:text-emerald-400" />
            <p className="text-foreground mt-2 font-medium">
              No active engagements
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Your calendar has no current booking conflicts.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function AvailabilityStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays
  label: string
  value: number
  tone: "available" | "preferred" | "unavailable" | "busy"
}) {
  const toneClasses = {
    available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    preferred: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    unavailable: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    busy: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  }
  return (
    <div className="bg-card text-card-foreground flex items-center gap-3 rounded-xl border p-4 shadow-sm">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          toneClasses[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-xs font-medium">
          {label}
        </p>
        <p className="text-foreground mt-0.5 text-xl font-bold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}

function Legend({
  tone,
  label,
}: {
  tone: "available" | "preferred" | "unavailable" | "busy"
  label: string
}) {
  const colors = {
    available: "bg-emerald-500",
    preferred: "bg-sky-500",
    unavailable: "bg-rose-500",
    busy: "bg-amber-500 ring-2 ring-amber-500/30",
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-full", colors[tone])} />
      {label}
    </span>
  )
}

function formatRange(start: string | null, end: string | null) {
  if (!start) return "Dates not set"
  const startLabel = start.slice(0, 10)
  return end ? `${startLabel} – ${end.slice(0, 10)}` : `From ${startLabel}`
}

function labelize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
