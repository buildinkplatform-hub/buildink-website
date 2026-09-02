import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/portal-publish-forms.tsx",
  ),
  "utf8",
).replace(/\r\n/g, "\n")

const start = source.indexOf("export function CatalogueCreateForm")
const end = source.indexOf("export function EquipmentCreateForm", start)
const catalogueSource = source.slice(start, end)

describe("Supplier catalogue create navigation", () => {
  it("navigates to the newly created catalogue record after save", () => {
    expect(catalogueSource).toContain(
      "const created = result.data as { id?: string } | undefined",
    )
    expect(catalogueSource).toContain("? `/dashboard/catalogue/${created.id}`")
    expect(catalogueSource).toContain(': "/dashboard/catalogue"')
  })

  it("does not leave a successful save on the create form", () => {
    expect(catalogueSource).not.toContain("if (result.ok) router.refresh()")
  })
})
