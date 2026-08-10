import { describe, expect, it } from "vitest"

import { mapRegistrationError } from "./auth-errors"

describe("mapRegistrationError", () => {
  it("maps existing accounts without showing a login-password error", () => {
    expect(mapRegistrationError({ code: "email_exists" })).toBe(
      "account_exists",
    )
  })

  it("identifies confirmation-email delivery failures", () => {
    expect(
      mapRegistrationError({
        code: "unexpected_failure",
        message: "Error sending confirmation email",
        status: 500,
      }),
    ).toBe("email_delivery")
  })

  it("maps Supabase rate limits to actionable registration errors", () => {
    expect(mapRegistrationError({ code: "over_email_send_rate_limit" })).toBe(
      "email_rate_limited",
    )
    expect(mapRegistrationError({ status: 429 })).toBe("rate_limited")
  })
})
