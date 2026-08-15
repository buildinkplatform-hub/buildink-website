"use server"

import { revalidatePath } from "next/cache"

import { BackendApiError } from "@/lib/backend/api"
import {
  acknowledgeTenderAddendum,
  activatePortalWorkspace,
  archivePortalProject,
  answerPortalBidQuestion,
  answerTenderQuestion,
  askTenderQuestion,
  completePortalUpload,
  createPortalApplication,
  createPortalBidAddendum,
  createPortalBidInvite,
  createPortalBidQuestion,
  createPortalCatalogue,
  createPortalEquipment,
  createPortalEquipmentEnquiry,
  createPortalOffer,
  createPortalOpportunity,
  createPortalProject,
  createPortalSavedItem,
  createPortalSavedSearch,
  createPortalSupportTicket,
  createPortalTender,
  createPortalUploadIntent,
  createPortalWorkspace,
  createTenderAddendum,
  createWorkerRecord,
  decideWorkspaceApplication,
  decideWorkspaceOffer,
  deletePortalSavedItem,
  deletePortalSavedSearch,
  deletePortalUpload,
  deleteWorkerRecord,
  evaluatePortalOffer,
  getPortalUploadDownload,
  invitePortalMember,
  inviteTenderBidder,
  publishPortalEquipment,
  publishPortalOpportunity,
  publishPortalProject,
  publishPortalTender,
  publishWorkspaceProfile,
  createPortalCompanyClaim,
  removePortalMember,
  replyPortalSupportTicket,
  requestWorkspaceCapability,
  requestWorkspaceOfferChanges,
  respondPortalBidInvite,
  respondTenderInvitation,
  sendPortalMessage,
  markPortalConversationRead,
  shortlistWorkspaceOffer,
  stageWorkspaceApplication,
  submitPortalApplication,
  submitPortalOffer,
  submitPortalVerification,
  transitionPortalEquipmentEnquiry,
  transitionPortalProject,
  updatePortalApplicationDraft,
  updatePortalCatalogueItem,
  updatePortalEquipment,
  updatePortalMember,
  updatePortalNotificationPreferences,
  updatePortalOfferDraft,
  updatePortalOpportunity,
  updatePortalPersona,
  updatePortalProfile,
  updatePortalProfileCollections,
  updatePortalProject,
  updatePortalSavedSearch,
  updatePortalTender,
  updatePortalVisibility,
  updateWorkspaceProfile,
  withdrawPortalApplication,
  withdrawPortalOffer,
} from "@/features/dashboard/data/portal-client"
import {
  memberInviteContract,
  memberUpdateContract,
  personaUpdateContract,
  profileCollectionsContract,
  profileVisibilityContract,
  projectMutationContract,
  projectTransitionContract,
  workspaceCreateContract,
  workspaceUpdateContract,
} from "@/features/dashboard/query/portal-contracts"
import type {
  MemberInviteContract,
  MemberUpdateContract,
  PersonaUpdateContract,
  ProfileCollectionsContract,
  ProjectMutationContract,
  ProjectTransitionContract,
  WorkspaceCreateContract,
  WorkspaceUpdateContract,
} from "@/features/dashboard/query/portal-contracts"
import type { Locale } from "@/shared/types/platform"

export async function updateMeProfileAction(input: {
  displayName?: string
  phone?: string | null
  preferredLocale?: Locale
  timezone?: string
  contactPreference?: "platform_only" | "public_contact"
  version: number
}) {
  try {
    const profile = await updatePortalProfile(input)
    revalidatePath("/dashboard")
    return { ok: true as const, profile }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError ? error.code : "PROFILE_UPDATE_FAILED",
      message:
        error instanceof Error ? error.message : "Could not save profile",
    }
  }
}

