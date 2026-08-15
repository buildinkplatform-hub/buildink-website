import { describe, expect, it } from "vitest"

import {
  companyPermissions as backendCompanyPermissions,
  permissionForOpportunityKind,
} from "../../../../../backend/src/portal/policy/company-permissions"
import {
  companyPermissions,
  opportunityCreatePermissions,
  opportunityKindPermissions,
  opportunityKinds,
} from "./portal-permissions"

const MIRROR = "website/src/features/dashboard/lib/portal-permissions.ts"
const SOURCE = "backend/src/portal/policy/company-permissions.ts"

describe("portal permission mirror", () => {
  it("mirrors the backend company permission catalogue exactly", () => {
    const backend = new Set<string>(backendCompanyPermissions)
    const website = new Set<string>(companyPermissions)
    const drift = {
      missingFromMirror: [...backend].filter((name) => !website.has(name)),
      notInBackend: [...website].filter((name) => !backend.has(name)),
    }
    expect(
      drift,
      `${MIRROR} has drifted from ${SOURCE}. Missing from the mirror: ${
        drift.missingFromMirror.join(", ") || "none"
      }. Present in the mirror but not the backend: ${
        drift.notInBackend.join(", ") || "none"
      }.`,
    ).toEqual({ missingFromMirror: [], notInBackend: [] })
  })

  it("mirrors permissionForOpportunityKind for every kind", () => {
    for (const kind of opportunityKinds) {
      expect(
        opportunityKindPermissions[kind],
        `opportunityKindPermissions.${kind} in ${MIRROR} disagrees with permissionForOpportunityKind("${kind}") in ${SOURCE}.`,
      ).toBe(permissionForOpportunityKind(kind))
    }
  })

  it("offers create when any single opportunity kind is permitted", () => {
    for (const kind of opportunityKinds) {
      expect(
        opportunityCreatePermissions,
        `A member holding only ${opportunityKindPermissions[kind]} can create ${kind}, so the create gate must include that permission.`,
      ).toContain(opportunityKindPermissions[kind])
    }
  })
})
