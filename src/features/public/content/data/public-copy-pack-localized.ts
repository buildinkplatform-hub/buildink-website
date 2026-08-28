import type { Locale } from "@/shared/types/platform"

import type {
  PublicContentPageView,
  StaticContentType,
} from "../types/public-content.types"
import { publicCopyAr } from "./public-copy-pack.ar"
import {
  PUBLIC_COPY_DRAFT_DATE,
  PUBLIC_COPY_VERSION,
  getReviewedStaticPublicPage,
} from "./public-copy-pack"
import { publicCopyRo } from "./public-copy-pack.ro"
import { publicCopySq } from "./public-copy-pack.sq"

const translatedPages = {
  ar: publicCopyAr,
  ro: publicCopyRo,
  sq: publicCopySq,
} as const

export function getLocalizedReviewedStaticPublicPage(
  type: StaticContentType,
  locale: Locale,
): PublicContentPageView {
  if (locale === "it" || locale === "en") {
    return getReviewedStaticPublicPage(type, locale)
  }

  const page = translatedPages[locale][type]
  return {
    contentType: "page",
    slug: type,
    locale,
    version: PUBLIC_COPY_VERSION,
    publishedAt: null,
    updatedAt: PUBLIC_COPY_DRAFT_DATE,
    type,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    featuredImageUrl: null,
    sections: page.sections,
    faqItems: page.faqItems ?? [],
  }
}
