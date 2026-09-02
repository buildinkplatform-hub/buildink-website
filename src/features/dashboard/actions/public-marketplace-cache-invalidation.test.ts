import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

const source = readFileSync(
  resolve(process.cwd(), "src/features/dashboard/actions/portal.actions.ts"),
  "utf8",
)

describe("portal public marketplace cache invalidation", () => {
  it("expires cached public marketplace data after shared publishable mutations", () => {
    expect(source).toContain(
      'import { revalidatePath, updateTag } from "next/cache"',
    )

    const start = source.indexOf("async function mutate<T>")
    const end = source.indexOf("export async function createProjectAction")
    const mutateSource = source.slice(start, end)

    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    expect(mutateSource).toContain('updateTag("public-marketplace")')
  })

  it("also invalidates public cache for mutation paths outside the shared helper", () => {
    const directMutationNames = [
      "updateMeProfileAction",
      "updateVisibilityAction",
      "updatePersonaAction",
      "updateProfileCollectionsAction",
      "publishWorkspaceProfileAction",
      "updateEntityAction",
      "updateCatalogueItemAction",
      "submitVerificationAction",
    ]

    for (const name of directMutationNames) {
      const start = source.indexOf(`export async function ${name}`)
      expect(start).toBeGreaterThan(-1)
      const nextExport = source.indexOf("\nexport async function ", start + 1)
      const block = source.slice(
        start,
        nextExport === -1 ? undefined : nextExport,
      )
      expect(block).toContain('updateTag("public-marketplace")')
    }
  })
})
