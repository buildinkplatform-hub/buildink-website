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
} from "@/features/public/types/public.types"
import {
  helpArticles,
  legalDocuments,
  publicArticles,
  publicEntities,
} from "@/features/public/data/public-fixtures"

const PAGE_SIZE = 6

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

export function getHomeView(locale: Locale): PublicHomeView {
  const metricLabels =
    locale === "it"
      ? ["Imprese", "Gare attive", "Lavoratori", "Progetti", "Visite mensili", "Verificati"]
      : locale === "ar"
        ? ["الشركات", "المناقصات النشطة", "العمال", "المشاريع", "الزيارات الشهرية", "موثّق"]
        : ["Companies", "Active tenders", "Workers", "Projects", "Monthly visits", "Verified"]

  return {
    locale,
    metrics: [
      { label: metricLabels[0], value: "10,425+" },
      { label: metricLabels[1], value: "2,358+" },
      { label: metricLabels[2], value: "12,876+" },
      { label: metricLabels[3], value: "1,284+" },
      { label: metricLabels[4], value: "85,642+" },
      { label: metricLabels[5], value: "98%" },
    ],
    featured: {
      companies: publicEntities.companies.slice(0, 2),
      profiles: publicEntities.profiles.slice(0, 2),
      tenders: publicEntities.tenders.slice(0, 1),
      projects: publicEntities.projects.slice(0, 1),
    },
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

export function listPublicEntities(
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

export function getDirectoryFacets(module: PublicModule) {
  const items = publicEntities[module]
  const regions = [...new Set(items.map((item) => item.location))].sort()
  const categories = [
    ...new Set(items.flatMap((item) => [...item.categories, ...item.tags])),
  ].sort()
  const verifications = [...new Set(items.map((item) => item.verification))].sort()
  return { regions, categories, verifications }
}

export function getPublicEntity(
  module: PublicModule,
  slug: string,
): PublicEntityRecord | null {
  return publicEntities[module].find((item) => item.slug === slug) ?? null
}

export function getCompanySubpage(slug: string, section: string) {
  const company = getPublicEntity("companies", slug)
  return company?.subpages?.find((item) => item.slug === section) ?? null
}

export function getRelatedEntities(
  module: PublicModule,
  item: PublicEntityRecord,
): PublicEntityRecord[] {
  const related = item.relatedSlugs ?? []
  return publicEntities[module].filter((candidate) => related.includes(candidate.slug))
}

export function searchAll(query: DirectoryQuery) {
  return (Object.keys(publicEntities) as PublicModule[]).flatMap((module) =>
    publicEntities[module]
      .filter((item) => matchesQuery(item, query))
      .slice(0, 2),
  )
}

export function listArticles() {
  return publicArticles
}

export function getArticle(slug: string): PublicArticle | null {
  return publicArticles.find((article) => article.slug === slug) ?? null
}

export function listHelpArticles() {
  return helpArticles
}

export function getHelpArticle(slug: string): PublicHelpArticle | null {
  return helpArticles.find((article) => article.slug === slug) ?? null
}

export function getLegalDocument(slug: string): PublicLegalDocument | null {
  return legalDocuments.find((document) => document.slug === slug) ?? null
}
