export type StaticContentType =
  | "how-it-works"
  | "verification"
  | "about"
  | "contact"
  | "faq"
  | "privacy"
  | "terms"
  | "cookies"

export type ContentCollectionType = "blog" | "help"

export interface PublicContentSection {
  id: string
  title: string
  body: string
  items?: string[]
}

export interface PublicFaqItem {
  id: string
  title: string
  content: string
}

export interface PublicContentContract {
  contentType: string
  slug: string
  locale: string
  version: number
  publishedAt: string | null
  updatedAt: string
}

export interface PublicContentPageView extends PublicContentContract {
  type: StaticContentType
  eyebrow: string | null
  title: string
  description: string
  featuredImageUrl: string | null
  sections: PublicContentSection[]
  faqItems: PublicFaqItem[]
}

export interface PublicContentArticleSummaryView extends PublicContentContract {
  title: string
  excerpt: string
  category: string
  author: string | null
  readingTime: string | null
  featuredImageUrl: string | null
  sections: PublicContentSection[]
}

export interface PublicContentCollectionView {
  type: ContentCollectionType
  hero: {
    eyebrow?: string
    title: string
    description: string
  }
  items: PublicContentArticleSummaryView[]
}
