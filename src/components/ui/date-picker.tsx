"use client"

import { CalendarIcon } from "lucide-react"
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
  const label = selected
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(selected)
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground h-10 w-full justify-start rounded-lg border bg-white px-3 text-sm font-normal shadow-none",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="text-muted-foreground size-4" aria-hidden="true" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl p-0">
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
      </PopoverContent>
    </Popover>
  )
}
