import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const formSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/equipment-form.tsx",
  ),
  "utf8",
).replace(/\r\n?/g, "\n")

describe("Supplier equipment draft lifecycle", () => {
  it("allows an existing DRAFT equipment listing to expose Publish", () => {
    expect(formSource).toContain('equipment?.status === "DRAFT"')
    expect(formSource).toContain('mode === "create" || canPublishDraft')
    expect(formSource).toContain("publishEquipmentAction")
  })

  it("saves current edit fields before publishing the draft", () => {
    expect(formSource).toContain("const saved = await updateEntityAction(")
    expect(formSource).toContain('"equipment",\n      equipment.id')
    expect(formSource).toContain("const savedVersion =")
    expect(formSource).toContain(
      "publishEquipmentAction(equipment.id, savedVersion)",
    )
  })

  it("uses the edit-mode publish path instead of creating a second listing", () => {
    expect(formSource).toContain(
      'void (mode === "edit" ? publishDraft() : save(true))',
    )
    expect(formSource).toContain("createEquipmentAction")
  })
})
