import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

const routeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/app/[locale]/(portal)/dashboard/[...segments]/page.tsx",
  ),
  "utf8",
)
const tenderDetailSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/portal-tender-detail-page.tsx",
  ),
  "utf8",
)

describe("Project Owner bid direction", () => {
  it("redirects buyer-mode accounts away from direct offer creation", () => {
    expect(routeSource).toContain("const offerBuyerMode =")
    expect(routeSource).toContain('accountType === "PROJECT_OWNER"')
    expect(routeSource).toContain('portalModules.has("projects")')
    expect(routeSource).toContain('resolved.action === "create"')
    expect(routeSource).toContain(
      'redirect({ href: portalListPath("offers"), locale })',
    )
  })

  it("does not advertise the bidder offer action on an owned tender detail", () => {
    expect(tenderDetailSource).toContain(
      "const canSubmitOffer = !canManage && detail.eligibleForOffer",
    )
    expect(tenderDetailSource).toContain("{!canManage ? (")
    expect(tenderDetailSource).toContain("canSubmitOffer ? (")
  })

  it("rejects direct edit routes for opportunities the actor does not own", () => {
    expect(routeSource).toContain(
      'resolved.definition.segment === "opportunities"',
    )
    expect(routeSource).toContain('resolved.action === "edit"')
    expect(routeSource).toContain("const ownsOpportunity = Boolean(")
    expect(routeSource).toContain("if (!ownsOpportunity) notFound()")
  })

  it("runs ownership 404 guards before the resilient module catch boundary", () => {
    const catchBoundary = routeSource.indexOf("try {")
    expect(catchBoundary).toBeGreaterThan(0)
    expect(
      routeSource.indexOf("if (!ownsOpportunity) notFound()"),
    ).toBeLessThan(catchBoundary)
    expect(
      routeSource.indexOf(
        'if (resolved.action === "edit" && !ownsTender) notFound()',
      ),
    ).toBeLessThan(catchBoundary)
  })
})
