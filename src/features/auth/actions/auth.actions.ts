"use server"

import { redirect } from "next/navigation"

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/features/auth/schemas/auth.schemas"
import {
  mapRegistrationError,
  type RegistrationActionError,
} from "@/features/auth/actions/auth-errors"
import { sanitizeReturnTo } from "@/i18n/route-utils"
import { getSignedInDestination } from "@/lib/auth/destination"
import {
  AuthRateLimitExceededError,
  limitAuthAction,
} from "@/lib/auth/rate-limit"
import { getApplicationIdentity } from "@/lib/auth/session"
import { resolvePublicOrigin } from "@/lib/url/public-origin"
import { createClient } from "@/lib/supabase/server"
import { isLocale } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

export interface ActionResult {
  success: boolean
  error?: "invalid" | "validation" | "not_verified" | "rate_limited" | "backend"
  retryAfterSeconds?: number
}

async function checkLimit(
  action: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<ActionResult | null> {
  try {
    await limitAuthAction(action, subject, limit, windowSeconds)
    return null
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AuthRateLimitExceededError
          ? "rate_limited"
          : "backend",
      retryAfterSeconds:
        error instanceof AuthRateLimitExceededError
          ? error.retryAfterSeconds
          : undefined,
    }
  }
}

async function destination(
  locale: Locale,
  requested?: string,
): Promise<string> {
  const me = await getApplicationIdentity()
  if (!me) return `/${locale}/verify-email`
  return getSignedInDestination(locale, me.account?.nextAction, requested)
}

export async function loginAction(
  locale: Locale,
  input: LoginInput,
): Promise<ActionResult> {
  if (!isLocale(locale)) return { success: false, error: "validation" }
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "validation" }
  const limited = await checkLimit(
    "password-login",
    parsed.data.email,
    10,
    15 * 60,
  )
  if (limited) return limited
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  })
  if (error) return { success: false, error: "invalid" }
  redirect(await destination(locale, parsed.data.next))
}

export async function registerAction(
  locale: Locale,
  input: RegisterInput,
): Promise<{
  success: boolean
  error?: RegistrationActionError
  retryAfterSeconds?: number
}> {
  if (!isLocale(locale)) return { success: false, error: "validation" }
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success || parsed.data.preferredLocale !== locale)
    return { success: false, error: "validation" }
  const limited = await checkLimit("register", parsed.data.email, 5, 60 * 60)
  if (limited)
    return {
      success: false,
      error: limited.error === "rate_limited" ? "rate_limited" : "backend",
      retryAfterSeconds: limited.retryAfterSeconds,
    }
  const siteUrl = await resolvePublicOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/${locale}/auth/callback?next=/${locale}/onboarding/profile-type`,
      data: {
        name: parsed.data.name,
        preferred_locale: locale,
        registration_terms_version: "2026-08-08",
        registration_privacy_version: "2026-08-08",
        marketing_consent: parsed.data.marketing,
      },
    },
  })
  if (error) return { success: false, error: mapRegistrationError(error) }
  if (data.session) redirect(`/${locale}/onboarding/profile-type`)
  redirect(
    `/${locale}/verify-email?email=${encodeURIComponent(parsed.data.email)}`,
  )
}

export async function googleLoginAction(locale: Locale, next?: string) {
  if (!isLocale(locale)) return { success: false as const }
  const limited = await checkLimit("google-login", "oauth", 20, 15 * 60)
  if (limited) return limited
  const safeNext = sanitizeReturnTo(
    next ?? `/${locale}/onboarding/profile-type`,
    locale,
  )
  const siteUrl = await resolvePublicOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/${locale}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  })
  if (error || !data.url) return { success: false as const }
  redirect(data.url)
}

export async function resendVerificationAction(locale: Locale, email: string) {
  if (!isLocale(locale) || !forgotPasswordSchema.safeParse({ email }).success)
    return { success: true as const }
  const limited = await checkLimit("resend-verification", email, 3, 60 * 60)
  if (limited) return { success: true as const }
  const siteUrl = await resolvePublicOrigin()
  const supabase = await createClient()
  await supabase.auth.resend({
    type: "signup",
    email: email.toLowerCase(),
    options: {
      emailRedirectTo: `${siteUrl}/${locale}/auth/callback?next=/${locale}/onboarding/profile-type`,
    },
  })
  return { success: true as const }
}

export async function forgotPasswordAction(
  email: string,
  locale: Locale = "it",
) {
  const parsed = forgotPasswordSchema.safeParse({ email })
  if (parsed.success && isLocale(locale)) {
    const limited = await checkLimit(
      "forgot-password",
      parsed.data.email,
      3,
      60 * 60,
    )
    if (limited) return { success: true as const }
    const siteUrl = await resolvePublicOrigin()
    const supabase = await createClient()
    await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
      redirectTo: `${siteUrl}/${locale}/auth/callback?next=/${locale}/reset-password`,
    })
  }
  return { success: true as const }
}

export async function resetPasswordAction(input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return { success: false as const }
  const limited = await checkLimit(
    "reset-password",
    "authenticated-user",
    5,
    60 * 60,
  )
  if (limited) return limited
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return { success: false as const }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  return { success: !error }
}

export async function logoutAction(locale: Locale) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${isLocale(locale) ? locale : "it"}/login`)
}