export async function decideWorkspaceOfferAction(
  companyId: string,
  id: string,
  decision: "accept" | "reject",
  version: number,
) {
  try {
    await decideWorkspaceOffer(
      companyId,
      id,
      decision,
      version,
      crypto.randomUUID(),
    )
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError ? error.code : "OFFER_DECISION_FAILED",
      message:
        error instanceof Error ? error.message : "Could not update offer",
    }
  }
}

export async function decideWorkspaceApplicationAction(
  companyId: string,
  id: string,
  decision: "accept" | "reject",
  version: number,
) {
  try {
    await decideWorkspaceApplication(
      companyId,
      id,
      decision,
      version,
      crypto.randomUUID(),
    )
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError
          ? error.code
          : "APPLICATION_DECISION_FAILED",
      message:
        error instanceof Error ? error.message : "Could not update application",
    }
  }
}

export async function sendPortalMessageAction(
  id: string,
  body: string,
  clientMessageId?: string,
) {
  try {
    await sendPortalMessage(id, body, clientMessageId ?? crypto.randomUUID())
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      code: error instanceof BackendApiError ? error.code : "MESSAGE_FAILED",
      message:
        error instanceof Error ? error.message : "Could not send message",
    }
  }
}

export async function markPortalConversationReadAction(id: string) {
  try {
    await markPortalConversationRead(id)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      code:
        error instanceof BackendApiError ? error.code : "MESSAGE_READ_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Could not mark the conversation as read",
    }
  }
}

export async function inviteWorkspaceMemberAction(
  companyId: string,
  input: MemberInviteContract,
) {
  try {
    await invitePortalMember(companyId, memberInviteContract.parse(input))
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "MEMBER_INVITE_FAILED")
  }
}

function fail(error: unknown, fallback: string) {
  return {
    ok: false as const,
    code: error instanceof BackendApiError ? error.code : fallback,
    message: error instanceof Error ? error.message : fallback,
  }
}

export async function createOfferAction(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  try {
    const offer = await createPortalOffer(body, idempotencyKey)
    revalidatePath("/dashboard")
    return { ok: true as const, offer }
  } catch (error) {
    return fail(error, "OFFER_CREATE_FAILED")
  }
}

export async function updateOfferDraftAction(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  try {
    const offer = await updatePortalOfferDraft(id, body, version)
    return { ok: true as const, offer }
  } catch (error) {
    return fail(error, "OFFER_DRAFT_FAILED")
  }
}

export async function submitOfferAction(id: string, version: number) {
  try {
    const offer = await submitPortalOffer(id, version, crypto.randomUUID())
    revalidatePath("/dashboard")
    return { ok: true as const, offer }
  } catch (error) {
    return fail(error, "OFFER_SUBMIT_FAILED")
  }
}

export async function createApplicationAction(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  try {
    const application = await createPortalApplication(body, idempotencyKey)
    revalidatePath("/dashboard")
    return { ok: true as const, application }
  } catch (error) {
    return fail(error, "APPLICATION_CREATE_FAILED")
  }
}

export async function updateApplicationDraftAction(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  try {
    const application = await updatePortalApplicationDraft(id, body, version)
    return { ok: true as const, application }
  } catch (error) {
    return fail(error, "APPLICATION_DRAFT_FAILED")
  }
}

export async function submitApplicationAction(id: string, version: number) {
  try {
    const application = await submitPortalApplication(
      id,
      version,
      crypto.randomUUID(),
    )
    revalidatePath("/dashboard")
    return { ok: true as const, application }
  } catch (error) {
    return fail(error, "APPLICATION_SUBMIT_FAILED")
  }
}

export async function updateVisibilityAction(
  input: Parameters<typeof updatePortalVisibility>[0],
) {
  try {
    const visibility = await updatePortalVisibility(
      profileVisibilityContract.parse(input),
    )
    revalidatePath("/dashboard")
    return { ok: true as const, visibility }
  } catch (error) {
    return fail(error, "VISIBILITY_UPDATE_FAILED")
  }
}

