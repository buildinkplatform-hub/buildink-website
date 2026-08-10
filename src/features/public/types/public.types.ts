import type { Locale } from "@/shared/types/platform"

export type PublicModule =
  | "companies"
  | "profiles"
  | "suppliers"
  | "equipment"
  | "projects"
  | "tenders"
  | "opportunities-companies"
  | "opportunities-workers"

export interface DirectoryQuery {
  q?: string
  region?: string
  category?: string
  verification?: string
  page?: number
}

export interface DirectoryResult<T> {
  items: T[]
  page: number
  total: number
  totalPages: number
  query: DirectoryQuery
}

export interface PublicStat {
  label: string
  value: string
}

export interface PublicEntityContact {
  email?: string
  phone?: string
  website?: string
  address?: string
  hours?: string
}

export interface PublicSection {
  id: string
  title: string
  body: string
  items?: string[]
}

export interface PublicSubpage {
  slug: string
  title: string
  description: string
  sections: PublicSection[]
}

export interface PublicEntityRecord {
  module: PublicModule
  slug: string
  title: string
  subtitle: string
  summary: string
  location: string
  verification: string
  categories: string[]
  tags: string[]
  metrics: PublicStat[]
  contact: PublicEntityContact
  sections: PublicSection[]
  subpages?: PublicSubpage[]
  relatedSlugs?: string[]
}

export interface PublicArticle {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  updatedAt: string
  readingTime: string
  sections: PublicSection[]
}

export interface PublicHelpArticle {
  slug: string
  title: string
  excerpt: string
  category: string
  updatedAt: string
  sections: PublicSection[]
}

export interface PublicLegalDocument {
  slug: "privacy" | "terms" | "cookies"
  updatedAt: string
  sections: PublicSection[]
}

export interface PublicHomeView {
  locale: Locale
  metrics: PublicStat[]
  featured: Record<
    "companies" | "profiles" | "tenders" | "projects",
    PublicEntityRecord[]
  >
  testimonials: Array<{
    name: string
    role: string
    quote: string
  }>
}
