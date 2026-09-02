import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

import { canWithdrawOffer } from "./offer-withdraw"

const actionsSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/dashboard/components/offer-actions-menu.tsx",
  ),
  "utf8",
)
const boardSource = readFileSync(
  resolve(process.cwd(), "src/features/dashboard/components/offers-board.tsx"),
  "utf8",
)

describe("offer withdrawal boundary", () => {
  it("matches the backend terminal-state withdrawal guard", () => {
    for (const status of ["ACCEPTED", "WITHDRAWN", "EXPIRED", "CANCELLED"]) {
      expect(canWithdrawOffer(status)).toBe(false)
    }
    for (const status of [
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "CHANGES_REQUESTED",
      "SHORTLISTED",
      "REJECTED",
    ]) {
      expect(canWithdrawOffer(status)).toBe(true)
    }
  })

  it("applies the withdrawal guard to bidder list and detail controls", () => {
    expect(actionsSource).toContain(
      'mode === "bidder" && canWithdrawOffer(currentStatus)',
    )
    expect(boardSource).toContain("status={item.status}")
    expect(boardSource).toContain("!buyer && canWithdrawOffer(offer.status)")
  })
})