export async function updatePersonaAction(
  input: PersonaUpdateContract,
  version: number,
) {
  try {
    await updatePortalPersona(personaUpdateContract.parse(input), version)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "PERSONA_UPDATE_FAILED")
  }
}

export async function updateProfileCollectionsAction(
  input: ProfileCollectionsContract,
) {
  try {
    const collections = await updatePortalProfileCollections(
      profileCollectionsContract.parse(input),
    )
    revalidatePath("/dashboard")
    return { ok: true as const, collections }
  } catch (error) {
    return fail(error, "PROFILE_COLLECTIONS_UPDATE_FAILED")
  }
}

async function mutate<T>(run: () => Promise<T>, fallback: string) {
  try {
    const data = await run()
    revalidatePath("/dashboard")
    return { ok: true as const, data }
  } catch (error) {
    return fail(error, fallback)
  }
}

export async function createProjectAction(
  body: ProjectMutationContract,
  idempotencyKey: string,
  companyId?: string,
) {
  return mutate(async () => {
    return createPortalProject(
      projectMutationContract.parse(body),
      idempotencyKey,
      companyId,
    )
  }, "PROJECT_CREATE_FAILED")
}

export async function publishProjectAction(id: string, version: number) {
  return mutate(async () => {
    return publishPortalProject(id, version, crypto.randomUUID())
  }, "PROJECT_PUBLISH_FAILED")
}

export async function transitionProjectAction(
  id: string,
  input: ProjectTransitionContract,
) {
  return mutate(async () => {
    return transitionPortalProject(
      id,
      projectTransitionContract.parse(input),
      crypto.randomUUID(),
    )
  }, "PROJECT_TRANSITION_FAILED")
}

export async function archiveProjectAction(id: string, version: number) {
  return mutate(async () => {
    return archivePortalProject(id, version, crypto.randomUUID())
  }, "PROJECT_ARCHIVE_FAILED")
}

export async function updateProjectAction(
  id: string,
  body: ProjectMutationContract,
  version: number,
) {
  return mutate(async () => {
    return updatePortalProject(id, projectMutationContract.parse(body), version)
  }, "PROJECT_UPDATE_FAILED")
}

export async function createOpportunityAction(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  return mutate(async () => {
    return createPortalOpportunity(body, idempotencyKey, companyId)
  }, "OPPORTUNITY_CREATE_FAILED")
}

export async function publishOpportunityAction(id: string, version: number) {
  return mutate(async () => {
    return publishPortalOpportunity(id, version, crypto.randomUUID())
  }, "OPPORTUNITY_PUBLISH_FAILED")
}

export async function createTenderAction(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  return mutate(async () => {
    return createPortalTender(body, idempotencyKey, companyId)
  }, "TENDER_CREATE_FAILED")
}

export async function publishTenderAction(id: string, version: number) {
  return mutate(async () => {
    return publishPortalTender(id, version, crypto.randomUUID())
  }, "TENDER_PUBLISH_FAILED")
}

export async function createCatalogueAction(
  companyId: string,
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return mutate(async () => {
    return createPortalCatalogue(companyId, body, idempotencyKey)
  }, "CATALOGUE_CREATE_FAILED")
}

export async function createEquipmentAction(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  return mutate(async () => {
    return createPortalEquipment(body, idempotencyKey, companyId)
  }, "EQUIPMENT_CREATE_FAILED")
}

export async function publishEquipmentAction(id: string, version: number) {
  return mutate(async () => {
    return publishPortalEquipment(id, version, crypto.randomUUID())
  }, "EQUIPMENT_PUBLISH_FAILED")
}

export async function updateWorkspaceProfileAction(
  companyId: string,
  input: WorkspaceUpdateContract,
  version: number,
) {
  return mutate(async () => {
    return updateWorkspaceProfile(
      companyId,
      workspaceUpdateContract.parse(input),
      version,
    )
  }, "WORKSPACE_UPDATE_FAILED")
}

