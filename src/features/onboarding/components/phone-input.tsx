"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumber,
  type Country,
  type Value,
} from "react-phone-number-input"
import PhoneNumberInput from "react-phone-number-input/input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils/cn"
import type { CountryOption } from "@/shared/types/platform"

function FlagIcon({
  country,
  label,
}: {
  country?: Country
  label: string
}) {
  const Flag = country ? flags[country] : undefined

  return (
    <span className="bg-muted flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] [&_svg]:h-full [&_svg]:w-full">
      {Flag ? <Flag title={label} /> : <span className="text-[10px] leading-4">--</span>}
    </span>
  )
}

function PhoneCountrySelect({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: Country
  options: CountryOption[]
  ariaLabel: string
  onChange: (country: Country) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selected = options.find((option) => option.code === value)
  const filtered = options.filter((option) => {
    if (!query.trim()) return true
    const callingCode = `+${getCountryCallingCode(option.code as Country)}`
    const haystack = `${option.name} ${option.code} ${callingCode}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-11 min-h-0 w-auto shrink-0 gap-1.5 rounded-s-[10px] rounded-e-none border-e-0 px-2.5 font-medium shadow-xs"
          aria-label={ariaLabel}
        >
          <FlagIcon country={value} label={selected?.name ?? ariaLabel} />
          <span className="text-muted-foreground text-xs font-semibold">
            +{getCountryCallingCode(value)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search country..."
          className="mb-2 h-9 min-h-0"
        />
        <div className="max-h-64 overflow-y-auto">
          {filtered.map((option) => {
            const active = option.code === value
            const callingCode = `+${getCountryCallingCode(option.code as Country)}`

            return (
              <button
                key={option.code}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                onClick={() => {
                  onChange(option.code as Country)
                  setOpen(false)
                  setQuery("")
                }}
              >
                <FlagIcon country={option.code as Country} label={option.name} />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    active
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {callingCode}
                </span>
              </button>
            )
          })}
          {!filtered.length ? (
            <p className="text-muted-foreground px-2 py-3 text-sm">
              No countries match that search.
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function PhoneInput({
  id,
  value,
  countryCode,
  countries,
  onChange,
  onCountryChange,
  onBlur,
}: {
  id: string
  value?: string
  countryCode?: string
  countries: CountryOption[]
  onChange: (value: string) => void
  onCountryChange: (value: string) => void
  onBlur?: () => void
}) {
  const t = useTranslations("common")
  const supportedCountries = countries.filter((country) =>
    isSupportedCountry(country.code),
  )
  const selectedCountry = (
    countryCode && isSupportedCountry(countryCode) ? countryCode : "IT"
  ) as Country

  return (
    <div className="flex w-full items-stretch">
      <PhoneCountrySelect
        value={selectedCountry}
        options={supportedCountries}
        ariaLabel={t("phoneCountry")}
        onChange={(nextCountry) => {
          const parsed = value ? parsePhoneNumber(value) : undefined
          const nextValue = parsed?.nationalNumber
            ? (`+${getCountryCallingCode(nextCountry)}${parsed.nationalNumber}` as Value)
            : undefined

          onCountryChange(nextCountry)
          onChange(nextValue ?? "")
        }}
      />
      <PhoneNumberInput
        id={id}
        country={selectedCountry}
        value={(value || undefined) as Value | undefined}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        onBlur={onBlur}
        autoComplete="tel"
        className="border-line text-ink placeholder:text-muted/65 focus:border-primary focus:ring-primary/20 aria-invalid:border-danger ltr-content h-11 min-h-0 w-full rounded-s-none rounded-e-[10px] border border-s-0 bg-white px-4 text-base transition outline-none focus:ring-3 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}
