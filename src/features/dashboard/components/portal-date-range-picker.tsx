"use client"

import { useEffect, useMemo, useState } from "react"
import type { Locale } from "date-fns"
import { ar, enUS, it, ro, sq } from "date-fns/locale"
import { CalendarRange, Check, ChevronDown, RotateCcw, X } from "lucide-react"
import { useFormatter, useLocale } from "next-intl"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const dateLocales: Record<string, Locale> = { ar, en: enUS, it, ro, sq }

type Preset = "7d" | "30d" | "month"

export function PortalDateRangePicker() {
  const locale = useLocale()
  const format = useFormatter()
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()
  const [draft, setDraft] = useState<DateRange | undefined>()
  const [monthCount, setMonthCount] = useState(2)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)")
    const sync = () => setMonthCount(query.matches ? 2 : 1)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  const label = useMemo(() => formatRange(range, format), [format, range])
  const draftLabel = useMemo(() => formatRange(draft, format), [draft, format])
  const hasDraft = Boolean(draft?.from && draft.to)
  const draftChanged = !sameRange(draft, range)

  function close() {
    setDraft(range)
    setOpen(false)
  }

  function clear() {
    setRange(undefined)
    setDraft(undefined)
    setOpen(false)
  }

  function apply() {
    if (!draft?.from || !draft.to) return
    setRange(draft)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setDraft(range)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-primary/10 bg-card hover:border-primary/25 hover:bg-primary/[0.025] group h-10 min-w-10 justify-start gap-2 rounded-xl px-2.5 shadow-[var(--shadow-xs)] sm:min-w-48 sm:px-3"
          aria-label={`Date range: ${label}`}
        >
          <span className="bg-primary/[0.08] text-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
            <CalendarRange className="size-4" />
          </span>
          <span className="hidden min-w-0 flex-1 text-start sm:block">
            <span className="text-muted-foreground block text-[10px] font-semibold tracking-[0.12em] uppercase">
              Date range
            </span>
            <span className="text-foreground block truncate text-xs font-medium xl:text-sm">
              {label}
            </span>
          </span>
          <ChevronDown className="text-primary/60 hidden size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none sm:block" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="border-primary/10 bg-popover text-popover-foreground w-[calc(100vw-1rem)] max-w-[720px] overflow-hidden rounded-2xl border p-0 shadow-[var(--shadow-panel)]"
      >
        <div className="border-primary/10 bg-primary/[0.025] flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Reporting window
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              Choose a complete range before applying it to the current
              workspace.
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:bg-primary/[0.06] -me-1 -mt-1 size-8 shrink-0"
            onClick={close}
            aria-label="Close date range picker"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-[160px_minmax(0,1fr)]">
          <aside className="border-primary/10 bg-primary/[0.018] border-b p-3 md:border-e md:border-b-0">
            <p className="text-muted-foreground px-2 pb-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
              Quick ranges
            </p>
            <div className="grid grid-cols-3 gap-1.5 md:grid-cols-1">
              <PresetButton
                label="Last 7 days"
                preset="7d"
                draft={draft}
                onSelect={setDraft}
              />
              <PresetButton
                label="Last 30 days"
                preset="30d"
                draft={draft}
                onSelect={setDraft}
              />
              <PresetButton
                label="This month"
                preset="month"
                draft={draft}
                onSelect={setDraft}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border-primary/10 border-b px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <span
                  className="bg-primary size-2 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="text-foreground truncate font-medium">
                  {draftLabel}
                </span>
              </div>
            </div>
            <Calendar
              className="mx-auto p-3 sm:p-4"
              mode="range"
              selected={draft}
              onSelect={setDraft}
              numberOfMonths={monthCount}
              defaultMonth={draft?.from ?? range?.from}
              dir={locale === "ar" ? "rtl" : "ltr"}
              locale={dateLocales[locale] ?? enUS}
            />
          </div>
        </div>

        <div className="border-primary/10 bg-primary/[0.025] flex flex-col-reverse gap-2 border-t p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clear}
            disabled={!range?.from && !draft?.from}
            className="hover:bg-primary/[0.06] justify-center sm:justify-start"
          >
            <RotateCcw className="size-4" />
            Clear range
          </Button>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button type="button" size="sm" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={apply}
              disabled={!hasDraft || !draftChanged}
            >
              <Check className="size-4" />
              Apply range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PresetButton({
  label,
  preset,
  draft,
  onSelect,
}: {
  label: string
  preset: Preset
  draft?: DateRange
  onSelect: (range: DateRange) => void
}) {
  const value = presetRange(preset)
  const selected = sameRange(draft, value)

  return (
    <Button
      type="button"
      size="sm"
      variant={selected ? "secondary" : "ghost"}
      className="hover:bg-primary/[0.06] h-9 justify-between px-2.5 text-xs md:w-full"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
    >
      <span>{label}</span>
      {selected ? <Check className="hidden size-3.5 md:block" /> : null}
    </Button>
  )
}

function presetRange(preset: Preset): DateRange {
  const to = startOfDay(new Date())
  if (preset === "month") {
    return { from: new Date(to.getFullYear(), to.getMonth(), 1), to }
  }
  const days = preset === "7d" ? 7 : 30
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { from, to }
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function sameRange(left?: DateRange, right?: DateRange) {
  return (
    dayKey(left?.from) === dayKey(right?.from) &&
    dayKey(left?.to) === dayKey(right?.to)
  )
}

function dayKey(value?: Date) {
  if (!value) return ""
  return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
}

function formatRange(
  range: DateRange | undefined,
  format: ReturnType<typeof useFormatter>,
) {
  if (range?.from && range.to) {
    return `${format.dateTime(range.from, { dateStyle: "medium" })} – ${format.dateTime(range.to, { dateStyle: "medium" })}`
  }
  if (range?.from) {
    return `${format.dateTime(range.from, { dateStyle: "medium" })} – Select end date`
  }
  return "Select dates"
}
