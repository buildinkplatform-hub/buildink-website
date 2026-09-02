import { describe, expect, it, vi } from "vitest"

import { loadOfferCreateTargets } from "./offer-create-targets"

describe("loadOfferCreateTargets", () => {
  it("keeps available target groups when one discovery endpoint fails", async () => {
    const loader = vi.fn(async (kind: "opportunity" | "package" | "lot") => {
      if (kind === "package") throw new Error("package lookup unavailable")
      return { items: [{ id: kind }] }
    })

    await expect(loadOfferCreateTargets(loader)).resolves.toEqual({
      opportunities: { items: [{ id: "opportunity" }] },
      packages: { items: [] },
      lots: { items: [{ id: "lot" }] },
    })
  })
})