export async function createPortalUploadIntentAction(input: {
  fileName: string
  mimeType: string
  sizeBytes: number
  kind?: "image" | "document"
  purpose?: "attachment" | "document" | "image"
  documentType?: string
  expiresAt?: string
}) {
  try {
    return { ok: true as const, intent: await createPortalUploadIntent(input) }
  } catch (error) {
    return fail(error, "UPLOAD_INTENT_FAILED")
  }
}

export async function completePortalUploadAction(assetId: string) {
  try {
    await completePortalUpload(assetId)
    return { ok: true as const }
  } catch (error) {
    return fail(error, "UPLOAD_COMPLETE_FAILED")
  }
}

export async function deletePortalUploadAction(assetId: string) {
  try {
    await deletePortalUpload(assetId)
    return { ok: true as const }
  } catch (error) {
    return fail(error, "UPLOAD_DELETE_FAILED")
  }
}

export async function getPortalUploadDownloadAction(assetId: string) {
  try {
    return { ok: true as const, file: await getPortalUploadDownload(assetId) }
  } catch (error) {
    return fail(error, "UPLOAD_DOWNLOAD_FAILED")
  }
}

export async function createSavedSearchAction(input: {
  name: string
  kind: string
  query?: string | null
  alert?: {
    enabled: boolean
    frequency: "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY"
    emailEnabled: boolean
    pushEnabled: boolean
    inAppEnabled: boolean
  }
}) {
  try {
    const search = await createPortalSavedSearch(input)
    revalidatePath("/dashboard")
    return { ok: true as const, search }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_CREATE_FAILED")
  }
}

export async function deleteSavedSearchAction(id: string) {
  try {
    await deletePortalSavedSearch(id)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_DELETE_FAILED")
  }
}

export async function createBidInviteAction(input: {
  tenderId?: string
  inviteeCompanyId?: string
  inviteeProfileId?: string
  message?: string
}) {
  try {
    await createPortalBidInvite(input)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "BID_INVITE_FAILED")
  }
}

export async function respondBidInviteAction(
  id: string,
  decision: "accept" | "decline",
) {
  try {
    await respondPortalBidInvite(id, decision)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "BID_INVITE_RESPONSE_FAILED")
  }
}

export async function askBidQuestionAction(tenderId: string, question: string) {
  try {
    await createPortalBidQuestion({ tenderId, question })
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "BID_QUESTION_FAILED")
  }
}

export async function answerBidQuestionAction(id: string, answer: string) {
  try {
    await answerPortalBidQuestion(id, answer)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "BID_ANSWER_FAILED")
  }
}

export async function createBidAddendumAction(input: {
  tenderId: string
  title: string
  body: string
  publish?: boolean
}) {
  try {
    await createPortalBidAddendum(input)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "BID_ADDENDUM_FAILED")
  }
}

export async function evaluateOfferAction(
  offerId: string,
  score: number,
  notes?: string,
) {
  try {
    await evaluatePortalOffer(offerId, { score, notes })
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "OFFER_EVALUATE_FAILED")
  }
}

export async function stageWorkspaceApplicationAction(
  companyId: string,
  id: string,
  status: Parameters<typeof stageWorkspaceApplication>[2],
  version: number,
) {
  try {
    await stageWorkspaceApplication(
      companyId,
      id,
      status,
      version,
      crypto.randomUUID(),
    )
    revalidatePath("/dashboard/applications")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "APPLICATION_STAGE_FAILED")
  }
}

export async function createWorkerRecordAction(
  kind: "availability" | "credentials" | "work-history",
  body: Record<string, unknown>,
) {
  try {
    await createWorkerRecord(kind, body)
    revalidatePath("/dashboard/applications")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "WORKER_RECORD_CREATE_FAILED")
  }
}

export async function deleteWorkerRecordAction(
  kind: "availability" | "credentials" | "work-history",
  id: string,
) {
  try {
    await deleteWorkerRecord(kind, id)
    revalidatePath("/dashboard/applications")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "WORKER_RECORD_DELETE_FAILED")
  }
}

