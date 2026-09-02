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

describe("Worker opportunity direction", () => {
  it("keeps Worker accounts in discovery mode", () => {
    const start = routeSource.indexOf("function defaultScope(")
    const end = routeSource.indexOf("export default async function", start)
    const defaultScopeSource = routeSource.slice(start, end)

    expect(defaultScopeSource).toContain('segment === "opportunities"')
    expect(defaultScopeSource).toContain('accountType === "WORKER"')
    expect(defaultScopeSource).toContain('return "discover"')
  })

  it("redirects Workers away from direct opportunity creation", () => {
    expect(routeSource).toContain(
      'const workerOpportunityDiscoveryOnly = accountType === "WORKER"',
    )
    expect(routeSource).toContain(
      'resolved.definition.segment === "opportunities"',
    )
    expect(routeSource).toContain('resolved.action === "create"')
    expect(routeSource).toContain(
      'redirect({ href: portalListPath("opportunities"), locale })',
    )
  })

  it("does not advertise the create-opportunity CTA to Workers", () => {
    expect(routeSource).toContain(
      '? hideCreateAction(content, "opportunities")',
    )
    expect(routeSource).toContain(
      "[&_a[href$='/dashboard/opportunities/create']]:hidden",
    )
  })
})
