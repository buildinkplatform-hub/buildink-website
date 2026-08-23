import "server-only"

import { BackendApiError } from "@/lib/backend/api"
import { publicBackendApi } from "@/lib/backend/public-api"
import type { Locale } from "@/shared/types/platform"
import arPublicSite from "@/messages/ar/pages/public-site.json"
import enPublicSite from "@/messages/en/pages/public-site.json"
import itPublicSite from "@/messages/it/pages/public-site.json"
import roPublicSite from "@/messages/ro/pages/public-site.json"
import sqPublicSite from "@/messages/sq/pages/public-site.json"

import type {
  ContentCollectionType,
  PublicContentArticleSummaryView,
  PublicContentCollectionView,
  PublicContentPageView,
  StaticContentType,
} from "../types/public-content.types"

type StaticPageMessages = {
  eyebrow: string
  title: string
  description: string
  sectionOneTitle?: string
  sectionOneBody?: string
  cards?: Record<string, string>
}

type PublicSiteMessages = {
  pages: Record<string, StaticPageMessages>
  faq: {
    items: {
      profileType: string
      verification: string
      contact: string
    }
    answers: {
      profileType: string
      verification: string
      contact: string
    }
  }
}

const PUBLIC_SITE_MESSAGES: Record<Locale, PublicSiteMessages> = {
  ar: arPublicSite.publicSite,
  en: enPublicSite.publicSite,
  it: itPublicSite.publicSite,
  ro: roPublicSite.publicSite,
  sq: sqPublicSite.publicSite,
}

const STATIC_PAGE_MESSAGE_KEYS: Record<StaticContentType, string> = {
  "how-it-works": "howItWorks",
  about: "about",
  contact: "contact",
  cookies: "cookies",
  faq: "faq",
  privacy: "privacy",
  terms: "terms",
  verification: "verification",
}

function withLocale(path: string, locale: Locale) {
  const params = new URLSearchParams({ locale })
  return `${path}?${params.toString()}`
}

function isNotFound(error: unknown) {
  return error instanceof BackendApiError && error.status === 404
}

function getFallbackStaticContentPage(
  type: StaticContentType,
  locale: Locale,
): PublicContentPageView {
  const messages = PUBLIC_SITE_MESSAGES[locale] ?? PUBLIC_SITE_MESSAGES.en
  const key = STATIC_PAGE_MESSAGE_KEYS[type]
  const page = messages.pages[key]
  const updatedAt = new Date(0).toISOString()

  return {
    contentType: "page",
    slug: type,
    locale,
    version: 0,
    publishedAt: null,
    updatedAt,
    type,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    featuredImageUrl: null,
    sections:
      page.sectionOneTitle && page.sectionOneBody && page.cards
        ? [
            {
              id: "overview",
              title: page.sectionOneTitle,
              body: page.sectionOneBody,
            },
            ...[1, 2, 3].map((index) => ({
              id: `card-${index}`,
              title: page.cards?.[`card${index}Title`] ?? "",
              body: page.cards?.[`card${index}Body`] ?? "",
            })),
          ]
        : [],
    faqItems:
      type === "faq"
        ? [
            {
              id: "profiles",
              title: messages.faq.items.profileType,
              content: messages.faq.answers.profileType,
            },
            {
              id: "verification",
              title: messages.faq.items.verification,
              content: messages.faq.answers.verification,
            },
            {
              id: "contact",
              title: messages.faq.items.contact,
              content: messages.faq.answers.contact,
            },
          ]
        : [],
  }
}

function getFallbackContentCollection(
  type: ContentCollectionType,
  locale: Locale,
): PublicContentCollectionView {
  const messages = PUBLIC_SITE_MESSAGES[locale] ?? PUBLIC_SITE_MESSAGES.en
  const page = messages.pages[type]

  return {
    type,
    hero: {
      eyebrow: page.eyebrow,
      title: page.title,
      description: page.description,
    },
    items: [],
  }
}

export async function getPublicContentPage(
  type: StaticContentType,
  locale: Locale,
): Promise<PublicContentPageView | null> {
  try {
    return await publicBackendApi<PublicContentPageView>(
      withLocale(`/api/v1/public/content/${type}`, locale),
    )
  } catch (error) {
    if (isNotFound(error)) return null
    return getFallbackStaticContentPage(type, locale)
  }
}

export async function getPublicContentCollection(
  type: ContentCollectionType,
  locale: Locale,
): Promise<PublicContentCollectionView | null> {
  try {
    return await publicBackendApi<PublicContentCollectionView>(
      withLocale(`/api/v1/public/content/${type}`, locale),
    )
  } catch (error) {
    if (isNotFound(error)) return null
    return getFallbackContentCollection(type, locale)
  }
}

export async function getPublicContentArticle(
  type: ContentCollectionType,
  slug: string,
  locale: Locale,
): Promise<PublicContentArticleSummaryView | null> {
  try {
    return await publicBackendApi<PublicContentArticleSummaryView>(
      withLocale(`/api/v1/public/content/${type}/${slug}`, locale),
    )
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}
