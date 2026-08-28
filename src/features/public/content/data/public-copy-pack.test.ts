import { describe, expect, it } from "vitest"

import type { Locale } from "@/shared/types/platform"

import type { StaticContentType } from "../types/public-content.types"
import { getLocalizedReviewedStaticPublicPage } from "./public-copy-pack-localized"
import { PUBLIC_COPY_DRAFT_DATE, PUBLIC_COPY_VERSION } from "./public-copy-pack"

const pageTypes: StaticContentType[] = [
  "about",
  "how-it-works",
  "verification",
  "faq",
  "contact",
  "privacy",
  "cookies",
  "terms",
]
const locales: Locale[] = ["it", "en", "ar", "ro", "sq"]

function allText(type: StaticContentType, locale: Locale) {
  const page = getLocalizedReviewedStaticPublicPage(type, locale)
  return [
    page.title,
    page.description,
    ...page.sections.flatMap((section) => [
      section.title,
      section.body,
      ...(section.items ?? []),
    ]),
    ...page.faqItems.flatMap((item) => [item.title, item.content]),
  ].join("\n")
}

describe("reviewed public copy pack", () => {
  it("ships all eight pages in all five Website languages with the same version date", () => {
    for (const locale of locales) {
      for (const type of pageTypes) {
        const page = getLocalizedReviewedStaticPublicPage(type, locale)
        expect(page.version).toBe(PUBLIC_COPY_VERSION)
        expect(page.updatedAt).toBe(PUBLIC_COPY_DRAFT_DATE)
        expect(page.publishedAt).toBeNull()
        expect(page.locale).toBe(locale)
        expect(page.title.trim()).not.toBe("")
        expect(page.description.trim()).not.toBe("")
      }
    }
  })

  it("preserves the verified operator details in every language", () => {
    for (const locale of locales) {
      const about = allText("about", locale)
      expect(about).toContain("METWALLY AMR")
      expect(about).toContain("Via Galileo Galilei 1, 22078 Turate (CO)")
      expect(about).toContain("03994850133")
      expect(about).toContain("CO-413411")
      expect(about).toContain("metwally.arm@pec.it")
    }
  })

  it("contains the complete ten-question FAQ in every language", () => {
    for (const locale of locales) {
      expect(
        getLocalizedReviewedStaticPublicPage("faq", locale).faqItems,
      ).toHaveLength(10)
    }
  })

  it("does not ship unresolved square-bracket placeholders", () => {
    for (const locale of locales) {
      for (const type of ["privacy", "cookies", "terms", "contact"] as const) {
        expect(allText(type, locale)).not.toMatch(/\[[^\]]+\]/)
      }
    }
  })

  it("keeps unresolved operational facts explicit instead of inventing them", () => {
    const privacy = allText("privacy", "en")
    const cookies = allText("cookies", "en")
    const terms = allText("terms", "en")

    expect(privacy).toContain("must be confirmed before publication")
    expect(cookies).toContain("production-domain audit")
    expect(terms).toContain("commercial model must be confirmed")
    expect(terms).toContain(
      "Jurisdiction and the complaint procedure must be confirmed",
    )
  })

  it("uses real Arabic, Romanian and Albanian translations rather than English fallback", () => {
    const english = getLocalizedReviewedStaticPublicPage("terms", "en")
    for (const locale of ["ar", "ro", "sq"] as const) {
      const page = getLocalizedReviewedStaticPublicPage("terms", locale)
      expect(page.locale).toBe(locale)
      expect(page.title).not.toBe(english.title)
      expect(page.sections[0]?.title).not.toBe(english.sections[0]?.title)
    }
  })
})
