"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getGeographyCascadingOptionsAction } from "@/features/locations/actions/geography.actions"

type Option = { id: string; label: string }

export function LocationPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: { countryCode?: string; regionId?: string; cityId?: string }
  onChange: (next: {
    countryCode?: string
    regionId?: string
    cityId?: string
    regionLabel?: string
    cityLabel?: string
  }) => void
  disabled?: boolean
}) {
  const t = useTranslations("locations")
  const [countries, setCountries] = React.useState<Option[]>([])
  const [regions, setRegions] = React.useState<Option[]>([])
  const [cities, setCities] = React.useState<Option[]>([])
  const [countriesLoaded, setCountriesLoaded] = React.useState(false)
  const [regionsForCountry, setRegionsForCountry] = React.useState<string>()
  const [citiesForRegion, setCitiesForRegion] = React.useState<string>()

  React.useEffect(() => {
    let active = true
    void getGeographyCascadingOptionsAction({ level: "countries" }).then(
      (response) => {
        if (!active) return
        if (response.ok) {
          setCountries(
            response.items.map((item) => ({ id: item.id, label: item.label })),
          )
        }
        setCountriesLoaded(true)
      },
    )
    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    if (!value.countryCode) {
      return
    }
    let active = true
    void getGeographyCascadingOptionsAction({
      level: "regions",
      countryCode: value.countryCode,
    }).then((response) => {
      if (!active) return
      setRegions(
        response.ok
          ? response.items.map((item) => ({ id: item.id, label: item.label }))
          : [],
      )
      setRegionsForCountry(value.countryCode)
    })
    return () => {
      active = false
    }
  }, [value.countryCode])

  React.useEffect(() => {
    if (!value.regionId) {
      return
    }
    let active = true
    void getGeographyCascadingOptionsAction({
      level: "cities",
      regionId: value.regionId,
    }).then((response) => {
      if (!active) return
      setCities(
        response.ok
          ? response.items.map((item) => ({ id: item.id, label: item.label }))
          : [],
      )
      setCitiesForRegion(value.regionId)
    })
    return () => {
      active = false
    }
  }, [value.regionId])

  const countriesLoading = !countriesLoaded
  const regionsLoading = Boolean(
    value.countryCode && regionsForCountry !== value.countryCode,
  )
  const citiesLoading = Boolean(
    value.regionId && citiesForRegion !== value.regionId,
  )
  const visibleRegions = regionsLoading ? [] : regions
  const visibleCities = citiesLoading ? [] : cities

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={value.countryCode ?? ""}
        onValueChange={(countryCode) =>
          disabled
            ? undefined
            : onChange({
                countryCode: countryCode || undefined,
                regionId: undefined,
                cityId: undefined,
              })
        }
        disabled={disabled || countriesLoading}
      >
        <SelectTrigger aria-label={t("fields.country")}>
          <SelectValue placeholder={t("fields.country")} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.regionId ?? ""}
        onValueChange={(regionId) =>
          disabled || !value.countryCode
            ? undefined
            : onChange({
                regionId: regionId || undefined,
                cityId: undefined,
                countryCode: value.countryCode,
                regionLabel: visibleRegions.find((item) => item.id === regionId)
                  ?.label,
              })
        }
        disabled={disabled || !value.countryCode || regionsLoading}
      >
        <SelectTrigger aria-label={t("fields.region")}>
          <SelectValue placeholder={t("fields.region")} />
        </SelectTrigger>
        <SelectContent>
          {visibleRegions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.cityId ?? ""}
        onValueChange={(cityId) =>
          disabled || !value.regionId
            ? undefined
            : onChange({
                cityId: cityId || undefined,
                countryCode: value.countryCode,
                regionId: value.regionId,
                cityLabel: visibleCities.find((item) => item.id === cityId)?.label,
                regionLabel: visibleRegions.find(
                  (item) => item.id === value.regionId,
                )?.label,
              })
        }
        disabled={disabled || !value.regionId || citiesLoading}
      >
        <SelectTrigger aria-label={t("fields.cityName")}>
          <SelectValue placeholder={t("fields.cityName")} />
        </SelectTrigger>
        <SelectContent>
          {visibleCities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
