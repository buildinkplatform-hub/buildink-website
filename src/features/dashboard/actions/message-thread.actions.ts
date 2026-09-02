"use server"

import { sendPortalMessage } from "@/features/dashboard/data/portal-client"
import { BackendApiError } from "@/lib/backend/api"

/**
 * Sending a message returns the authoritative conversation snapshot so the
 * thread can update immediately instead of waiting for the realtime echo.
 * The client message id is also the backend idempotency key.
 */
export async function sendConversationMessageAction(
  id: string,
  body: string,
  clientMessageId: string,
) {
  try {
    const conversation = await sendPortalMessage(id, body, clientMessageId)
    return { ok: true as const, conversation }
  } catch (error) {
    return {
      ok: false as const,
      code: error instanceof BackendApiError ? error.code : "MESSAGE_FAILED",
      message:
        error instanceof Error ? error.message : "Could not send message",
    }
  }
}
