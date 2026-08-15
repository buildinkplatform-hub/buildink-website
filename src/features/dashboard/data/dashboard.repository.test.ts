import { describe, expect, it } from "vitest"

import { overviewFromAccount } from "./dashboard.repository"

describe("dashboard repository", () => {
  it("builds account-only metrics from bootstrap counts", () => {
    const overview = overviewFromAccount({
      profileType: "contractor",
      primaryAccountType: "COMPANY",
      modules: ["projects", "offers", "opportunities", "saved", "notifications"],
      counts: {
        projects: 4,
        opportunities: 2,
        offers: 12,
        applications: 0,
        engagements: 1,
        unreadNotifications: 3,
        savedItems: 5,
      },
    })
    expect(overview.accountOnly).toBe(true)
    expect(overview.metrics).toHaveLength(4)
    expect(overview.metrics[0]?.value).toBe("4")
    expect(overview.quickActionKeys).toContain("publishProject")
  })

  it("renders grouped server metrics instead of coarse counts when available", () => {
    const overview = overviewFromAccount({
      profileType: "contractor",
      primaryAccountType: "SUBCONTRACTOR",
      modules: ["tenders", "offers"],
      metrics: {
        tenderInvitations: 3,
        submittedOffers: 7,
        shortlistedOffers: 2,
        wonOffers: 1,
      },
      completion: { percent: 62, completed: 5, total: 8, items: [] },
    })
    expect(overview.completion).toBe(62)
    expect(overview.metrics.map((metric) => metric.labelKey)).toEqual([
      "dashboard.metric.tenderInvitations",
      "dashboard.metric.submittedOffers",
      "dashboard.metric.shortlistedOffers",
      "dashboard.metric.wonOffers",
    ])
    expect(overview.metrics[1]?.value).toBe("7")
  })

  it("omits grouped metrics the server did not return", () => {
    const overview = overviewFromAccount({
      profileType: "worker",
      primaryAccountType: "WORKER",
      modules: ["applications"],
      metrics: { submittedApplications: 4 },
    })
    expect(overview.metrics).toHaveLength(1)
    expect(overview.metrics[0]?.labelKey).toBe(
      "dashboard.metric.submittedApplications",
    )
  })

  it("sends workers to the workforce module for availability", () => {
    const overview = overviewFromAccount({
      profileType: "worker",
      primaryAccountType: "WORKER",
      modules: ["workforce", "opportunities", "verification"],
    })
    expect(overview.quickActionKeys).toContain("updateAvailability")
  })

  it("gives subcontractors bid-board actions instead of project publish", () => {
    const overview = overviewFromAccount({
      profileType: "contractor",
      primaryAccountType: "SUBCONTRACTOR",
      modules: ["tenders", "offers", "verification"],
    })
    expect(overview.quickActionKeys).toEqual([
      "browseTenders",
      "createProposal",
      "addCertificate",
    ])
  })
})
