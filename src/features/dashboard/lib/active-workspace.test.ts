import { describe, expect, it } from "vitest"

import { getActiveCompanyId, getActiveWorkspace } from "./active-workspace"

type Workspace = {
  companyId: string
  isPrimary: boolean
  status: string
  label: string
}

const workspace = (
  companyId: string,
  status: string,
  isPrimary = false,
): Workspace => ({ companyId, status, isPrimary, label: companyId })

describe("getActiveWorkspace", () => {
  it("prefers the primary active workspace", () => {
    const workspaces = [
      workspace("secondary", "ACTIVE"),
      workspace("primary", "ACTIVE", true),
    ]

    expect(getActiveWorkspace(workspaces)?.companyId).toBe("primary")
    expect(getActiveCompanyId(workspaces)).toBe("primary")
  })

  it("uses the first active workspace when no active primary exists", () => {
    const workspaces = [
      workspace("stale-primary", "SUSPENDED", true),
      workspace("active", "ACTIVE"),
    ]

    expect(getActiveWorkspace(workspaces)?.companyId).toBe("active")
  })

  it("returns no workspace when every membership is inactive", () => {
    const workspaces = [
      workspace("invited", "INVITED", true),
      workspace("suspended", "SUSPENDED"),
    ]

    expect(getActiveWorkspace(workspaces)).toBeNull()
    expect(getActiveCompanyId(workspaces)).toBeUndefined()
  })
})
