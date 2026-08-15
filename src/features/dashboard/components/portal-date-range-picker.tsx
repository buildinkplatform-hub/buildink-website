"use client"

import { useMemo, useState } from "react"
import type { Locale } from "date-fns"
import { ar, enUS, it, ro, sq } from "date-fns/locale"
import { CalendarRange, RotateCcw } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const dateLocales: Record<string, Locale> = { ar, en: enUS, it, ro, sq }

export function PortalDateRangePicker() {
  const t = useTranslations()
  const locale = useLocale()
  const format = useFormatter()
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()

  const label = useMemo(() => {
    if (range?.from && range.to) {
      return `${format.dateTime(range.from, { dateStyle: "medium" })} - ${format.dateTime(range.to, { dateStyle: "medium" })}`
    }
    return "Select dates"
  }, [format, range])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="border-line hover:border-line hover:bg-accent hidden h-10 min-w-36 items-center justify-start gap-2 rounded-[10px] border bg-white px-4 text-sm font-medium text-brand-navy transition md:inline-flex"
          aria-label={label}
        >
          <CalendarRange className="text-primary size-4" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[352px] max-w-[calc(100vw-1rem)] p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold text-brand-navy">Select dates</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Filter dashboard information by date range.
          </p>
        </div>
        <Calendar
          className="mx-auto"
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={1}
          defaultMonth={range?.from}
          dir={locale === "ar" ? "rtl" : "ltr"}
          locale={dateLocales[locale] ?? enUS}
        />
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRange(undefined)}
          >
            <RotateCcw className="size-4" />
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={!range?.from || !range.to}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
