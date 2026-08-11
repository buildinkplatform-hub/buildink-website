import { afterEach, describe, expect, it, vi } from "vitest"

import { resolvePublicOriginFromHeaders } from "./public-origin"

function headerStore(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null
    },
  }
}

describe("resolvePublicOriginFromHeaders", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

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

  it("prefers the request origin over a localhost host fallback", () => {
    expect(
      resolvePublicOriginFromHeaders(
        headerStore({
          host: "localhost:3000",
          origin: "https://buildink-website.vercel.app",
        }),
      ),
    ).toBe("https://buildink-website.vercel.app")
  })

  it("falls back to referer when origin is missing", () => {
    expect(
      resolvePublicOriginFromHeaders(
        headerStore({
          referer: "https://buildink-website.vercel.app/en/login",
        }),
      ),
    ).toBe("https://buildink-website.vercel.app")
  })

  it("falls back to the Vercel production domain before the site env", () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "buildink.com")
    expect(
      resolvePublicOriginFromHeaders(headerStore({}), "http://localhost:3000"),
    ).toBe("https://buildink.com")
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
