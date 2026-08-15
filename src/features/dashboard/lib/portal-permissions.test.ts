import { describe, expect, it } from "vitest"

import {
  opportunityCreatePermissions,
  opportunityKindPermissions,
  opportunityKinds,
} from "./portal-permissions"

describe("portal permission configuration", () => {
  it("includes valid permissions for each opportunity kind", () => {
    for (const kind of opportunityKinds) {
      expect(
        opportunityKindPermissions[kind],
        `opportunityKindPermissions.${kind} should be defined`,
      ).toBeDefined()
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
