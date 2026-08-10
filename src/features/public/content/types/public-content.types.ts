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

export interface PublicContentPageView {
  type: StaticContentType
  slug: string
  eyebrow: string | null
  title: string
  description: string
  updatedAt: string
  featuredImageUrl: string | null
  sections: PublicContentSection[]
  faqItems: PublicFaqItem[]
}

export interface PublicContentArticleSummaryView {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string | null
  updatedAt: string
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
