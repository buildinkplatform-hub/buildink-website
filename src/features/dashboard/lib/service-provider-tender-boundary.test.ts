import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const routeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/app/[locale]/(portal)/dashboard/[...segments]/page.tsx",
  ),
  "utf8",
).replace(/\r\n/g, "\n")

describe("Service Provider tender boundary", () => {
  it("keeps a personal service provider discovery-only for tender creation", () => {
    expect(routeSource).toContain(
      'accountType === "SERVICE_PROVIDER" && !bootstrap?.activeWorkspace',
    )
    expect(routeSource).toContain('resolved.definition.segment === "tenders"')
    expect(routeSource).toContain('resolved.action === "create"')
    expect(routeSource).toContain(
      'redirect({ href: portalListPath("tenders"), locale })',
    )
  })

  it("hides the create-tender control on the discovery list", () => {
    expect(routeSource).toContain(
      "[&_a[href$='/dashboard/tenders/create']]:hidden",
    )
  })
})
