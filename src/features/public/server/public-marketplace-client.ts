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

type RawPublicModule =
  | PublicModule
  | "profiles"
  | "suppliers"
  | "opportunities-companies"
  | "opportunities-workers"

type RawPublicEntityRecord = Omit<PublicEntityRecord, "module"> & {
  module: RawPublicModule
}

type PaginatedResponse<T> = {
  items: T[]
  pageInfo: {
    page: number
    pageSize: number
    total: number
    hasNextPage: boolean
  }
  facets?: {
    countries: string[]
    regions: string[]
    cities: string[]
    categories: string[]
    verifications: string[]
  }
}

const MODULE_PATH: Partial<Record<PublicModule, string>> = {
  companies: "companies",
  "project-owners": "profiles",
  subcontractors: "profiles",
  "service-providers": "profiles",
  workers: "profiles",
  projects: "projects",
  tenders: "tenders",
  equipment: "equipment",
  opportunities: "opportunities",
}

const MODULE_ACCOUNT_TYPE: Partial<Record<PublicModule, string>> = {
  "project-owners": "PROJECT_OWNER",
  subcontractors: "SUBCONTRACTOR",
  "service-providers": "SERVICE_PROVIDER",
  workers: "WORKER",
}

function profileModuleFromSubtitle(subtitle: string | undefined): PublicModule {
  switch (subtitle) {
    case "PROJECT_OWNER":
      return "project-owners"
    case "SUBCONTRACTOR":
      return "subcontractors"
    case "SERVICE_PROVIDER":
      return "service-providers"
    case "WORKER":
    default:
      return "workers"
  }
}

function normalizePublicEntity(
  item: RawPublicEntityRecord,
  requestedModule?: PublicModule,
): PublicEntityRecord {
  if (requestedModule) {
    if (MODULE_ACCOUNT_TYPE[requestedModule]) {
      return { ...item, module: requestedModule }
    }
    if (requestedModule === "companies" && item.module === "suppliers") {
      return { ...item, module: "companies" }
    }
    if (requestedModule === "opportunities") {
      return { ...item, module: "opportunities" }
    }
  }

  switch (item.module) {
    case "profiles":
      return { ...item, module: profileModuleFromSubtitle(item.subtitle) }
    case "suppliers":
      return { ...item, module: "companies" }
    case "opportunities":
    case "opportunities-companies":
    case "opportunities-workers":
      return { ...item, module: "opportunities" }
    default:
      return { ...item, module: item.module as PublicModule }
  }
}

function buildParams(query: DirectoryQuery, locale: Locale, extra?: Record<string, string>) {
  const params = new URLSearchParams({
    locale,
    page: String(query.page ?? 1),
    pageSize: "6",
    q: query.q ?? "",
    country: query.country ?? "",
    region: query.region ?? "",
    city: query.city ?? "",
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
    featured: {
      companies: RawPublicEntityRecord[]
      profiles: RawPublicEntityRecord[]
      projects: RawPublicEntityRecord[]
      tenders: RawPublicEntityRecord[]
    }
    aggregates?: {
      companies: number
      tenders: number
      workers: number
      projects: number
    }
  }>(`/api/v1/public/marketplace/home?locale=${locale}`).then((response) => ({
    ...response,
    featured: {
      companies: response.featured.companies.map((item) =>
        normalizePublicEntity(item, "companies"),
      ),
      profiles: response.featured.profiles.map((item) =>
        normalizePublicEntity(item, "workers"),
      ),
      projects: response.featured.projects.map((item) =>
        normalizePublicEntity(item, "projects"),
      ),
      tenders: response.featured.tenders.map((item) =>
        normalizePublicEntity(item, "tenders"),
      ),
    } satisfies PublicHomeView["featured"],
  }))
}

export async function fetchPublicDirectory(
  module: PublicModule,
  locale: Locale,
  query: DirectoryQuery,
): Promise<DirectoryResult<PublicEntityRecord> | null> {
  const path = MODULE_PATH[module]
  if (!path) return null
  const params = buildParams(query, locale, {
    accountType: MODULE_ACCOUNT_TYPE[module] ?? query.accountType ?? "",
  })
  const response = await publicBackendApi<PaginatedResponse<RawPublicEntityRecord>>(
    `/api/v1/public/marketplace/${path}?${params.toString()}`,
  ).catch(() => null)
  if (!response) return null
  const totalPages = Math.max(
    1,
    Math.ceil(response.pageInfo.total / response.pageInfo.pageSize),
  )
  return {
    items: response.items.map((item) => normalizePublicEntity(item, module)),
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
    accountType: MODULE_ACCOUNT_TYPE[module] ?? "",
  })
  const response = await publicBackendApi<PaginatedResponse<RawPublicEntityRecord>>(
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
  const effectiveSlug = encodeURIComponent(slug)
  return publicBackendApi<RawPublicEntityRecord>(
    `/api/v1/public/marketplace/${path}/${effectiveSlug}?locale=${locale}`,
  )
    .then((item) => normalizePublicEntity(item, module))
    .catch(() => null)
}

export async function fetchPublicCatalogueItem(
  id: string,
  locale: Locale,
): Promise<PublicEntityRecord | null> {
  return publicBackendApi<RawPublicEntityRecord>(
    `/api/v1/public/marketplace/catalogue/${encodeURIComponent(id)}?locale=${locale}`,
  )
    .then((item) => normalizePublicEntity(item, "companies"))
    .catch(() => null)
}

export async function fetchPublicSearch(locale: Locale, query: DirectoryQuery) {
  const params = buildParams(query, locale)
  return publicBackendApi<{ items: RawPublicEntityRecord[] }>(
    `/api/v1/public/marketplace/search?${params.toString()}`,
  )
    .then((response) => ({
      items: response.items.map((item) => normalizePublicEntity(item)),
    }))
    .catch(() => ({ items: [] }))
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
