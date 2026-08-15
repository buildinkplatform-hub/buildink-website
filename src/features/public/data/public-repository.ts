import type { Locale } from "@/shared/types/platform"
import type {
  DirectoryQuery,
  DirectoryResult,
  PublicArticle,
  PublicEntityRecord,
  PublicHelpArticle,
  PublicHomeView,
  PublicLegalDocument,
  PublicModule,
  PublicReviewTarget,
} from "@/features/public/types/public.types"
import {
  helpArticles,
  legalDocuments,
  publicArticles,
  publicEntities,
} from "@/features/public/data/public-fixtures"
import {
  fetchPublicCatalogueItem,
  fetchPublicDirectory,
  fetchPublicEntity,
  fetchPublicFacets,
  fetchPublicHome,
  fetchPublicReviews,
  fetchPublicSearch,
} from "@/features/public/server/public-marketplace-client"

const PAGE_SIZE = 6
const allowFixtures = process.env.NODE_ENV !== "production"

function emptyDirectory(
  module: PublicModule,
  query: DirectoryQuery,
): DirectoryResult<PublicEntityRecord> {
  return {
    items: [],
    page: Math.max(1, query.page ?? 1),
    total: 0,
    totalPages: 1,
    query,
  }
}

function formatCount(value: number, locale: Locale) {
  return new Intl.NumberFormat(
    locale === "ar" ? "ar" : locale === "it" ? "it-IT" : "en-GB",
  ).format(value)
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? ""
}

function matchesQuery(item: PublicEntityRecord, query: DirectoryQuery) {
  const q = normalize(query.q)
  if (
    q &&
    ![
      item.title,
      item.subtitle,
      item.summary,
      item.location,
      ...item.categories,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  )
    return false

  const region = normalize(query.region)
  if (region && !item.location.toLowerCase().includes(region)) return false

  const category = normalize(query.category)
  if (
    category &&
    ![...item.categories, ...item.tags].some((entry) =>
      entry.toLowerCase().includes(category),
    )
  )
    return false

  const verification = normalize(query.verification)
  if (
    verification &&
    !item.verification.toLowerCase().includes(verification)
  )
    return false

  return true
}

function listPublicEntitiesFromFixtures(
  module: PublicModule,
  query: DirectoryQuery,
): DirectoryResult<PublicEntityRecord> {
  const page = Math.max(1, query.page ?? 1)
  const filtered = publicEntities[module].filter((item) => matchesQuery(item, query))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    page,
    total: filtered.length,
    totalPages,
    query,
  }
}

function getDirectoryFacetsFromFixtures(module: PublicModule) {
  const items = publicEntities[module]
  const regions = [...new Set(items.map((item) => item.location))].sort()
  const categories = [
    ...new Set(items.flatMap((item) => [...item.categories, ...item.tags])),
  ].sort()
  const verifications = [...new Set(items.map((item) => item.verification))].sort()
  return { regions, categories, verifications }
}

export async function getHomeView(locale: Locale): Promise<PublicHomeView> {
  const metricLabels =
    locale === "it"
      ? ["Imprese", "Gare attive", "Lavoratori", "Progetti"]
      : locale === "ar"
        ? ["الشركات", "المناقصات النشطة", "العمال", "المشاريع"]
        : ["Companies", "Active tenders", "Workers", "Projects"]

  const apiHome = await fetchPublicHome(locale).catch(() => null)
  const featured = apiHome?.featured ?? (allowFixtures
    ? {
        companies: publicEntities.companies.slice(0, 2),
        profiles: publicEntities.profiles.slice(0, 2),
        projects: publicEntities.projects.slice(0, 1),
        tenders: publicEntities.tenders.slice(0, 1),
      }
    : { companies: [], profiles: [], projects: [], tenders: [] })
  const aggregates = apiHome?.aggregates ?? {
    companies: 0,
    tenders: 0,
    workers: 0,
    projects: 0,
  }

  return {
    locale,
    metrics: [
      { label: metricLabels[0], value: formatCount(aggregates.companies, locale) },
      { label: metricLabels[1], value: formatCount(aggregates.tenders, locale) },
      { label: metricLabels[2], value: formatCount(aggregates.workers, locale) },
      { label: metricLabels[3], value: formatCount(aggregates.projects, locale) },
    ],
    featured,
    testimonials: [
      {
        name: "Giulia Romano",
        role: "Project coordinator",
        quote:
          "The clearer the public profile, the faster we can decide whether to open a conversation.",
      },
      {
        name: "Hasan Khalid",
        role: "Supplier representative",
        quote:
          "A strong public directory experience makes the private workflow feel much more credible.",
      },
      {
        name: "Anna Bianchi",
        role: "Restoration contractor",
        quote:
          "Buildink makes it much easier to discover serious opportunities without wasting time on unclear listings.",
      },
    ],
  }
}

