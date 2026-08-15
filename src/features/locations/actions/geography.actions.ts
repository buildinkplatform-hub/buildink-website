"use server"

import {
  getPortalCity,
  getPortalGeographyOptions,
} from "@/features/dashboard/data/portal-client"

export async function getGeographyCascadingOptionsAction(input: {
  level: "countries" | "regions" | "cities"
  countryCode?: string
  regionId?: string
  limit?: number
  offset?: number
  status?: "ACTIVE" | "all"
}) {
  try {
    const params = new URLSearchParams({
      level: input.level,
      limit: String(input.limit ?? 100),
      offset: String(input.offset ?? 0),
      status: input.status ?? "ACTIVE",
    })
    if (input.countryCode) params.set("countryCode", input.countryCode)
    if (input.regionId) params.set("regionId", input.regionId)
    const data = await getPortalGeographyOptions(params.toString())
    return { ok: true as const, items: data.items, level: data.level }
  } catch {
    return { ok: false as const, items: [] as Array<{ id: string; label: string }> }
  }
}

export async function getCityAction(cityId: string) {
  try {
    const data = await getPortalCity(cityId)
    return { ok: true as const, city: data.city }
  } catch {
    return { ok: false as const }
  }
}
