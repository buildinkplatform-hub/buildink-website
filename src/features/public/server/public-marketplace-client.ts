import "server-only"

import { publicBackendApi } from "@/lib/backend/public-api"
import type {
  DirectoryQuery,
  DirectoryResult,
  PublicDirectoryFacets,
  PublicEntityRecord,
  PublicFacetOption,
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
  facets?: PublicDirectoryFacets
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

const PROFILE_MODULES = new Set<PublicModule>([
  "project-owners",
  "subcontractors",
  "service-providers",
  "workers",
])

const verificationCopy: Record<
  Locale,
  {
    verifiedCompany: string
    verifiedProfile: string
    pending: string
    unverified: string
  }
> = {
  en: {
    verifiedCompany: "Verified company",
    verifiedProfile: "Verified profile",
    pending: "Verification pending",
    unverified: "Unverified",
  },
  it: {
    verifiedCompany: "Impresa verificata",
    verifiedProfile: "Profilo verificato",
    pending: "Verifica in corso",
    unverified: "Non verificato",
  },
  ar: {
    verifiedCompany: "شركة موثّقة",
    verifiedProfile: "ملف شخصي موثّق",
    pending: "التحقق قيد المراجعة",
    unverified: "غير موثّق",
  },
  ro: {
    verifiedCompany: "Companie verificată",
    verifiedProfile: "Profil verificat",
    pending: "Verificare în curs",
    unverified: "Neverificat",
  },
  sq: {
    verifiedCompany: "Kompani e verifikuar",
    verifiedProfile: "Profil i verifikuar",
    pending: "Verifikimi në proces",
    unverified: "I paverifikuar",
  },
}

const profileCopy: Record<
  Locale,
  {
    projectOwner: string
    subcontractor: string
    serviceProvider: string
    worker: string
    summary: string
  }
> = {
  en: {
    projectOwner: "Project owner",
    subcontractor: "Subcontractor",
    serviceProvider: "Service provider",
    worker: "Worker",
    summary: "Published marketplace profile",
  },
  it: {
    projectOwner: "Proprietario di progetto",
    subcontractor: "Subappaltatore",
    serviceProvider: "Fornitore di servizi",
    worker: "Lavoratore",
    summary: "Profilo marketplace pubblicato",
  },
  ar: {
    projectOwner: "مالك مشروع",
    subcontractor: "مقاول من الباطن",
    serviceProvider: "مقدم خدمات",
    worker: "عامل",
    summary: "ملف منشور في سوق Buildink",
  },
  ro: {
    projectOwner: "Proprietar de proiect",
    subcontractor: "Subcontractant",
    serviceProvider: "Furnizor de servicii",
    worker: "Lucrător",
    summary: "Profil publicat în marketplace",
  },
  sq: {
    projectOwner: "Pronar projekti",
    subcontractor: "Nënkontraktor",
    serviceProvider: "Ofrues shërbimesh",
    worker: "Punëtor",
    summary: "Profil i publikuar në marketplace",
  },
}

const publicCategoryCopy = {
  construction: {
    en: "Construction",
    it: "Costruzioni",
    ar: "البناء",
    ro: "Construcții",
    sq: "Ndërtim",
  },
  "general-contracting": {
    en: "General contracting",
    it: "Appalti generali",
    ar: "المقاولات العامة",
    ro: "Contractare generală",
    sq: "Kontraktim i përgjithshëm",
  },
  "masonry-concrete": {
    en: "Masonry and concrete",
    it: "Muratura e calcestruzzo",
    ar: "أعمال المباني والخرسانة",
    ro: "Zidărie și beton",
    sq: "Muraturë dhe beton",
  },
  "roofing-facades": {
    en: "Roofing and facades",
    it: "Coperture e facciate",
    ar: "الأسقف والواجهات",
    ro: "Acoperișuri și fațade",
    sq: "Çati dhe fasada",
  },
  "building-services": {
    en: "Building services",
    it: "Impianti edili",
    ar: "خدمات المباني",
    ro: "Instalații pentru clădiri",
    sq: "Instalime ndërtimore",
  },
  electrical: {
    en: "Electrical",
    it: "Elettrico",
    ar: "الأعمال الكهربائية",
    ro: "Instalații electrice",
    sq: "Instalime elektrike",
  },
  plumbing: {
    en: "Plumbing",
    it: "Idraulica",
    ar: "أعمال السباكة",
    ro: "Instalații sanitare",
    sq: "Instalime hidraulike",
  },
  hvac: {
    en: "HVAC",
    it: "HVAC",
    ar: "التدفئة والتهوية وتكييف الهواء",
    ro: "HVAC",
    sq: "HVAC",
  },
  "materials-supply": {
    en: "Materials supply",
    it: "Fornitura materiali",
    ar: "توريد المواد",
    ro: "Furnizare de materiale",
    sq: "Furnizim materialesh",
  },
  "cement-aggregates": {
    en: "Cement and aggregates",
    it: "Cemento e inerti",
    ar: "الأسمنت والركام",
    ro: "Ciment și agregate",
    sq: "Çimento dhe agregate",
  },
  "steel-metals": {
    en: "Steel and metals",
    it: "Acciaio e metalli",
    ar: "الفولاذ والمعادن",
    ro: "Oțel și metale",
    sq: "Çelik dhe metale",
  },
  "finishes-fixtures": {
    en: "Finishes and fixtures",
    it: "Finiture e accessori",
    ar: "التشطيبات والتجهيزات",
    ro: "Finisaje și accesorii",
    sq: "Finisazhe dhe pajisje",
  },
} satisfies Record<string, Record<Locale, string>>

function normalizedFacetValue(value: string) {
  return value.trim().toLocaleLowerCase()
}

function localizedCategoryFacets(
  options: PublicFacetOption[],
  locale: Locale,
  selected = "",
) {
  const selectedValue = normalizedFacetValue(selected)
  return options.map((option) => {
    const optionValues = [option.value, option.label].map(normalizedFacetValue)
    const match = Object.entries(publicCategoryCopy).find(([slug, labels]) =>
      [slug, ...Object.values(labels)]
        .map(normalizedFacetValue)
        .some((value) => optionValues.includes(value)),
    )
    if (!match) return option

    const [slug, labels] = match
    const knownValues = [slug, ...Object.values(labels)].map(normalizedFacetValue)
    return {
      ...option,
      value: slug,
      label: labels[locale],
      selected:
        option.selected ||
        (selectedValue.length > 0 && knownValues.includes(selectedValue)),
    }
  })
}

const FRESH_MARKETPLACE_REQUEST: RequestInit = { cache: "no-store" }

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

function resolvedPublicModule(
  item: RawPublicEntityRecord,
  requestedModule?: PublicModule,
): PublicModule {
  if (requestedModule) {
    if (MODULE_ACCOUNT_TYPE[requestedModule]) return requestedModule
    if (requestedModule === "companies" && item.module === "suppliers") {
      return "companies"
    }
    if (requestedModule === "opportunities") return "opportunities"
  }

  switch (item.module) {
    case "profiles":
      return profileModuleFromSubtitle(item.subtitle)
    case "suppliers":
      return "companies"
    case "opportunities":
    case "opportunities-companies":
    case "opportunities-workers":
      return "opportunities"
    default:
      return item.module as PublicModule
  }
}

function localizedVerification(
  value: string,
  publicModule: PublicModule,
  locale: Locale,
) {
  const labels = verificationCopy[locale]
  if (value === "Verified company") {
    return PROFILE_MODULES.has(publicModule)
      ? labels.verifiedProfile
      : labels.verifiedCompany
  }
  if (value === "Verification pending") return labels.pending
  if (value === "Unverified") return labels.unverified
  return value
}

function localizedProfileSubtitle(publicModule: PublicModule, locale: Locale) {
  const labels = profileCopy[locale]
  switch (publicModule) {
    case "project-owners":
      return labels.projectOwner
    case "subcontractors":
      return labels.subcontractor
    case "service-providers":
      return labels.serviceProvider
    case "workers":
      return labels.worker
    default:
      return null
  }
}

function normalizePublicEntity(
  item: RawPublicEntityRecord,
  requestedModule: PublicModule | undefined,
  locale: Locale,
): PublicEntityRecord {
  const publicModule = resolvedPublicModule(item, requestedModule)
  const profileSubtitle = PROFILE_MODULES.has(publicModule)
    ? localizedProfileSubtitle(publicModule, locale)
    : null
  return {
    ...item,
    module: publicModule,
    ...(profileSubtitle
      ? { subtitle: profileSubtitle, summary: profileCopy[locale].summary }
      : {}),
    verification: localizedVerification(
      item.verification,
      publicModule,
      locale,
    ),
  }
}

function buildParams(
  query: DirectoryQuery,
  locale: Locale,
  extra?: Record<string, string>,
) {
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
  if (query.companyType) params.set("companyType", query.companyType)
  for (const key of [
    "services",
    "projectStage",
    "procurementStage",
    "tenderStatus",
    "sourceType",
    "submissionChannel",
    "deadlineBucket",
    "listingType",
    "availabilityStatus",
    "opportunityType",
    "opportunityStatus",
  ] as const) {
    if (query[key]) params.set(key, query[key] as string)
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value)
    }
  }
  return params
}

