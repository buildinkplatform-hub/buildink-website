"use client"

import { CalendarDays, CalendarIcon, Check, RotateCcw, X } from "lucide-react"
import { useLocale } from "next-intl"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils/cn"

function parseIsoDate(value?: string) {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Select date",
  disabled,
  fromDate,
  toDate,
}: {
  id?: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
}) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIsoDate(value), [value])
  const today = new Date()
  const label = selected
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(selected)
    : placeholder
  const todayAllowed =
    (!fromDate || today >= fromDate) && (!toDate || today <= toDate)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          disabled={disabled}
          onBlur={onBlur}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "border-input bg-card text-foreground hover:border-primary/25 h-12 w-full justify-start rounded-2xl border px-3.5 text-sm font-normal shadow-[0_1px_2px_rgb(7_26_51/0.03)]",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="bg-primary/8 text-primary grid size-8 shrink-0 place-items-center rounded-xl">
            <CalendarIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 truncate text-start">{label}</span>
          {selected ? (
            <span
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label="Clear date"
              className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-7 place-items-center rounded-lg transition-colors"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (!disabled) onChange("")
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  event.stopPropagation()
                  if (!disabled) onChange("")
                }
              }}
            >
              <X className="size-3.5" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="border-border/80 w-auto overflow-hidden rounded-[1.4rem] p-0 shadow-[var(--shadow-floating)]"
      >
        <div className="bg-muted/25 border-b px-4 py-3">
          <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="text-primary size-4" />
            Choose a date
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Select from the calendar or use a quick action.
          </p>
        </div>
        <Calendar
          dir={locale === "ar" ? "rtl" : "ltr"}
          mode="single"
          selected={selected}
          disabled={
            fromDate && toDate
              ? [{ before: fromDate }, { after: toDate }]
              : fromDate
                ? { before: fromDate }
                : toDate
                  ? { after: toDate }
                  : undefined
          }
          onSelect={(date) => {
            if (!date) return
            onChange(toIsoDate(date))
            setOpen(false)
          }}
        />
        <div className="bg-muted/20 flex items-center justify-between gap-2 border-t px-3 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!todayAllowed}
            onClick={() => {
              onChange(toIsoDate(today))
              setOpen(false)
            }}
          >
            <CalendarDays className="size-4" />
            Today
          </Button>
          <div className="flex items-center gap-1.5">
            {selected ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
              >
                <RotateCcw className="size-4" />
                Clear
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              <Check className="size-4" />
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
