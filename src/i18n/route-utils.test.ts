import { describe, expect, it } from "vitest"

import {
  localeFromPathname,
  replaceLocale,
  sanitizeReturnTo,
  stripLocalePrefix,
} from "./route-utils"

describe("locale route helpers", () => {
  it("detects and replaces supported locale prefixes", () => {
    expect(localeFromPathname("/ar/dashboard/profile")).toBe("ar")
    expect(replaceLocale("/ar/dashboard/profile", "en")).toBe(
      "/en/dashboard/profile",
    )
  })

  it("rejects unsafe return locations", () => {
    expect(sanitizeReturnTo("https://evil.example", "it")).toBe("/it/dashboard")
    expect(sanitizeReturnTo("//evil.example", "it")).toBe("/it/dashboard")
    expect(sanitizeReturnTo("/en/dashboard", "it")).toBe("/it/dashboard")
    expect(sanitizeReturnTo("/it/dashboard/projects?tab=open", "it")).toBe(
      "/it/dashboard/projects?tab=open",
    )
  })

  it("strips locale prefixes for next-intl links", () => {
    expect(stripLocalePrefix("/en/dashboard")).toBe("/dashboard")
    expect(stripLocalePrefix("/it/onboarding/profile-type")).toBe(
      "/onboarding/profile-type",
    )
    expect(stripLocalePrefix("/companies")).toBe("/companies")
  })
})
