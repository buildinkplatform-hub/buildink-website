"use server"

import { publicBackendApi } from "@/lib/backend/public-api"
import type { Locale } from "@/shared/types/platform"

export async function submitPublicContactAction(input: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
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
      message: error instanceof Error ? error.message : "Could not send the message",
    }
  }
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
      message: error instanceof Error ? error.message : "Could not send the report",
    }
  }
}
