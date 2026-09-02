import { describe, expect, it } from "vitest"

import { verificationRequirementLabel } from "./verification-requirement-label"

const labels = {
  required: "Required",
  optional: "Optional",
  expiryRequired: "Expiry date required",
}

describe("verification requirement label", () => {
  it("does not call a required document optional when expiry is not required", () => {
    expect(
      verificationRequirementLabel(
        { required: true, expiryRequired: false },
        labels,
      ),
    ).toBe("Required")
  })

  it("communicates document and expiry requirements independently", () => {
    expect(
      verificationRequirementLabel(
        { required: true, expiryRequired: true },
        labels,
      ),
    ).toBe("Required · Expiry date required")
    expect(
      verificationRequirementLabel(
        { required: false, expiryRequired: true },
        labels,
      ),
    ).toBe("Optional · Expiry date required")
    expect(
      verificationRequirementLabel(
        { required: false, expiryRequired: false },
        labels,
      ),
    ).toBe("Optional")
  })
})
