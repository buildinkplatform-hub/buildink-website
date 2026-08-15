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
  accountType?: string
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
  itemLinks?: Array<{ label: string; href: string }>
}

export interface PublicSubpage {
  slug: string
  title: string
  description: string
  sections: PublicSection[]
}

export interface PublicEntityRecord {
  id?: string
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
  reviewTarget?: PublicReviewTarget | null
}

export type PublicReviewTargetType = "COMPANY" | "PROJECT" | "WORKER"

export interface PublicReviewTarget {
  type: PublicReviewTargetType
  id: string
}

export interface PublicReview {
  id: string
  rating: number
  title: string
  comment: string
  locale: string
  verifiedEngagement: boolean
  createdAt: string
  authorDisplayName: string
}

export interface PublicReviewSummary {
  average: number
  count: number
  histogram: Array<{ rating: number; count: number }>
}

export interface PublicReviewsResult {
  items: PublicReview[]
  summary: PublicReviewSummary
}

export type ReviewEligibilityReason =
  | "self_target"
  | "already_reviewed"
  | "not_eligible"
  | "verified_engagement"
  | "verified_interaction"

export interface ReviewEligibility {
  eligible: boolean
  verifiedEngagement: boolean
  reason: ReviewEligibilityReason
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
