"use server"

import { BackendApiError } from "@/lib/backend/api"
import {
  createPortalSupportTicket,
  replyPortalSupportTicket,
} from "@/features/dashboard/data/portal-client"

function fail(error: unknown, fallback: string) {
  return {
    ok: false as const,
    code: error instanceof BackendApiError ? error.code : fallback,
    message: error instanceof Error ? error.message : fallback,
  }
}

export async function createPortalSupportTicketAction(input: {
  subject: string
  category: string
  priority?: string
  body: string
}) {
  try {
    const ticket = await createPortalSupportTicket(input)
    return { ok: true as const, ticket }
  } catch (error) {
    return fail(error, "SUPPORT_TICKET_CREATE_FAILED")
  }
}

export async function replyPortalSupportTicketAction(id: string, body: string) {
  try {
    const ticket = await replyPortalSupportTicket(id, body)
    return { ok: true as const, ticket }
  } catch (error) {
    return fail(error, "SUPPORT_TICKET_REPLY_FAILED")
  }
}
