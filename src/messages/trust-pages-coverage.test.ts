import { describe, expect, it } from "vitest"

import arLegal from "./ar/pages/legal-content.json"
import arTrust from "./ar/pages/trust-pages.json"
import enLegal from "./en/pages/legal-content.json"
import enTrust from "./en/pages/trust-pages.json"
import itLegal from "./it/pages/legal-content.json"
import itTrust from "./it/pages/trust-pages.json"
import roLegal from "./ro/pages/legal-content.json"
import roTrust from "./ro/pages/trust-pages.json"
import sqLegal from "./sq/pages/legal-content.json"
import sqTrust from "./sq/pages/trust-pages.json"

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
      if (typeof entry === "string") {
        result[path] = entry
      } else {
        Object.assign(result, flatten(entry, path))
      }
      return result
    },
    {},
  )
}

function expectCatalogParity(
  catalogs: Record<string, unknown>,
  referenceCatalog: unknown,
) {
  const referenceKeys = Object.keys(flatten(referenceCatalog)).sort()

  for (const [locale, catalog] of Object.entries(catalogs)) {
    expect(Object.keys(flatten(catalog)).sort(), locale).toEqual(referenceKeys)
    for (const [key, value] of Object.entries(flatten(catalog))) {
      expect(value.trim(), `${locale}:${key}`).not.toBe("")
    }
  }
}

describe("public trust and legal translation coverage", () => {
  it("keeps trust-page keys complete across every supported locale", () => {
    expectCatalogParity(
      { en: enTrust, it: itTrust, ar: arTrust, ro: roTrust, sq: sqTrust },
      enTrust,
    )
  })

  it("keeps legal fallback content complete across every supported locale", () => {
    expectCatalogParity(
      { en: enLegal, it: itLegal, ar: arLegal, ro: roLegal, sq: sqLegal },
      enLegal,
    )
  })
})
