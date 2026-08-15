import type { DirectoryQuery } from "@/features/public/types/public.types"

export function parseDirectoryQuery(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
): DirectoryQuery {
  const pageParam = searchParams?.page
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const page = Number(pageValue)

  function value(key: string) {
    const raw = searchParams?.[key]
    return Array.isArray(raw) ? raw[0] : raw
  }

  return {
    q: value("q"),
    region: value("region"),
    category: value("category"),
    verification: value("verification"),
    accountType: value("accountType"),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function buildQueryString(query: DirectoryQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  return params.toString()
}
