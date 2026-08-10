import { describe, expect, it } from "vitest"

import { getPortalRoute, getPortalRoutes } from "./portal-routes"

describe("role-aware portal routes", () => {
  it("shows profile-specific navigation without company permissions", () => {
    const contractor = getPortalRoutes("contractor").map(
      (route) => route.segment,
    )
    const worker = getPortalRoutes("worker").map((route) => route.segment)
    expect(contractor).toContain("proposals")
    expect(contractor).not.toContain("projects")
    expect(worker).not.toContain("projects")
    expect(worker).toContain("availability")
  })

  it("rejects unknown and nested catch-all paths", () => {
    expect(getPortalRoute("supplier_contact", ["catalog"])?.segment).toBe(
      "catalog",
    )
    expect(getPortalRoute("supplier_contact", ["unknown"])).toBeNull()
    expect(getPortalRoute("supplier_contact", ["catalog", "one"])).toBeNull()
  })
})
