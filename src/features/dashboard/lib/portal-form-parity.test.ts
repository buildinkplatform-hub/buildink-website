import {
  getFormFields,
  marketplaceEntityFields,
  type MarketplaceEntity,
} from "@/shared/marketplace/field-definitions"
import {
  equipmentWebsiteObject,
  opportunityWebsiteObject,
  projectWebsiteObject,
  tenderWebsiteObject,
  websiteAuthoringKeys,
} from "@/shared/marketplace/portal-form-schemas"
import { describe, expect, it } from "vitest"

const authoringEntities = [
  ["project", projectWebsiteObject.shape],
  ["tender", tenderWebsiteObject.shape],
  ["equipment", equipmentWebsiteObject.shape],
  ["opportunity", opportunityWebsiteObject.shape],
] as const satisfies ReadonlyArray<
  readonly [MarketplaceEntity, Record<string, unknown>]
>

describe("portal form schema parity", () => {
  it("keeps website schemas covering every portal create/edit field", () => {
    for (const [entity, shape] of authoringEntities) {
      const schemaKeys = new Set(websiteAuthoringKeys(shape))
      for (const mode of ["create", "edit"] as const) {
        const missing = getFormFields(entity, "portal", mode)
          .map((field) => field.key)
          .filter((key) => !schemaKeys.has(key))
        expect(missing, `${entity} ${mode}`).toEqual([])
      }
    }
  })

  it("does not put portal-read-only shared fields into website authoring schemas", () => {
    for (const [entity, shape] of authoringEntities) {
      const leaked = websiteAuthoringKeys(shape).filter((key) => {
        const definition = marketplaceEntityFields[entity].find(
          (field) => field.key === key,
        )
        return Boolean(
          definition && !definition.portal.create && !definition.portal.edit,
        )
      })
      expect(leaked, entity).toEqual([])
    }
  })
})
