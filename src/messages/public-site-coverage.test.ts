import { describe, expect, it } from "vitest"

import ar from "./ar"
import en from "./en"
import itCatalog from "./it"
import ro from "./ro"
import sq from "./sq"

const catalogs = { en, it: itCatalog, ar, ro, sq } as const

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (!value || typeof value !== "object") return {}
  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>((result, entry, index) => {
      Object.assign(result, flatten(entry, `${prefix}.${index}`))
      return result
    }, {})
  }
  return Object.entries(value).reduce<Record<string, string>>(
    (result, [key, entry]) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof entry === "string") result[path] = entry
      else Object.assign(result, flatten(entry, path))
      return result
    },
    {},
  )
}

const rawKeyPattern = /^(?:[A-Za-z0-9_-]+\.){2,}[A-Za-z0-9_-]+$/
const placeholderPattern =
  /(?:excerpt for (?:en|it|ar|ro|sq)|placeholder|lorem ipsum)/i

const editorialPatterns: Record<keyof typeof catalogs, RegExp[]> = {
  en: [
    /\b(?:page|site|listing|experience) should\b/i,
    /\b(?:should|must) (?:show|expose|explain|emphasize|feel|clarify|present|answer|validate)\b/i,
    /^(?:Explain|Clarify|Show|Present|Keep|Lead with|Use plain language|Create a clear route)\b.*\b(?:page|site|listing|experience|copy|section)\b/i,
  ],
  it: [
    /\b(?:pagina|pagine|sito|liste|esperienza) (?:deve|devono|dovrebbe)\b/i,
    /^(?:Spiega|Chiarisci|Mostra|Presenta|Mantieni|Metti in primo piano|Usa un linguaggio|Crea un percorso|Rendi)\b.*\b(?:pagina|pagine|sito|liste|esperienza|testo|sezione)\b/i,
  ],
  ro: [
    /\b(?:pagina|paginile|site-ul|listările|experiența) (?:trebuie|ar trebui)\b/i,
    /^(?:Explică|Clarifică|Arată|Prezintă|Păstrează|Folosește|Creează o cale|Începe cu)\b.*\b(?:pagina|paginile|site-ul|listările|experiența|textul|secțiunea)\b/i,
  ],
  sq: [
    /\b(?:faqja|faqet|sajti|listimet|përvoja) (?:duhet|duhet të)\b/i,
    /^(?:Shpjego|Qartëso|Trego|Paraqit|Mbaj|Përdor|Krijo një rrugë)\b.*\b(?:faqja|faqet|sajti|listimet|përvoja|teksti|seksioni)\b/i,
  ],
  ar: [
    /(?:يجب|ينبغي)\s+(?:أن\s+)?(?:تعرض|توضح|تشرح|تبيّن|تظهر)/,
    /^(?:اشرح|وضّح|اعرض|قدّم|استخدم|أنشئ مسارًا|حافظ).*?(?:الصفحة|الموقع|القائمة|التجربة|النص|القسم)/,
  ],
}

function editorialScope(catalog: { publicSite: Record<string, unknown> }) {
  const site = catalog.publicSite
  return flatten({
    detail: site.detail,
    cta: site.cta,
    pages: site.pages,
    home: site.home,
  })
}

describe("public-site translation coverage", () => {
  it("keeps every runtime public-site key in exact parity across supported locales", () => {
    const reference = Object.keys(flatten(en.publicSite)).sort()
    for (const [locale, catalog] of Object.entries(catalogs)) {
      expect(Object.keys(flatten(catalog.publicSite)).sort(), locale).toEqual(
        reference,
      )
    }
  })

  it("contains no empty values, raw translation keys or placeholder snippets", () => {
    for (const [locale, catalog] of Object.entries(catalogs)) {
      for (const [key, value] of Object.entries(flatten(catalog.publicSite))) {
        expect(value.trim(), `${locale}:${key}`).not.toBe("")
        expect(rawKeyPattern.test(value.trim()), `${locale}:${key}`).toBe(false)
        expect(placeholderPattern.test(value), `${locale}:${key}`).toBe(false)
      }
    }
  })

  it("does not publish internal editorial instructions as customer copy", () => {
    for (const [locale, catalog] of Object.entries(catalogs) as Array<
      [keyof typeof catalogs, (typeof catalogs)[keyof typeof catalogs]]
    >) {
      // FAQ answers are allowed to describe how the public site behaves (for
      // example, which contact details are shown). The editorial guard targets
      // presentation copy where "the page/site should..." is an authoring note.
      for (const [key, value] of Object.entries(
        editorialScope(
          catalog as unknown as { publicSite: Record<string, unknown> },
        ),
      )) {
        for (const pattern of editorialPatterns[locale]) {
          expect(pattern.test(value), `${locale}:${key}: ${value}`).toBe(false)
        }
      }
    }
  })
})
