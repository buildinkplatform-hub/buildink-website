import { describe, expect, it } from "vitest"

import { faqFallback } from "./faq-fallback"

describe("translated FAQ fallback", () => {
  it("keeps the same 20 stable FAQ ids in every locale", () => {
    const ids = faqFallback.en.map((item) => item.id)
    expect(ids).toHaveLength(20)
    for (const locale of ["it", "ar", "ro", "sq"] as const) {
      expect(faqFallback[locale].map((item) => item.id)).toEqual(ids)
      expect(
        faqFallback[locale].every(
          (item) => item.title.trim() && item.content.trim(),
        ),
      ).toBe(true)
    }
  })

  it("contains Arabic copy instead of English leakage or mojibake", () => {
    const copy = faqFallback.ar
      .map((item) => `${item.title} ${item.content}`)
      .join(" ")
    expect(copy).toMatch(/[\u0600-\u06ff]/)
    expect(copy).not.toMatch(/Ø|Ù|Ã|�/)
    expect(copy).not.toContain("Which account")
  })
})