export async function fetchPublicHome(locale: Locale) {
  const response = await publicBackendApi<{
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
      publicMediaPublishers: number
      publicEvidenceDocuments: number
    }
    featuredEvidence?: {
      companies: RawPublicEntityRecord[]
      projects: RawPublicEntityRecord[]
    }
  }>(
    `/api/v1/public/marketplace/home?locale=${locale}`,
    FRESH_MARKETPLACE_REQUEST,
  ).catch(() => null)

  if (response?.aggregates) {
    return {
      ...response,
      featured: {
        companies: response.featured.companies.map((item) =>
          normalizePublicEntity(item, "companies", locale),
        ),
        profiles: response.featured.profiles.map((item) =>
          normalizePublicEntity(item, undefined, locale),
        ),
        projects: response.featured.projects.map((item) =>
          normalizePublicEntity(item, "projects", locale),
        ),
        tenders: response.featured.tenders.map((item) =>
          normalizePublicEntity(item, "tenders", locale),
        ),
      } satisfies PublicHomeView["featured"],
      featuredEvidence: {
        companies: (response.featuredEvidence?.companies ?? []).map((item) =>
          normalizePublicEntity(item, "companies", locale),
        ),
        projects: (response.featuredEvidence?.projects ?? []).map((item) =>
          normalizePublicEntity(item, "projects", locale),
        ),
      },
    }
  }

  // The combined Home endpoint contains optional evidence aggregation. If an
  // older backend omits aggregates or one optional Home query fails, rebuild
  // the core marketplace summary from the same live public directory APIs
  // rather than pairing fixture cards with misleading zero counters.
  const [companies, workers, projects, tenders] = await Promise.all([
    fetchPublicDirectory("companies", locale, { page: 1 }),
    fetchPublicDirectory("workers", locale, { page: 1 }),
    fetchPublicDirectory("projects", locale, { page: 1 }),
    fetchPublicDirectory("tenders", locale, {
      page: 1,
      tenderStatus: "OPEN",
    }),
  ])

  if (!companies && !workers && !projects && !tenders) {
    if (!response)
      throw new Error("Public marketplace Home data is unavailable")
    return {
      ...response,
      featured: {
        companies: response.featured.companies.map((item) =>
          normalizePublicEntity(item, "companies", locale),
        ),
        profiles: response.featured.profiles.map((item) =>
          normalizePublicEntity(item, undefined, locale),
        ),
        projects: response.featured.projects.map((item) =>
          normalizePublicEntity(item, "projects", locale),
        ),
        tenders: response.featured.tenders.map((item) =>
          normalizePublicEntity(item, "tenders", locale),
        ),
      },
      aggregates: {
        companies: null,
        tenders: null,
        workers: null,
        projects: null,
        publicMediaPublishers: null,
        publicEvidenceDocuments: null,
      },
      featuredEvidence: { companies: [], projects: [] },
    }
  }

  return {
    featured: {
      companies: companies?.items.slice(0, 2) ?? [],
      profiles: workers?.items.slice(0, 2) ?? [],
      projects: projects?.items.slice(0, 1) ?? [],
      tenders: tenders?.items.slice(0, 1) ?? [],
    },
    aggregates: {
      companies: companies?.total ?? null,
      tenders: tenders?.total ?? null,
      workers: workers?.total ?? null,
      projects: projects?.total ?? null,
      publicMediaPublishers:
        response?.aggregates?.publicMediaPublishers ?? null,
      publicEvidenceDocuments:
        response?.aggregates?.publicEvidenceDocuments ?? null,
    },
    featuredEvidence: { companies: [], projects: [] },
  }
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
  const response = await publicBackendApi<
    PaginatedResponse<RawPublicEntityRecord>
  >(
    `/api/v1/public/marketplace/${path}?${params.toString()}`,
    FRESH_MARKETPLACE_REQUEST,
  ).catch(() => null)
  if (!response) return null
  const totalPages = Math.max(
    1,
    Math.ceil(response.pageInfo.total / response.pageInfo.pageSize),
  )
  return {
    items: response.items.map((item) =>
      normalizePublicEntity(item, module, locale),
    ),
    page: response.pageInfo.page,
    total: response.pageInfo.total,
    totalPages,
    query,
  }
}

