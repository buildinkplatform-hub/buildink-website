import { describe, expect, it } from "vitest"

import { demoDashboardRepository } from "./dashboard.repository"

describe("dashboard repository", () => {
  it("returns an API-shaped overview for each profile type", async () => {
    for (const profileType of [
      "individual",
      "worker",
      "contractor",
      "supplier_contact",
      "service_provider",
    ] as const) {
      const overview = await demoDashboardRepository.getOverview(profileType)
      expect(overview.profileType).toBe(profileType)
      expect(overview.metrics).toHaveLength(4)
      expect(overview.completion).toBeGreaterThan(0)
    }
  })
})
