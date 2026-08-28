"use server"

import { BackendApiError } from "@/lib/backend/api"
import {
  createPortalEquipmentEnquiry,
  transitionPortalEquipmentEnquiry,
} from "@/features/dashboard/data/portal-client"

function fail(error: unknown, fallback: string) {
  return {
    ok: false as const,
    code: error instanceof BackendApiError ? error.code : fallback,
    message: error instanceof Error ? error.message : fallback,
  }
}

export async function createEquipmentEnquiryCachedAction(
  body: Record<string, unknown>,
) {
  try {
    const enquiry = await createPortalEquipmentEnquiry(
      body,
      crypto.randomUUID(),
    )
    return { ok: true as const, enquiry }
  } catch (error) {
    return fail(error, "EQUIPMENT_ENQUIRY_CREATE_FAILED")
  }
}

export async function transitionEquipmentEnquiryCachedAction(
  companyId: string,
  id: string,
  status: "NEGOTIATING" | "ACCEPTED" | "DECLINED" | "CLOSED",
  version: number,
) {
  try {
    const enquiry = await transitionPortalEquipmentEnquiry(
      companyId,
      id,
      status,
      version,
    )
    return { ok: true as const, enquiry }
  } catch (error) {
    return fail(error, "EQUIPMENT_ENQUIRY_TRANSITION_FAILED")
  }
}
