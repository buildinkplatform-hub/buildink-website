import { describe, expect, it } from "vitest"

import { loginSchema, registerSchema } from "./auth.schemas"

describe("auth schemas", () => {
  it("accepts a valid login", () => {
    expect(
      loginSchema.safeParse({
        email: "owner@buildink.demo",
        password: "Buildink@123",
        remember: false,
      }).success,
    ).toBe(true)
  })

  it("requires strong matching registration passwords and consent", () => {
    const base = {
      name: "Giulia Rossi",
      email: "giulia@example.com",
      password: "Buildink@123",
      confirmPassword: "Buildink@123",
      terms: true,
      privacy: true,
      marketing: false,
      preferredLocale: "it",
    }
    expect(registerSchema.safeParse(base).success).toBe(true)
    expect(
      registerSchema.safeParse({
        ...base,
        password: "weak",
        confirmPassword: "weak",
      }).success,
    ).toBe(false)
    expect(registerSchema.safeParse({ ...base, terms: false }).success).toBe(
      false,
    )
    expect(registerSchema.safeParse({ ...base, privacy: false }).success).toBe(
      false,
    )
  })
})
