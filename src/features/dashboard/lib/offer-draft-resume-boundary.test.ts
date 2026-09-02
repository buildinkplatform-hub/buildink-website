import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const boardSource = readFileSync(
  resolve(process.cwd(), "src/features/dashboard/components/offers-board.tsx"),
  "utf8",
)
const actionsSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/offer-actions-menu.tsx",
  ),
  "utf8",
)
const routesSource = readFileSync(
  resolve(process.cwd(), "src/features/dashboard/config/portal-routes.ts"),
  "utf8",
)
const formSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/offer-draft-edit-form.tsx",
  ),
  "utf8",
)

describe("offer draft resume boundary", () => {
  it("enables the generic offer edit route", () => {
    expect(routesSource).toContain(
      "offers: { detail: true, create: true, edit: true }",
    )
  })

  it("only renders the bidder editor for an owned editable offer", () => {
    expect(boardSource).toContain('query.action === "edit"')
    expect(boardSource).toContain('mode !== "bidder"')
    expect(boardSource).toContain("!canEditBidderOffer(selected.status)")
    expect(boardSource).toContain(
      'const editableOfferStatuses = new Set(["DRAFT", "CHANGES_REQUESTED"])',
    )
  })

  it("exposes bidder edit actions for DRAFT and CHANGES_REQUESTED rows", () => {
    expect(actionsSource).toContain(
      'currentStatus === "DRAFT" || currentStatus === "CHANGES_REQUESTED"',
    )
    expect(boardSource).toContain("canEditBidderOffer(item.status)")
    expect(boardSource).toContain("/dashboard/offers/${item.id}/edit")
    expect(boardSource).toContain(
      'status === "CHANGES_REQUESTED" ? "Revise offer" : "Edit draft"',
    )
  })

  it("saves the existing draft before submitting it", () => {
    expect(formSource).toContain("updateOfferDraftAction")
    expect(formSource).toContain("submitOfferAction")
    expect(formSource).toContain("const savedVersion = await saveDraft()")
    expect(formSource).toContain("submitOfferAction(offer.id, savedVersion)")
  })
})
