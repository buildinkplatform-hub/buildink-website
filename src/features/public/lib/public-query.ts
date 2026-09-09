import type { DirectoryQuery } from "@/features/public/types/public.types"

export function parseDirectoryQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): DirectoryQuery {
  const pageParam = searchParams?.page
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const page = Number(pageValue)

  function value(key: string) {
    const raw = searchParams?.[key]
    const resolved = Array.isArray(raw) ? raw[0] : raw
    return resolved && resolved !== "__all__" ? resolved : undefined
  }

  return {
    q: value("q"),
    country: value("country"),
    region: value("region"),
    city: value("city"),
    category: value("category"),
    verification: value("verification"),
    companyType: value("companyType"),
    accountType: value("accountType"),
    services: value("services"),
    projectStage: value("projectStage"),
    procurementStage: value("procurementStage"),
    tenderStatus: value("tenderStatus"),
    sourceType: value("sourceType"),
    submissionChannel: value("submissionChannel"),
    deadlineBucket: value("deadlineBucket"),
    listingType: value("listingType"),
    availabilityStatus: value("availabilityStatus"),
    opportunityType: value("opportunityType"),
    opportunityStatus: value("opportunityStatus"),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function buildQueryString(query: DirectoryQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "__all__"
    )
      continue
    params.set(key, String(value))
  }
  return params.toString()
}
