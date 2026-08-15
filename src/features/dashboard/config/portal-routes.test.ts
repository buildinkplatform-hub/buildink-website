import { describe, expect, it } from "vitest"

import {
  getPortalRoute,
  getPortalRoutes,
  portalCreatePath,
  portalEditPath,
  resolvePortalRoute,
} from "./portal-routes"

describe("capability-aware portal routes", () => {
  it("shows persona modules without platform-admin permissions", () => {
    const contractor = getPortalRoutes([
      "overview",
      "profile",
      "offers",
      "opportunities",
      "engagements",
    ]).map((route) => route.segment)
    const worker = getPortalRoutes([
      "overview",
      "profile",
      "applications",
      "opportunities",
    ]).map((route) => route.segment)
    expect(contractor).toContain("offers")
    expect(contractor).not.toContain("projects")
    expect(worker).not.toContain("projects")
    expect(worker).toContain("applications")
    expect(contractor).not.toContain("subscription")
  })

  it("accepts list, detail, create and edit paths for authoring modules", () => {
    expect(
      getPortalRoute(["catalogue", "profile"], ["catalogue"])?.segment,
    ).toBe("catalogue")
    expect(getPortalRoute(["catalogue"], ["unknown"])).toBeNull()
    expect(getPortalRoute(["catalogue"], ["catalogue", "one"])?.segment).toBe(
      "catalogue",
    )
    expect(
      getPortalRoute(["catalogue"], ["catalogue", "one", "edit"])?.segment,
    ).toBe("catalogue")
    expect(getPortalRoute(["catalogue"], ["catalogue", "create"])?.segment).toBe(
      "catalogue",
    )

    expect(resolvePortalRoute(["projects"], ["projects"])?.action).toBe("list")
    expect(
      resolvePortalRoute(["projects"], ["projects", "create"])?.action,
    ).toBe("create")
    expect(
      resolvePortalRoute(["projects"], ["projects", "record-id"])?.action,
    ).toBe("detail")
    expect(
      resolvePortalRoute(["projects"], ["projects", "record-id"])?.recordId,
    ).toBe("record-id")
    expect(
      resolvePortalRoute(["projects"], ["projects", "record-id", "edit"]),
    ).toEqual(
      expect.objectContaining({
        action: "edit",
        recordId: "record-id",
      }),
    )
  })

  it("reserves create and edit so they never collide with record ids", () => {
    expect(resolvePortalRoute(["projects"], ["projects", "edit"])).toBeNull()
    expect(
      resolvePortalRoute(["tenders"], ["tenders", "create", "extra"]),
    ).toBeNull()
    expect(resolvePortalRoute(["equipment"], ["equipment", "a", "b"])).toBeNull()
    expect(getPortalRoute(["projects"], ["projects", "a", "b", "c"])).toBeNull()
  })

  it("exposes REST-ish paths for every full authoring module", () => {
    for (const segment of [
      "projects",
      "tenders",
      "equipment",
      "opportunities",
      "catalogue",
    ] as const) {
      expect(resolvePortalRoute([segment], [segment])?.action).toBe("list")
      expect(resolvePortalRoute([segment], [segment, "create"])?.action).toBe(
        "create",
      )
      expect(
        resolvePortalRoute([segment], [segment, "abc", "edit"])?.action,
      ).toBe("edit")
      expect(portalCreatePath(segment)).toBe(`/dashboard/${segment}/create`)
      expect(portalEditPath(segment, "abc")).toBe(
        `/dashboard/${segment}/abc/edit`,
      )
    }
  })

  it("supports create-only authoring for offers and applications", () => {
    for (const segment of ["offers", "applications"] as const) {
      expect(resolvePortalRoute([segment], [segment])?.action).toBe("list")
      expect(resolvePortalRoute([segment], [segment, "create"])?.action).toBe(
        "create",
      )
      expect(resolvePortalRoute([segment], [segment, "abc"])?.action).toBe(
        "detail",
      )
      expect(resolvePortalRoute([segment], [segment, "abc", "edit"])).toBeNull()
    }
  })

  it("keeps purpose-built routes on a single page", () => {
    for (const segment of [
      "profile",
      "workspace",
      "verification",
      "notifications",
      "saved",
      "settings",
      "workforce",
    ] as const) {
      expect(resolvePortalRoute([segment], [segment])?.action).toBe("list")
      expect(resolvePortalRoute([segment], [segment, "create"])).toBeNull()
      expect(resolvePortalRoute([segment], [segment, "abc"])).toBeNull()
      expect(resolvePortalRoute([segment], [segment, "abc", "edit"])).toBeNull()
    }
  })

  it("keeps remaining portal modules available to list and detail routes", () => {
    const routes = getPortalRoutes([
      "projects",
      "opportunities",
      "tenders",
      "members",
      "catalogue",
      "equipment",
      "verification",
      "profile",
    ]).map((route) => route.segment)
    expect(routes).toEqual(
      expect.arrayContaining([
        "projects",
        "opportunities",
        "tenders",
        "members",
        "catalogue",
        "equipment",
        "verification",
      ]),
    )
    expect(getPortalRoute(["projects"], ["projects"])?.segment).toBe("projects")
    expect(getPortalRoute(["tenders"], ["tenders", "record-id"])?.segment).toBe(
      "tenders",
    )
  })

  it("relabels offers as the bid board for subcontractors", () => {
    const routes = getPortalRoutes(["offers", "tenders"], "SUBCONTRACTOR")
    expect(routes.find((route) => route.segment === "offers")?.labelKey).toBe(
      "dashboard.nav.bidBoard",
    )
  })
})
