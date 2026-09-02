import { describe, expect, it } from "vitest"

import { canDecideOffer, hasOfferDecisionActions } from "./offer-decision"

describe("offer decision boundary", () => {
  it("matches the backend legal transition matrix", () => {
    for (const status of [
      "SUBMITTED",
      "UNDER_REVIEW",
      "CHANGES_REQUESTED",
      "SHORTLISTED",
    ]) {
      expect(canDecideOffer(status, "ACCEPTED")).toBe(true)
      expect(canDecideOffer(status, "REJECTED")).toBe(true)
    }

    expect(canDecideOffer("SUBMITTED", "CHANGES_REQUESTED")).toBe(true)
    expect(canDecideOffer("UNDER_REVIEW", "CHANGES_REQUESTED")).toBe(true)
    expect(canDecideOffer("SHORTLISTED", "CHANGES_REQUESTED")).toBe(true)
    expect(canDecideOffer("CHANGES_REQUESTED", "CHANGES_REQUESTED")).toBe(false)

    expect(canDecideOffer("SUBMITTED", "SHORTLISTED")).toBe(true)
    expect(canDecideOffer("UNDER_REVIEW", "SHORTLISTED")).toBe(true)
    expect(canDecideOffer("CHANGES_REQUESTED", "SHORTLISTED")).toBe(true)
    expect(canDecideOffer("SHORTLISTED", "SHORTLISTED")).toBe(false)
  })

  it("exposes no buyer decision controls for terminal or non-submitted states", () => {
    for (const status of [
      "DRAFT",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
      "EXPIRED",
      "CANCELLED",
    ]) {
      expect(hasOfferDecisionActions(status)).toBe(false)
    }
  })
})
