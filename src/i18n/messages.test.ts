import { describe, expect, it } from "vitest"

import ar from "@/messages/ar"
import en from "@/messages/en"
import italian from "@/messages/it"
import ro from "@/messages/ro"
import sq from "@/messages/sq"
import { mergeMessages } from "@/messages/merge-messages"

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe("translation coverage", () => {
  it("keeps Italian, Arabic, Romanian and Albanian keys aligned with English", () => {
    const expected = keys(en).sort()
    expect(keys(italian).sort()).toEqual(expected)
    expect(keys(ar).sort()).toEqual(expected)
    expect(keys(ro).sort()).toEqual(expected)
    expect(keys(sq).sort()).toEqual(expected)
  })

  it("rejects duplicate leaf keys when page catalogs are combined", () => {
    expect(() =>
      mergeMessages(
        { auth: { email: "Email" } },
        { auth: { email: "E-mail address" } },
      ),
    ).toThrow("Duplicate translation key: auth.email")
  })
})
