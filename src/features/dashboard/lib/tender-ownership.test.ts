import { describe, expect, it } from "vitest"

import { isTenderOwnedByPortalActor } from "./tender-ownership"

describe("isTenderOwnedByPortalActor", () => {
  it("allows a personal tender creator", () => {
    expect(
      isTenderOwnedByPortalActor(
        { createdById: "profile-owner", organizationCompanyId: null },
        "profile-owner",
        [],
      ),
    ).toBe(true)
  })

  it("allows an actor whose active workspace owns the tender", () => {
    expect(
      isTenderOwnedByPortalActor(
        {
          createdById: "someone-else",
          organizationCompanyId: "company-owner",
        },
        "profile-member",
        ["company-owner"],
      ),
    ).toBe(true)
  })

  it("rejects an invited bidder from a different company", () => {
    expect(
      isTenderOwnedByPortalActor(
        {
          createdById: "contractor-profile",
          organizationCompanyId: "contractor-company",
        },
        "subcontractor-profile",
        ["bidder-company"],
      ),
    ).toBe(false)
  })

  it("rejects a missing tender", () => {
    expect(isTenderOwnedByPortalActor(undefined, "profile", ["company"])).toBe(
      false,
    )
  })
})
