import { describe, expect, it } from "vitest"

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schemas"

const validRegistration = {
  name: "Giulia Rossi",
  email: "giulia@example.com",
  password: "Buildink@123",
  confirmPassword: "Buildink@123",
  terms: true,
  privacy: true,
  marketing: false,
  preferredLocale: "it",
}

describe("auth schemas", () => {
  it("accepts a valid login and rejects malformed/empty credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "owner@buildink.demo",
        password: "Buildink@123",
        remember: false,
      }).success,
    ).toBe(true)
    expect(
      loginSchema.safeParse({
        email: "not-an-email",
        password: "Buildink@123",
        remember: false,
      }).success,
    ).toBe(false)
    expect(
      loginSchema.safeParse({
        email: "owner@buildink.demo",
        password: "",
        remember: false,
      }).success,
    ).toBe(false)
  })

  it("accepts a safe local login next path without making it a validation concern", () => {
    expect(
      loginSchema.safeParse({
        email: "owner@buildink.demo",
        password: "Buildink@123",
        remember: true,
        next: "/en/dashboard/projects",
      }).success,
    ).toBe(true)
  })

  it("requires a trimmed registration name between 2 and 100 characters", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true)
    expect(
      registerSchema.safeParse({ ...validRegistration, name: " A " }).success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        name: "  Giulia Rossi  ",
      }).success,
    ).toBe(true)
    expect(
      registerSchema.safeParse({ ...validRegistration, name: "x".repeat(101) })
        .success,
    ).toBe(false)
  })

  it("requires every password-strength dimension", () => {
    const invalidPasswords = [
      "Short1!",
      "lowercase1!",
      "UPPERCASE1!",
      "NoNumber!",
      "NoSpecial123",
    ]
    for (const password of invalidPasswords) {
      expect(
        registerSchema.safeParse({
          ...validRegistration,
          password,
          confirmPassword: password,
        }).success,
        password,
      ).toBe(false)
    }
    expect(registerSchema.safeParse(validRegistration).success).toBe(true)
  })

  it("requires matching passwords and mandatory consent but keeps marketing optional", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        confirmPassword: "Different@123",
      }).success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ ...validRegistration, terms: false }).success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ ...validRegistration, privacy: false })
        .success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ ...validRegistration, marketing: true })
        .success,
    ).toBe(true)
    expect(
      registerSchema.safeParse({ ...validRegistration, marketing: false })
        .success,
    ).toBe(true)
  })

  it("rejects unsupported locales and malformed registration email addresses", () => {
    expect(
      registerSchema.safeParse({ ...validRegistration, preferredLocale: "fr" })
        .success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ ...validRegistration, email: "broken" })
        .success,
    ).toBe(false)
  })

  it("validates forgot-password email without leaking account existence", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "known@example.com" }).success,
    ).toBe(true)
    expect(
      forgotPasswordSchema.safeParse({ email: "unknown@example.com" }).success,
    ).toBe(true)
    expect(
      forgotPasswordSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false)
  })

  it("applies the same strength and confirmation rules to password reset", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "Updated@123",
        confirmPassword: "Updated@123",
      }).success,
    ).toBe(true)
    expect(
      resetPasswordSchema.safeParse({
        password: "weak",
        confirmPassword: "weak",
      }).success,
    ).toBe(false)
    expect(
      resetPasswordSchema.safeParse({
        password: "Updated@123",
        confirmPassword: "Different@123",
      }).success,
    ).toBe(false)
  })
})
