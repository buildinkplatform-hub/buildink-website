import {
  getEditableFields,
  getReadableFields,
  marketplaceEntityFields,
  type MarketplaceEntity,
} from "@/shared/marketplace/field-definitions"
import { describe, expect, it } from "vitest"

const entities = Object.keys(marketplaceEntityFields) as MarketplaceEntity[]

/**
 * Moderation, reviewer and storage internals are kept out of the shared field
 * list entirely rather than being tagged and filtered, so the portal cannot
 * surface them even if a form starts rendering every shared field.
 */
const adminOrSystemOnly = [
  /^flagReason/i,
  /^emergencyReveal/i,
  /^reviewer/i,
  /^moderation/i,
  /^internal/i,
  /^permissionVersion$/i,
  /^audit/i,
  /^sourceChecksum$/i,
  /storagePath/i,
  /storageKey/i,
  /^deletedAt$/i,
]

describe("shared marketplace field surface", () => {
  it("never exposes moderation, reviewer or storage internals to the portal", () => {
    const leaked = entities.flatMap((entity) =>
      marketplaceEntityFields[entity]
        .filter(
          (field) => field.portal.read || field.portal.create || field.portal.edit,
        )
        .filter((field) =>
          adminOrSystemOnly.some((pattern) => pattern.test(field.key)),
        )
        .map((field) => `${entity}.${field.key}`),
    )
    expect(leaked).toEqual([])
  })

  it("keeps every portal-writable field readable so users can review what they set", () => {
    const writableButHidden = entities.flatMap((entity) =>
      marketplaceEntityFields[entity]
        .filter(
          (field) =>
            (field.portal.create || field.portal.edit) && !field.portal.read,
        )
        .map((field) => `${entity}.${field.key}`),
    )
    expect(writableButHidden).toEqual([])
  })

  it("derives the portal surface from the portal flags alone, independent of admin", () => {
    for (const entity of entities) {
      const portalReadable = getReadableFields(entity, "portal").map(
        (field) => field.key,
      )
      const expected = marketplaceEntityFields[entity]
        .filter((field) => field.portal.read)
        .map((field) => field.key)
      expect(portalReadable).toEqual(expected)

      const portalEditable = getEditableFields(entity, "portal").map(
        (field) => field.key,
      )
      expect(portalEditable).toEqual(
        marketplaceEntityFields[entity]
          .filter((field) => field.portal.edit)
          .map((field) => field.key),
      )
    }
  })

  it("gives every entity a non-empty portal detail surface with unique keys", () => {
    for (const entity of entities) {
      const keys = getReadableFields(entity, "portal").map((field) => field.key)
      expect(keys.length).toBeGreaterThan(0)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it("lets the portal own fields the admin surface does not manage", () => {
    const portalOnly = entities.flatMap((entity) =>
      marketplaceEntityFields[entity]
        .filter((field) => field.portal.read && !field.admin.read)
        .map((field) => `${entity}.${field.key}`),
    )
    expect(portalOnly.length).toBeGreaterThan(0)
  })
})