export async function tenderCollaborationAction(
  operation:
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
    | { kind: "acknowledge"; addendumId: string; companyId?: string },
) {
  try {
    switch (operation.kind) {
      case "invite":
        await inviteTenderBidder(operation.companyId, operation.tenderId, {
          recipientCompanyId: operation.recipientCompanyId,
          message: operation.message,
        })
        break
      case "respond":
        await respondTenderInvitation(operation.invitationId, operation.status)
        break
      case "ask":
        await askTenderQuestion(operation.tenderId, operation)
        break
      case "answer":
        await answerTenderQuestion(
          operation.companyId,
          operation.questionId,
          operation.answer,
        )
        break
      case "addendum":
        await createTenderAddendum(
          operation.companyId,
          operation.tenderId,
          operation,
        )
        break
      case "acknowledge":
        await acknowledgeTenderAddendum(
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
    revalidatePath("/dashboard/tenders")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "TENDER_COLLABORATION_FAILED")
  }
}

export async function requestWorkspaceOfferChangesAction(
  companyId: string,
  id: string,
  changeReason: string,
  version: number,
) {
  try {
    await requestWorkspaceOfferChanges(
      companyId,
      id,
      changeReason,
      version,
      crypto.randomUUID(),
    )
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "OFFER_CHANGE_REQUEST_FAILED")
  }
}

export async function deleteSavedItemAction(id: string) {
  try {
    await deletePortalSavedItem(id)
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "SAVED_ITEM_DELETE_FAILED")
  }
}

export async function activateWorkspaceAction(
  companyId: string,
  version: number,
) {
  try {
    const workspace = await activatePortalWorkspace(companyId, version)
    revalidatePath("/dashboard")
    return { ok: true as const, workspace }
  } catch (error) {
    return fail(error, "WORKSPACE_ACTIVATE_FAILED")
  }
}

export async function updateWorkspaceMemberAction(
  companyId: string,
  membershipId: string,
  input: MemberUpdateContract,
) {
  try {
    await updatePortalMember(
      companyId,
      membershipId,
      memberUpdateContract.parse(input),
    )
    revalidatePath("/dashboard/members")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "MEMBER_UPDATE_FAILED")
  }
}

export async function removeWorkspaceMemberAction(
  companyId: string,
  membershipId: string,
) {
  try {
    await removePortalMember(companyId, membershipId)
    revalidatePath("/dashboard/members")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "MEMBER_REMOVE_FAILED")
  }
}

export async function createEquipmentEnquiryAction(
  body: Record<string, unknown>,
) {
  try {
    await createPortalEquipmentEnquiry(body, crypto.randomUUID())
    revalidatePath("/dashboard/equipment")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "EQUIPMENT_ENQUIRY_CREATE_FAILED")
  }
}

export async function transitionEquipmentEnquiryAction(
  companyId: string,
  id: string,
  status: Parameters<typeof transitionPortalEquipmentEnquiry>[2],
  version: number,
) {
  try {
    await transitionPortalEquipmentEnquiry(companyId, id, status, version)
    revalidatePath("/dashboard/equipment")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "EQUIPMENT_ENQUIRY_TRANSITION_FAILED")
  }
}

export async function shortlistWorkspaceOfferAction(
  companyId: string,
  id: string,
  version: number,
) {
  try {
    await shortlistWorkspaceOffer(companyId, id, version, crypto.randomUUID())
    revalidatePath("/dashboard/offers")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "OFFER_SHORTLIST_FAILED")
  }
}

export async function withdrawPortalOfferAction(id: string, version: number) {
  try {
    await withdrawPortalOffer(id, version)
    revalidatePath("/dashboard/offers")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "OFFER_WITHDRAW_FAILED")
  }
}