export async function fetchPublicFacets(
  module: PublicModule,
  locale: Locale,
  query: DirectoryQuery = {},
) {
  const path = MODULE_PATH[module]
  if (!path) return null
  const params = buildParams(query, locale, {
    accountType: MODULE_ACCOUNT_TYPE[module] ?? "",
  })
  return publicBackendApi<PublicDirectoryFacets>(
    `/api/v1/public/marketplace/${path}/facets?${params.toString()}`,
    FRESH_MARKETPLACE_REQUEST,
  )
    .then((facets) => ({
      ...facets,
      categories: localizedCategoryFacets(
        facets.categories,
        locale,
        query.category,
      ),
    }))
    .catch(() => null)
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
    FRESH_MARKETPLACE_REQUEST,
  )
    .then((item) => normalizePublicEntity(item, module, locale))
    .catch(() => null)
}

export async function fetchPublicCatalogueItem(
  id: string,
  locale: Locale,
): Promise<PublicEntityRecord | null> {
  return publicBackendApi<RawPublicEntityRecord>(
    `/api/v1/public/marketplace/catalogue/${encodeURIComponent(id)}?locale=${locale}`,
    FRESH_MARKETPLACE_REQUEST,
  )
    .then((item) => normalizePublicEntity(item, "companies", locale))
    .catch(() => null)
}

export async function fetchPublicSearch(locale: Locale, query: DirectoryQuery) {
  const params = buildParams(query, locale)
  return publicBackendApi<{ items: RawPublicEntityRecord[] }>(
    `/api/v1/public/marketplace/search?${params.toString()}`,
    FRESH_MARKETPLACE_REQUEST,
  )
    .then((response) => ({
      items: response.items.map((item) =>
        normalizePublicEntity(item, undefined, locale),
      ),
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
  }>(
    `/api/v1/public/marketplace/reviews?${params.toString()}`,
    FRESH_MARKETPLACE_REQUEST,
  ).catch(() => null)
}
