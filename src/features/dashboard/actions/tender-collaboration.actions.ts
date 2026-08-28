"use server"

import { revalidatePath } from "next/cache"

import {
  acknowledgeTenderAddendum,
  answerTenderQuestion,
  askTenderQuestion,
  createTenderAddendum,
  inviteTenderBidder,
  respondTenderInvitation,
} from "@/features/dashboard/data/portal-client"
import { BackendApiError } from "@/lib/backend/api"

export type TenderCollaborationOperation =
  | {
      kind: "invite"
      companyId: string
      tenderId: string
      recipientCompanyId: string
      message?: string
    }
  | {
      kind: "respond"
      invitationId: string
      status: "INTERESTED" | "DECLINED"
    }
  | {
      kind: "ask"
      tenderId: string
      question: string
      visibility: "PUBLIC" | "PRIVATE"
      companyId?: string
    }
  | { kind: "answer"; companyId: string; questionId: string; answer: string }
  | {
      kind: "addendum"
      companyId: string
      tenderId: string
      title: string
      body: string
      requiresAck: boolean
    }
  | { kind: "acknowledge"; addendumId: string; companyId?: string }

export async function mutateTenderCollaborationAction(
  operation: TenderCollaborationOperation,
) {
  try {
    let data: unknown
    switch (operation.kind) {
      case "invite":
        data = await inviteTenderBidder(
          operation.companyId,
          operation.tenderId,
          {
            recipientCompanyId: operation.recipientCompanyId,
            message: operation.message,
          },
        )
        break
      case "respond":
        data = await respondTenderInvitation(
          operation.invitationId,
          operation.status,
        )
        break
      case "ask":
        data = await askTenderQuestion(operation.tenderId, operation)
        break
      case "answer":
        data = await answerTenderQuestion(
          operation.companyId,
          operation.questionId,
          operation.answer,
        )
        break
      case "addendum":
        data = await createTenderAddendum(
          operation.companyId,
          operation.tenderId,
          operation,
        )
        break
      case "acknowledge":
        data = await acknowledgeTenderAddendum(
          operation.addendumId,
          operation.companyId,
        )
        break
      default: {
        const exhaustive: never = operation
        throw new Error(
          `Unhandled tender collaboration action: ${String(exhaustive)}`,
        )
      }
    }

    // Keep the server-rendered route fresh for a later cold navigation without
    // forcing the current client view to refetch after the mutation.
    revalidatePath("/dashboard/tenders")
    return { ok: true as const, data }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError
          ? error.code
          : "TENDER_COLLABORATION_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Could not update tender collaboration",
    }
  }
}
