import { describe, expect, it } from "vitest"

import { buildQueryString, parseDirectoryQuery } from "./public-query"

describe("public directory query", () => {
  it("removes all-option sentinels before querying the API", () => {
    expect(
      parseDirectoryQuery({
        country: "__all__",
        region: "__all__",
        city: "__all__",
        category: "__all__",
        verification: "__all__",
      }),
    ).toMatchObject({
      country: undefined,
      region: undefined,
      city: undefined,
      category: undefined,
      verification: undefined,
      page: 1,
    })
  })

  it("never serializes all-option sentinels into public URLs", () => {
    expect(
      buildQueryString({
        q: "Hammer",
        category: "__all__",
        verification: "__all__",
      }),
    ).toBe("q=Hammer")
  })
})
