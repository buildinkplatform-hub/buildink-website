"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CountryOption } from "@/shared/types/platform"

const callingCodes: Record<string, string> = {
  AE: "+971",
  CA: "+1",
  DE: "+49",
  FR: "+33",
  GB: "+44",
  IT: "+39",
  PK: "+92",
  SA: "+966",
  US: "+1",
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
  const selectedCountry = countryCode && callingCodes[countryCode] ? countryCode : "IT"
  const dialCode = callingCodes[selectedCountry] ?? "+39"
  const localNumber = value?.startsWith(dialCode)
    ? value.slice(dialCode.length).trimStart()
    : value?.replace(/^\+\d+\s*/, "") ?? ""

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(9rem,12rem)_1fr]">
      <Select
        value={selectedCountry}
        onValueChange={(nextCountry) => {
          const nextDialCode = callingCodes[nextCountry] ?? ""
          onCountryChange(nextCountry)
          onChange(`${nextDialCode}${localNumber.replace(/\D/g, "")}`)
        }}
      >
        <SelectTrigger aria-label="Phone country">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries
            .filter((country) => callingCodes[country.code])
            .map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name} {callingCodes[country.code]}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className="ltr-content"
        value={localNumber}
        onBlur={onBlur}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "")
          onChange(`${dialCode}${digits}`)
        }}
      />
    </div>
  )
}
