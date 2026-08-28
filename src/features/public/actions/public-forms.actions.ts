"use server"

import { publicBackendApi } from "@/lib/backend/public-api"
import type { Locale } from "@/shared/types/platform"

export type PublicContactCategory =
  | "ACCOUNT"
  | "VERIFICATION"
  | "PROJECT_TENDER_BID"
  | "PRIVACY_DATA_RIGHTS"
  | "ILLEGAL_CONTENT_ABUSE"
  | "GENERAL_SUPPORT"

export async function submitPublicContactAction(input: {
  name: string
  email: string
  phone?: string
  category: PublicContactCategory
  profileType?: string
  referenceUrl?: string
  referenceItemId?: string
  message: string
  illegalReason?: string
  legalBasis?: string
  evidenceContext?: string
  goodFaith?: boolean
  locale: Locale
}) {
  try {
    await publicBackendApi("/api/v1/public/contact", {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify(input),
    })
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error ? error.message : "Could not send the message",
    }
  }
}

export async function confirmPublicNewsletterAction(token: string) {
  try {
    await publicBackendApi(
      `/api/v1/public/newsletter/confirm?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    )
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Confirmation failed",
    }
  }
}

export async function unsubscribePublicNewsletterAction(formData: FormData) {
  try {
    await publicBackendApi("/api/v1/public/newsletter/unsubscribe", {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ token: String(formData.get("token") ?? "") }),
    })
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Unsubscribe failed",
    }
  }
}

export async function unsubscribePublicNewsletterFormAction(
  formData: FormData,
) {
  await unsubscribePublicNewsletterAction(formData)
}

export async function subscribePublicNewsletterAction(input: {
  email: string
  locale: Locale
}) {
  try {
    await publicBackendApi("/api/v1/public/newsletter", {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ ...input, consentVersion: "public-v1" }),
    })
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Could not subscribe",
    }
  }
}

export async function submitPublicAbuseAction(input: {
  entityType: string
  entityId: string
  reasonCode: string
  description?: string
}) {
  try {
    await publicBackendApi("/api/v1/public/abuse-reports", {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify(input),
    })
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error ? error.message : "Could not send the report",
    }
  }
}
