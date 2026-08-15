import { describe, expect, it } from "vitest"

import {
  canUsePortalAccess,
  getSignedInDestination,
  isDashboardHref,
} from "./destination"

describe("getSignedInDestination", () => {
  it("routes approved users to the dashboard by default", () => {
    expect(getSignedInDestination("en", "enter_portal")).toBe("/en/dashboard")
  })

  it("preserves a safe return path for approved users", () => {
    expect(
      getSignedInDestination("en", "enter_portal", "/en/dashboard/settings"),
    ).toBe("/en/dashboard/settings")
  })

  it("does not send approved users back into onboarding", () => {
    expect(
      getSignedInDestination("en", "enter_portal", "/en/onboarding/profile-type"),
    ).toBe("/en/dashboard")
  })

  it("routes pending review users to the pending screen", () => {
    expect(getSignedInDestination("en", "await_review")).toBe(
      "/en/onboarding/pending",
    )
  })

  it("routes onboarding users back into profile setup", () => {
    expect(getSignedInDestination("en", "continue_onboarding")).toBe(
      "/en/onboarding/profile-type",
    )
    expect(getSignedInDestination("en", "update_onboarding")).toBe(
      "/en/onboarding/profile-type",
    )
  })

  it("routes rejected and restricted users to their dedicated screens", () => {
    expect(getSignedInDestination("en", "onboarding_rejected")).toBe(
      "/en/onboarding/rejected",
    )
    expect(getSignedInDestination("en", "account_restricted")).toBe(
      "/en/account-restricted",
    )
  })

  it("treats approved portal access as dashboard-ready", () => {
    expect(
      canUsePortalAccess({ kind: "portal", nextAction: "enter_portal" }),
    ).toBe(true)
    expect(
      canUsePortalAccess({ kind: "onboarding", nextAction: "enter_portal" }),
    ).toBe(true)
    expect(
      canUsePortalAccess({
        kind: "onboarding",
        nextAction: "continue_onboarding",
      }),
    ).toBe(false)
    expect(isDashboardHref("/en/dashboard", "en")).toBe(true)
    expect(isDashboardHref("/en/dashboard/settings", "en")).toBe(true)
    expect(isDashboardHref("/en/onboarding/profile-type", "en")).toBe(false)
  })
})
