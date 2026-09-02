import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import type { Locale } from "@/shared/types/platform"

import type {
  ContentCollectionType,
  PublicContentArticleSummaryView,
  PublicContentCollectionView,
  PublicContentPageView,
  StaticContentType,
} from "../types/public-content.types"
import { getLocalizedReviewedStaticPublicPage } from "./public-copy-pack-localized"
import {
  getSourceControlledHelpArticle,
  getSourceControlledHelpCollection,
} from "./public-help-copy"

/**
 * Public informational, legal and help content is source-controlled by the
 * Website. The public UI intentionally does not depend on the Admin CMS or the
 * backend content tables, which prevents unpublished/draft editorial records
 * from leaking to anonymous visitors.
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

export async function getPublicContentCollection(
  type: ContentCollectionType,
  locale: Locale,
): Promise<PublicContentCollectionView> {
  "use cache"
  cacheLife("publicStatic")
  cacheTag("public-content", `public-content:${locale}:collection:${type}`)
  return getSourceControlledHelpCollection(locale)
}

export async function getPublicContentArticle(
  type: ContentCollectionType,
  slug: string,
  locale: Locale,
): Promise<PublicContentArticleSummaryView | null> {
  "use cache"
  cacheLife("publicStatic")
  cacheTag("public-content", `public-content:${locale}:${type}:${slug}`)
  return getSourceControlledHelpArticle(locale, slug)
}
