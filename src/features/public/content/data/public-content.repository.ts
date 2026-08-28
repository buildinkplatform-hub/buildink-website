import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import enPublicSite from "@/messages/en/pages/public-site.json"
import itPublicSite from "@/messages/it/pages/public-site.json"
import arPublicSite from "@/messages/ar/pages/public-site.json"
import roPublicSite from "@/messages/ro/pages/public-site.json"
import sqPublicSite from "@/messages/sq/pages/public-site.json"
import { BackendApiError } from "@/lib/backend/api"
import { publicBackendApi } from "@/lib/backend/public-api"
import type { Locale } from "@/shared/types/platform"

import type {
  ContentCollectionType,
  PublicContentArticleSummaryView,
  PublicContentCollectionView,
  PublicContentPageView,
  StaticContentType,
} from "../types/public-content.types"
import { getLocalizedReviewedStaticPublicPage } from "./public-copy-pack-localized"

type StaticPageMessages = {
  eyebrow: string
  title: string
  description: string
}

type PublicSiteMessages = {
  pages: Record<string, StaticPageMessages>
}

const PUBLIC_SITE_MESSAGES: Record<Locale, PublicSiteMessages> = {
  ar: arPublicSite.publicSite,
  en: enPublicSite.publicSite,
  it: itPublicSite.publicSite,
  ro: roPublicSite.publicSite,
  sq: sqPublicSite.publicSite,
}

function withLocale(path: string, locale: Locale) {
  const params = new URLSearchParams({ locale })
  return `${path}?${params.toString()}`
}

function isNotFound(error: unknown) {
  return error instanceof BackendApiError && error.status === 404
}

/**
 * The eight public informational/legal pages are source-controlled Website
 * content and intentionally do not call the Admin CMS or public content API.
 * Italian remains the controlling legal version; English, Arabic, Romanian
 * and Albanian are version-matched translations of the supplied copy pack.
 */
export async function getPublicContentPage(
  type: StaticContentType,
  locale: Locale,
): Promise<PublicContentPageView> {
  "use cache"
  cacheLife("publicStatic")
  cacheTag("public-content", `public-content:${locale}:page:${type}`)
  return getLocalizedReviewedStaticPublicPage(type, locale)
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

export async function getPublicContentCollection(
  type: ContentCollectionType,
  locale: Locale,
): Promise<PublicContentCollectionView | null> {
  "use cache"
  cacheLife("publicStatic")
  cacheTag("public-content", `public-content:${locale}:collection:${type}`)
  try {
    return await publicBackendApi<PublicContentCollectionView>(
      withLocale(`/api/v1/public/content/${type}`, locale),
    )
  } catch (error) {
    if (isNotFound(error)) return getFallbackContentCollection(type, locale)
    return getFallbackContentCollection(type, locale)
  }
}

export async function getPublicContentArticle(
  type: ContentCollectionType,
  slug: string,
  locale: Locale,
): Promise<PublicContentArticleSummaryView | null> {
  "use cache"
  cacheLife("publicStatic")
  cacheTag("public-content", `public-content:${locale}:${type}:${slug}`)
  try {
    return await publicBackendApi<PublicContentArticleSummaryView>(
      withLocale(`/api/v1/public/content/${type}/${slug}`, locale),
    )
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}
