import "server-only"

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

function withLocale(path: string, locale: Locale) {
  const params = new URLSearchParams({ locale })
  return `${path}?${params.toString()}`
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
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
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
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
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
    if (error instanceof BackendApiError && error.status === 404) return null
    throw error
  }
}
