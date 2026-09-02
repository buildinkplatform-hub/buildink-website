import { describe, expect, it } from "vitest"

import { formatOfferAmount } from "./offer-display"

describe("formatOfferAmount", () => {
  it("preserves cents instead of rounding commercial offers to whole currency units", () => {
    expect(
      formatOfferAmount(
        { proposedPriceMinor: "14995", currency: "EUR" },
        "en-US",
      ),
    ).toContain("149.95")
  })

  it("renders a real zero amount instead of treating it as missing", () => {
    expect(
      formatOfferAmount({ proposedPriceMinor: "0", currency: "EUR" }, "en-US"),
    ).toContain("0.00")
  })
})
