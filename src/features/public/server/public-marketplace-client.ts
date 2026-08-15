import "server-only"

import { publicBackendApi } from "@/lib/backend/public-api"
import type {
  DirectoryQuery,
  DirectoryResult,
  PublicEntityRecord,
  PublicHomeView,
  PublicModule,
  PublicReview,
  PublicReviewSummary,
  PublicReviewTarget,
} from "@/features/public/types/public.types"
import type { Locale } from "@/shared/types/platform"

type PaginatedResponse<T> = {
  items: T[]
  pageInfo: {
    page: number
    pageSize: number
    total: number
    hasNextPage: boolean
  }
  facets?: {
    regions: string[]
    categories: string[]
    verifications: string[]
  }
}

const MODULE_PATH: Partial<Record<PublicModule, string>> = {
  companies: "companies",
  suppliers: "companies",
  projects: "projects",
  tenders: "tenders",
  equipment: "equipment",
  profiles: "profiles",
  "opportunities-companies": "opportunities",
  "opportunities-workers": "opportunities",
}

function buildParams(query: DirectoryQuery, locale: Locale, extra?: Record<string, string>) {
  const params = new URLSearchParams({
    locale,
    page: String(query.page ?? 1),
    pageSize: "6",
    q: query.q ?? "",
    region: query.region ?? "",
    category: query.category ?? "",
    verification: query.verification ?? "",
  })
  if (query.accountType) params.set("accountType", query.accountType)
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value)
    }
  }
  return params
}

export async function fetchPublicHome(locale: Locale) {
  return publicBackendApi<{
    featured: PublicHomeView["featured"]
    aggregates?: {
      companies: number
      tenders: number
      workers: number
      projects: number
    }
  }>(`/api/v1/public/marketplace/home?locale=${locale}`)
}

export async function fetchPublicDirectory(
  module: PublicModule,
  locale: Locale,
  query: DirectoryQuery,
): Promise<DirectoryResult<PublicEntityRecord> | null> {
  const path = MODULE_PATH[module]
  if (!path) return null
  const params = buildParams(query, locale, {
    companyType: module === "suppliers" ? "SUPPLIER" : "",
  })
  const response = await publicBackendApi<PaginatedResponse<PublicEntityRecord>>(
    `/api/v1/public/marketplace/${path}?${params.toString()}`,
  ).catch(() => null)
  if (!response) return null
  const totalPages = Math.max(
    1,
    Math.ceil(response.pageInfo.total / response.pageInfo.pageSize),
  )
  return {
    items: response.items,
    page: response.pageInfo.page,
    total: response.pageInfo.total,
    totalPages,
    query,
  }
}

export async function fetchPublicFacets(
  module: PublicModule,
  locale: Locale,
) {
  const result = await fetchPublicDirectory(module, locale, { page: 1 })
  if (!result) return null
  const path = MODULE_PATH[module]
  if (!path) return null
  const params = buildParams({ page: 1 }, locale, {
    companyType: module === "suppliers" ? "SUPPLIER" : "",
  })
  const response = await publicBackendApi<PaginatedResponse<PublicEntityRecord>>(
    `/api/v1/public/marketplace/${path}?${params.toString()}`,
  ).catch(() => null)
  return response?.facets ?? null
}

export async function fetchPublicEntity(
  module: PublicModule,
  slug: string,
  locale: Locale,
): Promise<PublicEntityRecord | null> {
  const path = MODULE_PATH[module]
  if (!path) return null
  return publicBackendApi<PublicEntityRecord>(
    `/api/v1/public/marketplace/${path}/${encodeURIComponent(slug)}?locale=${locale}`,
  ).catch(() => null)
}

export async function fetchPublicCatalogueItem(
  id: string,
  locale: Locale,
): Promise<PublicEntityRecord | null> {
  return publicBackendApi<PublicEntityRecord>(
    `/api/v1/public/marketplace/catalogue/${encodeURIComponent(id)}?locale=${locale}`,
  ).catch(() => null)
}

export async function fetchPublicSearch(locale: Locale, query: DirectoryQuery) {
  const params = buildParams(query, locale)
  return publicBackendApi<{ items: PublicEntityRecord[] }>(
    `/api/v1/public/marketplace/search?${params.toString()}`,
  ).catch(() => ({ items: [] }))
}

export async function fetchPublicReviews(
  target: PublicReviewTarget,
  locale: Locale,
) {
  const params = new URLSearchParams({
    locale,
    targetType: target.type,
    targetId: target.id,
    page: "1",
    pageSize: "20",
  })
  return publicBackendApi<{
    items: PublicReview[]
    summary: PublicReviewSummary
    pageInfo: PaginatedResponse<unknown>["pageInfo"]
  }>(`/api/v1/public/marketplace/reviews?${params.toString()}`).catch(() => null)
}
