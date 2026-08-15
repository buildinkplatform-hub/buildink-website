"use client"

import * as React from "react"

import { LocationPicker } from "@/components/forms/location-picker"
import { getCityAction } from "@/features/locations/actions/geography.actions"

export function CityLocationField({
  cityId,
  onChange,
  disabled = false,
}: {
  cityId?: string
  onChange: (
    cityId: string,
    meta?: { regionLabel?: string; cityLabel?: string; countryCode?: string },
  ) => void
  disabled?: boolean
}) {
  const [resolved, setResolved] = React.useState<{
    countryCode?: string
    regionId?: string
  }>({})

  React.useEffect(() => {
    if (!cityId) return
    let active = true
    void getCityAction(cityId).then((response) => {
      if (!active || !response.ok) return
      setResolved({
        regionId: response.city.regionId,
        countryCode: response.city.countryCode,
      })
    })
    return () => {
      active = false
    }
  }, [cityId])

  return (
    <LocationPicker
      value={cityId ? { cityId, ...resolved } : resolved}
      disabled={disabled}
      onChange={(next) => {
        setResolved({
          countryCode: next.countryCode,
          regionId: next.regionId,
        })
        onChange(next.cityId ?? "", {
          regionLabel: next.regionLabel,
          cityLabel: next.cityLabel,
          countryCode: next.countryCode,
        })
      }}
    />
  )
}
