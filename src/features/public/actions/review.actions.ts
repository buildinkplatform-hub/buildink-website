"use server"

import { BackendApiError } from "@/lib/backend/api"
import { createPortalReview } from "@/features/dashboard/data/portal-client"
import type { Locale } from "@/shared/types/platform"

export async function submitPublicReviewAction(input: {
  targetType: string
  targetId: string
  rating: number
  title?: string
  comment: string
  locale: Locale
}) {
  try {
    await createPortalReview(input)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      code: error instanceof BackendApiError ? error.code : "REVIEW_CREATE_FAILED",
      message:
        error instanceof Error ? error.message : "Could not submit the review",
    }
  }
}
