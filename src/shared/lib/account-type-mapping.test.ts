import { describe, expect, it } from "vitest"

import {
  accountTypeFromProfileType,
  needsCompanyAssociation,
  profileTypeForAccountType,
  resolveCanonicalAccountType,
} from "./account-type-mapping"

describe("account type mapping", () => {
  it("maps legacy profile types onto the five account types", () => {
    expect(accountTypeFromProfileType("individual")).toBe("PROJECT_OWNER")
    expect(accountTypeFromProfileType("worker")).toBe("WORKER")
    expect(accountTypeFromProfileType("contractor")).toBe("SUBCONTRACTOR")
    expect(accountTypeFromProfileType("contractor", "company-1")).toBe(
      "SUBCONTRACTOR",
    )
    expect(accountTypeFromProfileType("supplier_contact")).toBe("COMPANY")
    expect(accountTypeFromProfileType("service_provider")).toBe("SERVICE_PROVIDER")
    expect(accountTypeFromProfileType("service_provider", "company-1")).toBe(
      "SERVICE_PROVIDER",
    )
  })

  it("prefers a stored primary account type during dual-read", () => {
    expect(
      resolveCanonicalAccountType({
        primaryAccountType: "COMPANY",
        profileType: "contractor",
      }),
    ).toBe("COMPANY")
    expect(
      resolveCanonicalAccountType({
        primaryAccountType: null,
        profileType: "contractor",
      }),
    ).toBe("SUBCONTRACTOR")
  })

  it("stores new onboarding choices on compatible legacy profile types", () => {
    expect(profileTypeForAccountType("COMPANY")).toBe("contractor")
    expect(profileTypeForAccountType("COMPANY", "supplier_contact")).toBe(
      "supplier_contact",
    )
    expect(profileTypeForAccountType("PROJECT_OWNER")).toBe("individual")
    expect(profileTypeForAccountType("SUBCONTRACTOR")).toBe("contractor")
    expect(profileTypeForAccountType("SERVICE_PROVIDER")).toBe("service_provider")
    expect(profileTypeForAccountType("WORKER")).toBe("worker")
  })

  it("requires company association only for Company accounts", () => {
    expect(needsCompanyAssociation("COMPANY")).toBe(true)
    expect(needsCompanyAssociation("SUBCONTRACTOR")).toBe(false)
    expect(needsCompanyAssociation("SERVICE_PROVIDER")).toBe(false)
    expect(needsCompanyAssociation("PROJECT_OWNER")).toBe(false)
    expect(needsCompanyAssociation("WORKER")).toBe(false)
  })
})
