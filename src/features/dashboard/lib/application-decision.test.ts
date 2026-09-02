import { describe, expect, it } from "vitest"

import {
  availableApplicationStages,
  canDecideApplication,
  canWithdrawApplication,
} from "./application-decision"

describe("application decision policy", () => {
  it("does not expose direct acceptance from a newly submitted application", () => {
    expect(canDecideApplication("SUBMITTED", "ACCEPTED")).toBe(false)
    expect(availableApplicationStages("SUBMITTED")).toEqual([
      "UNDER_REVIEW",
      "SHORTLISTED",
      "CONTACTED",
      "INTERVIEW",
      "OFFERED",
      "HIRED",
    ])
  })

  it("offers only forward stages after review", () => {
    expect(availableApplicationStages("SHORTLISTED")).toEqual([
      "CONTACTED",
      "INTERVIEW",
      "OFFERED",
      "HIRED",
    ])
    expect(canDecideApplication("SHORTLISTED", "ACCEPTED")).toBe(true)
    expect(canDecideApplication("SHORTLISTED", "REJECTED")).toBe(true)
  })

  it("removes decisions at terminal states and matches backend withdrawal rules", () => {
    expect(availableApplicationStages("HIRED")).toEqual([])
    expect(canDecideApplication("REJECTED", "ACCEPTED")).toBe(false)
    expect(canWithdrawApplication("HIRED")).toBe(false)
    expect(canWithdrawApplication("REJECTED")).toBe(true)
  })
})
