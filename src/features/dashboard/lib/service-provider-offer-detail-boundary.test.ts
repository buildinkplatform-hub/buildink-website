import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = readFileSync(
  resolve(process.cwd(), "src/features/dashboard/components/offers-board.tsx"),
  "utf8",
).replace(/\r\n/g, "\n")

describe("Service Provider offer boundaries", () => {
  it("translates shared offer field labels instead of rendering raw keys", () => {
    expect(source).toContain(
      't(`dashboard.${key}` as "dashboard.fields.title")',
    )
    expect(source).not.toContain("labels={(key) => key}")
  })

  it("allows bidder edits only for DRAFT and CHANGES_REQUESTED", () => {
    expect(source).toContain(
      'const editableOfferStatuses = new Set(["DRAFT", "CHANGES_REQUESTED"])',
    )
    expect(source).toContain("canEditBidderOffer(selected.status)")
    expect(source).toContain("canEditBidderOffer(item.status)")
    expect(source).toContain("canEditBidderOffer(offer.status)")
  })

  it("labels buyer-requested revisions distinctly from drafts", () => {
    expect(source).toContain(
      'status === "CHANGES_REQUESTED" ? "Revise offer" : "Edit draft"',
    )
  })
})