export async function withdrawPortalApplicationAction(
  id: string,
  version: number,
) {
  try {
    await withdrawPortalApplication(id, version)
    revalidatePath("/dashboard/applications")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "APPLICATION_WITHDRAW_FAILED")
  }
}

export async function updateNotificationPreferencesAction(
  input: Record<string, unknown> & { version: number },
) {
  try {
    await updatePortalNotificationPreferences(input)
    revalidatePath("/dashboard/settings")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "NOTIFICATION_PREFS_FAILED")
  }
}

export async function updateSavedSearchAction(
  id: string,
  input: Record<string, unknown>,
  version: number,
) {
  try {
    await updatePortalSavedSearch(id, input, version)
    revalidatePath("/dashboard/saved")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_UPDATE_FAILED")
  }
}

export async function createWorkspaceAction(input: WorkspaceCreateContract) {
  try {
    await createPortalWorkspace(workspaceCreateContract.parse(input))
    revalidatePath("/dashboard/workspace")
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "WORKSPACE_CREATE_FAILED")
  }
}

export async function createSavedItemAction(input: {
  entityType: string
  entityId: string
  label?: string
  metadata?: {
    slug?: string
    module?: string
    kind?: string
  }
}) {
  try {
    await createPortalSavedItem(input)
    revalidatePath("/dashboard/saved")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "SAVED_ITEM_CREATE_FAILED")
  }
}

export async function publishWorkspaceProfileAction(
  companyId: string,
  version: number,
) {
  try {
    await publishWorkspaceProfile(companyId, version)
    revalidatePath("/dashboard/workspace")
    revalidatePath("/dashboard")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "WORKSPACE_PUBLISH_FAILED")
  }
}

export async function createCompanyClaimAction(input: {
  companyId: string
  reason: string
}) {
  try {
    await createPortalCompanyClaim(input)
    revalidatePath("/dashboard/workspace")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "COMPANY_CLAIM_FAILED")
  }
}

export async function requestWorkspaceCapabilityAction(
  companyId: string,
  input: { capability: string; requestReason?: string },
) {
  try {
    await requestWorkspaceCapability(companyId, input)
    revalidatePath("/dashboard/workspace")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "CAPABILITY_REQUEST_FAILED")
  }
}

export async function updateEntityAction(
  entity: "opportunity" | "tender" | "equipment",
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  try {
    const map = {
      opportunity: updatePortalOpportunity,
      tender: updatePortalTender,
      equipment: updatePortalEquipment,
    } as const
    await map[entity](id, body, version)
    revalidatePath(
      `/dashboard/${entity === "equipment" ? "equipment" : entity + "s"}`,
    )
    return { ok: true as const }
  } catch (error) {
    return fail(error, "ENTITY_UPDATE_FAILED")
  }
}

export async function updateCatalogueItemAction(
  companyId: string,
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  try {
    await updatePortalCatalogueItem(companyId, id, body, version)
    revalidatePath("/dashboard/catalogue")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "CATALOGUE_UPDATE_FAILED")
  }
}

export async function createSupportTicketAction(input: {
  subject: string
  category: string
  priority?: string
  body: string
}) {
  try {
    const ticket = await createPortalSupportTicket(input)
    revalidatePath("/dashboard/support")
    return { ok: true as const, ticket }
  } catch (error) {
    return fail(error, "SUPPORT_TICKET_CREATE_FAILED")
  }
}

export async function replySupportTicketAction(id: string, body: string) {
  try {
    await replyPortalSupportTicket(id, body)
    revalidatePath("/dashboard/support")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "SUPPORT_REPLY_FAILED")
  }
}

export async function submitVerificationAction(input: {
  documentAssetIds: string[]
  applicantNotes?: string
  companyId?: string
}) {
  try {
    await submitPortalVerification(input)
    revalidatePath("/dashboard/verification")
    return { ok: true as const }
  } catch (error) {
    return fail(error, "VERIFICATION_SUBMIT_FAILED")
  }
}