export async function listPublicEntities(
  module: PublicModule,
  query: DirectoryQuery,
  locale: Locale = "en",
): Promise<DirectoryResult<PublicEntityRecord>> {
  const api = await fetchPublicDirectory(module, locale, query)
  if (api) return api
  if (!allowFixtures) return emptyDirectory(module, query)
  return listPublicEntitiesFromFixtures(module, query)
}

export async function getDirectoryFacets(
  module: PublicModule,
  locale: Locale = "en",
) {
  const api = await fetchPublicFacets(module, locale)
  if (api) return api
  if (!allowFixtures) return { regions: [], categories: [], verifications: [] }
  return getDirectoryFacetsFromFixtures(module)
}

export async function getPublicEntity(
  module: PublicModule,
  slug: string,
  locale: Locale = "en",
): Promise<PublicEntityRecord | null> {
  const api = await fetchPublicEntity(module, slug, locale)
  if (api) return api
  if (!allowFixtures) return null
  return publicEntities[module].find((item) => item.slug === slug) ?? null
}

export async function getPublicCatalogueItem(
  id: string,
  locale: Locale = "en",
): Promise<PublicEntityRecord | null> {
  return fetchPublicCatalogueItem(id, locale)
}

export function getCompanySubpage(slug: string, section: string) {
  const company = publicEntities.companies.find((item) => item.slug === slug)
  return company?.subpages?.find((item) => item.slug === section) ?? null
}

export async function getCompanySubpageFromEntity(
  item: PublicEntityRecord,
  section: string,
) {
  return item.subpages?.find((entry) => entry.slug === section) ?? null
}

export async function getRelatedEntities(
  module: PublicModule,
  item: PublicEntityRecord,
  locale: Locale = "en",
): Promise<PublicEntityRecord[]> {
  const related = item.relatedSlugs ?? []
  const targetModule =
    module === "projects" || module === "tenders" || module === "equipment"
      ? "companies"
      : module
  const resolved = await Promise.all(
    related.map((slug) => getPublicEntity(targetModule, slug, locale)),
  )
  return resolved.filter((entry): entry is PublicEntityRecord => Boolean(entry))
}

export async function searchAll(query: DirectoryQuery, locale: Locale = "en") {
  const api = await fetchPublicSearch(locale, query)
  if (api.items.length) return api.items
  if (!allowFixtures) return []
  return (Object.keys(publicEntities) as PublicModule[]).flatMap((module) =>
    publicEntities[module]
      .filter((item) => matchesQuery(item, query))
      .slice(0, 2),
  )
}

export function listArticles() {
  return allowFixtures ? publicArticles : []
}

export function getArticle(slug: string): PublicArticle | null {
  if (!allowFixtures) return null
  return publicArticles.find((article) => article.slug === slug) ?? null
}

export function listHelpArticles() {
  return allowFixtures ? helpArticles : []
}

export function getHelpArticle(slug: string): PublicHelpArticle | null {
  if (!allowFixtures) return null
  return helpArticles.find((article) => article.slug === slug) ?? null
}

export function getLegalDocument(slug: string): PublicLegalDocument | null {
  if (!allowFixtures) return null
  return legalDocuments.find((document) => document.slug === slug) ?? null
}

export async function getPublicReviews(
  target: PublicReviewTarget,
  locale: Locale,
) {
  const result = await fetchPublicReviews(target, locale)
  if (result) {
    return { items: result.items, summary: result.summary }
  }
  return {
    items: [],
    summary: {
      average: 0,
      count: 0,
      histogram: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
    },
  }
}
