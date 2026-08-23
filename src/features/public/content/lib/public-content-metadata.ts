import type { Metadata } from "next"

import type { Locale } from "@/shared/types/platform"

import {
  getPublicContentArticle,
  getPublicContentCollection,
  getPublicContentPage,
} from "../data/public-content.repository"
import type {
  ContentCollectionType,
  StaticContentType,
} from "../types/public-content.types"

export async function publicContentPageMetadata(
  type: StaticContentType,
  locale: Locale,
): Promise<Metadata> {
  const page = await getPublicContentPage(type, locale)
  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      images: page.featuredImageUrl ? [{ url: page.featuredImageUrl }] : undefined,
    },
    twitter: {
      card: page.featuredImageUrl ? "summary_large_image" : "summary",
      title: page.title,
      description: page.description,
      images: page.featuredImageUrl ? [page.featuredImageUrl] : undefined,
    },
  }
}

export async function publicContentCollectionMetadata(
  type: ContentCollectionType,
  locale: Locale,
): Promise<Metadata> {
  const collection = await getPublicContentCollection(type, locale)
  if (!collection) return {}

  return {
    title: collection.hero.title,
    description: collection.hero.description,
    openGraph: {
      title: collection.hero.title,
      description: collection.hero.description,
    },
    twitter: {
      card: "summary",
      title: collection.hero.title,
      description: collection.hero.description,
    },
  }
}

export async function publicContentArticleMetadata(
  type: ContentCollectionType,
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const article = await getPublicContentArticle(type, slug, locale)
  if (!article) return {}

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featuredImageUrl ? [{ url: article.featuredImageUrl }] : undefined,
    },
    twitter: {
      card: article.featuredImageUrl ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      images: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    },
  }
}
