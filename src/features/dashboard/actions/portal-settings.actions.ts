"use server"

import { BackendApiError } from "@/lib/backend/api"
import {
  updatePortalNotificationPreferences,
  type PortalNotificationPreferences,
} from "@/features/dashboard/data/portal-client"

export async function savePortalNotificationPreferencesAction(
  input: Partial<PortalNotificationPreferences> & { version: number },
) {
  try {
    const preferences = await updatePortalNotificationPreferences(input)
    return { ok: true as const, preferences }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError
          ? error.code
          : "NOTIFICATION_PREFERENCES_UPDATE_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Could not update notification preferences",
    }
  }
}
