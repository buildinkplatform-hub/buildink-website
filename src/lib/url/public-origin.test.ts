import { describe, expect, it } from "vitest"

import { resolvePublicOriginFromHeaders } from "./public-origin"

function headerStore(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null
    },
  }
}

describe("resolvePublicOriginFromHeaders", () => {
  it("prefers forwarded host and protocol", () => {
    expect(
      resolvePublicOriginFromHeaders(
        headerStore({
          "x-forwarded-host": "buildink.example.com",
          "x-forwarded-proto": "https",
          host: "localhost:3000",
        }),
      ),
    ).toBe("https://buildink.example.com")
  })

  it("falls back to the request origin when forwarded headers are missing", () => {
    expect(
      resolvePublicOriginFromHeaders(
        headerStore({
          origin: "https://portal.buildink.example.com",
        }),
      ),
    ).toBe("https://portal.buildink.example.com")
  })

  it("falls back to the configured site url when request headers are unavailable", () => {
    expect(
      resolvePublicOriginFromHeaders(headerStore({}), "https://buildink.app"),
    ).toBe("https://buildink.app")
  })

  it("keeps localhost only as the final fallback", () => {
    expect(resolvePublicOriginFromHeaders(headerStore({}), undefined)).toBe(
      "http://localhost:3000",
    )
  })
})
