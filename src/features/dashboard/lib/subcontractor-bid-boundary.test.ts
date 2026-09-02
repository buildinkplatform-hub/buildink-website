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

describe("Subcontractor bidder boundaries", () => {
  it("defaults seller-style opportunity workspaces to discovery", () => {
    const start = routeSource.indexOf("function defaultScope(")
    const end = routeSource.indexOf("export default async function", start)
    const defaultScopeSource = routeSource.slice(start, end)

    expect(defaultScopeSource).toContain('segment === "opportunities"')
    expect(defaultScopeSource).toContain('accountType === "SUBCONTRACTOR"')
    expect(defaultScopeSource).toContain('accountType === "SERVICE_PROVIDER"')
    expect(defaultScopeSource).toContain('return "discover"')
  })

  it("hides foreign tender edit controls while keeping the direct edit 404 guard", () => {
    expect(routeSource).toContain(
      'resolved.definition.segment === "tenders" &&',
    )
    expect(routeSource).toContain("if (!ownsTender) notFound()")
    expect(tenderDetailSource).toContain("const canEdit =")
    expect(tenderDetailSource).toContain("canManage &&")
    expect(tenderDetailSource).toContain('portalEditPath("tenders", detail.id)')
  })
})
