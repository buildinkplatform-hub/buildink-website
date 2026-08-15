import "server-only"

import { cache } from "react"

import { backendApi } from "@/lib/backend/api"
import type {
  CompanyVisibilityContract,
  MemberInviteContract,
  MemberUpdateContract,
  PersonaUpdateContract,
  ProfileCollectionsContract,
  ProfileVisibilityContract,
  ProjectMutationContract,
  ProjectTransitionContract,
  WorkspaceCreateContract,
  WorkspaceUpdateContract,
} from "@/features/dashboard/query/portal-contracts"
import type {
  Locale,
  PortalAccountCounts,
  PortalModule,
  PrimaryAccountType,
} from "@/shared/types/platform"

export interface PortalBootstrapProfile {
  id: string
  email: string | null
  displayName: string | null
  phone: string | null
  preferredLocale: string
  timezone: string
  contactPreference: string
  primaryAccountType: PrimaryAccountType | null
  accountStatus: string
  onboardingStatus: string
  verificationStatus: string
  publicationStatus: string
  profileImageAssetId: string | null
  version: number
  updatedAt: string
}

export interface PortalWorkspace {
  membershipId: string
  companyId: string
  name: string
  slug: string
  companyStatus: string
  role: string
  status: string
  isPrimary: boolean
  title: string | null
  department: string | null
  joinedAt: string | null
  lastAccessedAt: string | null
  version: number
  capabilities: Array<{
    id: string
    capability: string
    status: string
    requestedAt: string
    reviewedAt: string | null
  }>
}

export interface PortalBootstrap {
  access: {
    kind: "guest" | "onboarding" | "review" | "restricted" | "portal"
    nextAction: string
    canWriteMarketplace: boolean
    canMutateProfile: boolean
    canSubmitOnboarding: boolean
    restrictions: string[]
  }
  profile: PortalBootstrapProfile
  workspaces: PortalWorkspace[]
  membershipInvitations: Array<{
    membershipId: string
    companyId: string
    companyName: string
    status: string
    invitedAt: string | null
  }>
  activeWorkspace: PortalWorkspace | null
  entitlements: {
    modules: PortalModule[]
    permissions: string[]
    capabilities: string[]
    allowedActions: string[]
  }
  counts: PortalAccountCounts
}

export interface PortalTaxonomyOption {
  id: string
  slug: string
  translations: unknown
}

export interface PortalProfileCollections {
  version: number
  skills: Array<{ skillId: string; level: string | null }>
  languages: Array<{ languageCode: string; proficiency: string | null }>
  categoryIds: string[]
  serviceRegionIds: string[]
  catalogue: {
    skills: PortalTaxonomyOption[]
    languages: Array<{ code: string; name: string }>
    categories: PortalTaxonomyOption[]
    serviceRegions: Array<{
      id: string
      label: string
      countryCode: string
    }>
  }
}

export interface PortalNotification {
  id: string
  type: string
  category: string
  priority: string
  actionUrl: string | null
  payload: unknown
  seenAt: string | null
  readAt: string | null
  createdAt: string
}

export interface PortalNotificationList {
  items: PortalNotification[]
  unreadCount: number
}

export interface PortalReview {
  id: string
  rating: number
  title: string
  comment: string
  locale: string
  verifiedEngagement: boolean
  status: string
  createdAt: string
  targetType: string
  targetId: string
  targetName: string
}

export interface PortalSavedItem {
  id: string
  entityType: string
  entityId: string
  label: string | null
  metadata?: {
    slug?: string
    module?: string
    kind?: string
  }
  createdAt: string
}

export interface PortalSavedSearch {
  id: string
  kind: string
  name: string
  query: string | null
  version: number
  alert: {
    enabled: boolean
    frequency: "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY"
    emailEnabled: boolean
    pushEnabled: boolean
    inAppEnabled: boolean
    timezone: string
    nextRunAt: string | null
  } | null
  locale: string
  createdAt: string
  updatedAt: string
}

export const getPortalBootstrap = cache(
  async (): Promise<PortalBootstrap | null> => {
    try {
      return await backendApi<PortalBootstrap>("/api/v1/portal/bootstrap")
    } catch {
      return null
    }
  },
)

export async function getPortalProfile(): Promise<PortalBootstrapProfile | null> {
  try {
    return await backendApi<PortalBootstrapProfile>("/api/v1/me/profile")
  } catch {
    return null
  }
}

export interface PortalDashboardMetrics {
  accountType: PrimaryAccountType | null
  companyId: string | null
  metrics: Record<string, number>
  completion: {
    percent: number
    completed: number
    total: number
    items: Array<{ key: string; done: boolean }>
  }
}

export async function getPortalDashboardMetrics(
  options: {
    signal?: AbortSignal
  } = {},
) {
  return backendApi<PortalDashboardMetrics>("/api/v1/me/dashboard", {
    signal: options.signal,
  })
}

export async function getPortalProfileCollections() {
  return backendApi<PortalProfileCollections>("/api/v1/me/profile/collections")
}

export async function updatePortalProfileCollections(
  body: ProfileCollectionsContract,
) {
  return backendApi<PortalProfileCollections>(
    "/api/v1/me/profile/collections",
    { method: "PATCH", body: JSON.stringify(body) },
  )
}

export async function listPortalNotifications(
  input: {
    page?: number
    pageSize?: number
    read?: string
  } = {},
  options: { signal?: AbortSignal } = {},
) {
  const query = new URLSearchParams()
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      query.set(key, String(value))
    }
  })
  const suffix = query.toString() ? `?${query}` : ""
  return backendApi<PortalNotificationList>(
    `/api/v1/me/notifications${suffix}`,
    { signal: options.signal },
  )
}

export async function getPortalUnreadNotificationCount() {
  return backendApi<{ count: number }>("/api/v1/me/notifications/unread-count")
}

export async function setPortalNotificationRead(id: string, read: boolean) {
  return backendApi<{ id: string; read: boolean }>(
    `/api/v1/me/notifications/${id}/${read ? "read" : "unread"}`,
    { method: "POST" },
  )
}

export async function markAllPortalNotificationsRead() {
  return backendApi<{ updated: number }>("/api/v1/me/notifications/read-all", {
    method: "POST",
  })
}

export async function getPortalVapidPublicKey() {
  return backendApi<{ publicKey: string | null }>(
    "/api/v1/me/notifications/push/vapid-public-key",
  )
}

export async function registerPortalPushSubscription(input: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}) {
  return backendApi<{ id: string; endpoint: string; createdAt: string }>(
    "/api/v1/me/notifications/push/subscriptions",
    { method: "POST", body: JSON.stringify(input) },
  )
}

export async function unregisterPortalPushSubscription(endpoint: string) {
  return backendApi<{ removed: number }>(
    "/api/v1/me/notifications/push/subscriptions",
    { method: "DELETE", body: JSON.stringify({ endpoint }) },
  )
}

export async function listMyReviews(
  input: { page?: number; pageSize?: number } = {},
) {
  const query = new URLSearchParams()
  if (input.page) query.set("page", String(input.page))
  if (input.pageSize) query.set("pageSize", String(input.pageSize))
  const suffix = query.toString() ? `?${query}` : ""
  return backendApi<{ items: PortalReview[] }>(`/api/v1/me/reviews${suffix}`)
}

export async function listPortalSavedItems() {
  return backendApi<{ items: PortalSavedItem[] }>("/api/v1/me/saved-items")
}

export async function deletePortalSavedItem(id: string) {
  return backendApi<{ ok: true }>(`/api/v1/me/saved-items/${id}`, {
    method: "DELETE",
  })
}

export async function listPortalSavedSearches() {
  return backendApi<{ items: PortalSavedSearch[] }>("/api/v1/me/saved-searches")
}

export async function createPortalSavedSearch(body: {
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
  return backendApi<PortalSavedSearch>("/api/v1/me/saved-searches", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function deletePortalSavedSearch(id: string) {
  return backendApi<{ ok: true }>(`/api/v1/me/saved-searches/${id}`, {
    method: "DELETE",
  })
}

export async function activatePortalWorkspace(
  companyId: string,
  version: number,
) {
  return backendApi<PortalWorkspace>(
    `/api/v1/me/workspaces/${companyId}/activate`,
    {
      method: "POST",
      headers: { "If-Match": String(version) },
    },
  )
}

export async function getWorkspaceOverview(companyId: string) {
  return backendApi<{
    workspace: PortalWorkspace
    counts: {
      projects: number
      opportunities: number
      offers: number
      engagements: number
    }
  }>(`/api/v1/workspaces/${companyId}/overview`)
}

export async function updatePortalProfile(input: {
  displayName?: string
  phone?: string | null
  preferredLocale?: Locale
  timezone?: string
  contactPreference?: "platform_only" | "public_contact"
  version: number
}) {
  return backendApi<PortalBootstrapProfile>("/api/v1/me/profile", {
    method: "PATCH",
    headers: { "If-Match": String(input.version) },
    body: JSON.stringify(input),
  })
}

export interface PortalOffer {
  id: string
  reference: string
  title: string | null
  status: string
  version: number
  inbox: "submitted" | "received"
  targetTitle: string | null
  proposedPriceMinor: string | null
  totalPriceMinor: string | null
  currency: string | null
  conversationId: string | null
  engagementId: string | null
  contactUnlocked: boolean
  submittedAt: string | null
  createdAt: string
  revisionCount: number
}

export interface PortalBidRevision {
  id: string
  revisionNo: number
  status: "DRAFT" | "SUBMITTED" | "SUPERSEDED"
  changeReason: string | null
  proposedPriceMinor: string | null
  taxMinor: string | null
  totalPriceMinor: string | null
  currency: string | null
  proposedDurationDays: number | null
  attachmentAssetIds: string[]
  submittedAt: string | null
  createdAt: string
  items: Array<{
    id: string
    description: string
    quantity: string | null
    unit: string | null
    unitPriceMinor: string | null
    totalMinor: string
  }>
}

export interface PortalApplication {
  id: string
  reference: string
  status: string
  version: number
  inbox: "submitted" | "received"
  opportunityTitle: string
  coverMessage?: string | null
  conversationId: string | null
  engagementId: string | null
  contactUnlocked: boolean
  submittedAt: string | null
  createdAt: string
}

export interface PortalEngagement {
  id: string
  reference: string
  title: string | null
  status: string
  agreedPriceMinor: string | null
  currency: string | null
  contactUnlocked: boolean
  conversationId: string | null
  parties: Array<{
    id: string
    role: string
    displayName: string | null
    companyName: string | null
    email: string | null
    phone: string | null
    isSelf: boolean
  }>
  createdAt: string
}

export interface PortalConversation {
  id: string
  subject: string | null
  status: string
  offerId: string | null
  applicationId: string | null
  contactUnlocked: boolean
  unreadCount: number
  counterpart: {
    displayName: string | null
    email: string | null
    phone: string | null
  } | null
  lastMessageAt: string | null
  messages: Array<{
    id: string
    senderId: string | null
    body: string | null
    sentAt: string
    mine: boolean
  }>
}

export async function listPortalOffers(
  inbox: "submitted" | "received" = "submitted",
) {
  return backendApi<{ items: PortalOffer[] }>(
    `/api/v1/me/offers?inbox=${inbox}`,
  )
}

export async function listWorkspaceOffers(companyId: string) {
  return backendApi<{ items: PortalOffer[] }>(
    `/api/v1/workspaces/${companyId}/offers`,
  )
}

export async function listPortalApplications(
  inbox: "submitted" | "received" = "submitted",
) {
  return backendApi<{ items: PortalApplication[] }>(
    `/api/v1/me/applications?inbox=${inbox}`,
  )
}

export async function listWorkspaceApplications(companyId: string) {
  return backendApi<{ items: PortalApplication[] }>(
    `/api/v1/workspaces/${companyId}/applications`,
  )
}

export async function listPortalEngagements() {
  return backendApi<{ items: PortalEngagement[] }>("/api/v1/me/engagements")
}

export async function listPortalConversations() {
  return backendApi<{ items: PortalConversation[] }>("/api/v1/me/conversations")
}

export async function getPortalConversation(id: string) {
  return backendApi<PortalConversation>(`/api/v1/me/conversations/${id}`)
}

export async function sendPortalMessage(
  id: string,
  body: string,
  idempotencyKey: string,
) {
  return backendApi<PortalConversation>(
    `/api/v1/me/conversations/${id}/messages`,
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ body, clientMessageId: idempotencyKey }),
    },
  )
}

export async function markPortalConversationRead(id: string) {
  return backendApi<{
    id: string
    lastMessageAt: string | null
    unreadCount: number
  }>(`/api/v1/me/conversations/${id}/read`, {
    method: "POST",
  })
}

export async function decideWorkspaceOffer(
  companyId: string,
  id: string,
  decision: "accept" | "reject",
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalOffer>(
    `/api/v1/workspaces/${companyId}/offers/${id}/${decision}`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
        "If-Match": String(version),
      },
      body: JSON.stringify({ version }),
    },
  )
}

export async function requestWorkspaceOfferChanges(
  companyId: string,
  id: string,
  changeReason: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalOffer>(
    `/api/v1/workspaces/${companyId}/offers/${id}/request-changes`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
        "If-Match": String(version),
      },
      body: JSON.stringify({ version, changeReason }),
    },
  )
}

export async function decideWorkspaceApplication(
  companyId: string,
  id: string,
  decision: "accept" | "reject",
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalApplication>(
    `/api/v1/workspaces/${companyId}/applications/${id}/${decision}`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
        "If-Match": String(version),
      },
      body: JSON.stringify({ version }),
    },
  )
}

export interface PortalPageInfo {
  page: number
  pageSize: number
  total: number
  hasNextPage: boolean
}

export interface PortalPaged<T> {
  items: T[]
  pageInfo: PortalPageInfo
}

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value))
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ""
}

export interface PortalOfferTarget {
  id: string
  kind: "opportunity" | "package" | "lot" | "workforce"
  title: string
  parentId?: string
  parentTitle?: string
  projectId?: string
  tenderId?: string
  opportunityKind?: string | null
  sourceKind?: string | null
  submissionChannel?: string | null
  currency?: string | null
  reference?: string | null
  eligible?: boolean
}

export async function listOfferTargets(
  kind: "opportunity" | "package" | "lot" = "opportunity",
  page = 1,
) {
  return backendApi<PortalPaged<PortalOfferTarget>>(
    `/api/v1/me/offer-targets${queryString({ kind, page, pageSize: 20 })}`,
  )
}

export async function listApplicationTargets(page = 1) {
  return backendApi<PortalPaged<PortalOfferTarget>>(
    `/api/v1/me/application-targets${queryString({ page, pageSize: 20 })}`,
  )
}

export async function createPortalOffer(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return backendApi<PortalOffer>("/api/v1/me/offers", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  })
}

export async function updatePortalOfferDraft(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi<PortalOffer>(`/api/v1/me/offers/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function submitPortalOffer(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalOffer>(`/api/v1/me/offers/${id}/submit`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ version }),
  })
}

export async function stageWorkspaceApplication(
  companyId: string,
  id: string,
  status:
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "CONTACTED"
    | "INTERVIEW"
    | "OFFERED"
    | "HIRED"
    | "REJECTED",
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalApplication>(
    `/api/v1/workspaces/${companyId}/applications/${id}/stage`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
        "If-Match": String(version),
      },
      body: JSON.stringify({ status, version }),
    },
  )
}

export interface PortalWorkforceOverview {
  availability: Array<{
    id: string
    startsOn: string
    endsOn: string | null
    kind: string
    notes: string | null
  }>
  credentials: Array<{
    id: string
    title: string
    issuer: string | null
    expiresOn: string | null
    status: string
    publicVisible: boolean
  }>
  workHistory: Array<{
    id: string
    companyName: string
    roleTitle: string
    startsOn: string
    endsOn: string | null
    verificationStatus: string
  }>
  busyPeriods?: Array<{
    id: string
    title: string | null
    status: string
    startsAt: string | null
    expectedEndAt: string | null
  }>
}

export async function getPortalWorkforceOverview() {
  return backendApi<PortalWorkforceOverview>("/api/v1/me/workforce")
}

export async function createWorkerRecord(
  kind: "availability" | "credentials" | "work-history",
  body: Record<string, unknown>,
) {
  return backendApi(`/api/v1/me/workforce/${kind}`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function deleteWorkerRecord(
  kind: "availability" | "credentials" | "work-history",
  id: string,
) {
  return backendApi<{ ok: true }>(`/api/v1/me/workforce/${kind}/${id}`, {
    method: "DELETE",
  })
}

export async function listPortalOfferRevisions(id: string) {
  return backendApi<{ items: PortalBidRevision[] }>(
    `/api/v1/me/offers/${id}/revisions`,
  )
}

export async function createPortalApplication(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return backendApi<PortalApplication>("/api/v1/me/applications", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  })
}

export async function updatePortalApplicationDraft(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi<PortalApplication>(`/api/v1/me/applications/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function submitPortalApplication(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalApplication>(`/api/v1/me/applications/${id}/submit`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ version }),
  })
}

export interface PortalProject {
  id: string
  title: string
  reference: string | null
  status: string
  publicationStatus: string
  ownerCompanyId: string | null
  ownerProfileId: string | null
  description?: string
  cityId?: string | null
  countryCode?: string | null
  addressLine1?: string | null
  postalCode?: string | null
  latitude?: string | null
  longitude?: string | null
  deadlineAt: string | null
  startsAt?: string | null
  estimatedEndAt?: string | null
  actualEndAt?: string | null
  projectStage?: string | null
  procurementStage?: string | null
  sustainabilityTargets?: unknown
  accessibilityRequirements?: unknown
  currency: string | null
  budgetMinor: string | null
  budgetPublic?: boolean
  categoryId?: string | null
  categoryIds?: string[]
  tagIds?: string[]
  packageCount: number
  version?: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface PortalProjectPackage {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  quantity: string | null
  unit: string | null
  budgetMinor: string | null
  currency: string | null
}

export interface PortalProjectCriterion {
  id: string
  label: string
  description: string | null
  kind: "COMPLIANCE" | "TECHNICAL" | "COMMERCIAL"
  weight: number
  required: boolean
  sortOrder: number
}

export interface PortalProjectMedia {
  assetId: string
  usage: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
  position: number
  name: string
  mimeType: string
  kind: string
  status: string
}

export interface PortalProjectDetail extends PortalProject {
  description: string
  categoryIds: string[]
  tagIds: string[]
  packages: PortalProjectPackage[]
  criteria: PortalProjectCriterion[]
  media: PortalProjectMedia[]
  packagesPage: PortalPageInfo
}

export interface PortalOpportunity {
  id: string
  title: string
  description?: string | null
  summary?: string | null
  reference: string | null
  kind: string | null
  statusV1: string | null
  publicationStatus: string
  companyId?: string | null
  ownerProfileId?: string | null
  professionId?: string | null
  categoryId?: string | null
  cityId?: string | null
  countryCode?: string | null
  deadlineAt: string | null
  durationDays?: number | null
  budgetMinMinor?: string | null
  budgetMaxMinor?: string | null
  currency?: string | null
  quantity?: string | null
  unit?: string | null
  employmentType?: string | null
  workArrangement?: string | null
  workersNeeded?: number | null
  materialSpecifications?: unknown
  equipmentSpecifications?: unknown
  offerCount: number
  applicationCount: number
  version?: number
}

export interface PortalTender {
  id: string
  title: string
  description?: string | null
  reference: string
  sourceKind: string | null
  submissionChannel: string | null
  sourceUrl: string | null
  sourceAuthority?: string | null
  noticeType?: string | null
  cityId?: string | null
  categoryId?: string | null
  publicationStatus: string
  visibility?: string | null
  status: string
  organizationCompanyId?: string | null
  createdById?: string | null
  valueMinor?: string | null
  currency?: string | null
  procurementMethod?: string | null
  inquiryDeadlineAt?: string | null
  submissionDeadlineAt: string
  evaluationAt?: string | null
  awardAt?: string | null
  submissionMethod?: string | null
  eligibility?: unknown
  awardCriteria?: unknown
  eligibleForOffer: boolean
  lotCount: number
  version?: number
}

export interface PortalTenderLot {
  id: string
  title: string
  reference: string
  description?: string | null
  categoryId?: string | null
  currency?: string | null
  valueMinor?: string | null
}

export interface PortalTenderCriterion {
  id: string
  label: string
  description: string | null
  kind: "COMPLIANCE" | "TECHNICAL" | "COMMERCIAL"
  weight: number
  required: boolean
  sortOrder: number
}

export interface PortalBidInvite {
  id: string
  status: string
  message: string | null
  tenderId: string | null
  opportunityId: string | null
  projectId: string | null
  targetTitle: string | null
  inviteeLabel: string | null
  expiresAt: string | null
  createdAt: string
}

export interface PortalBidQuestion {
  id: string
  status: string
  question: string
  answer: string | null
  published: boolean
  askedByLabel: string
  answeredAt: string | null
  createdAt: string
}

export interface PortalBidAddendum {
  id: string
  sequence: number
  title: string
  body: string
  status: string
  submissionDeadlineAt: string | null
  publishedAt: string | null
  createdAt: string
}

export interface PortalLevelingRow {
  offerId: string
  status: string
  submitterLabel: string
  proposedPriceMinor: string | null
  proposedDurationDays: number | null
  currency: string | null
  submittedAt: string | null
  score: number | null
  rankByPrice: number
  rankByDuration: number
}

export interface PortalTenderCollaboration {
  tender: {
    id: string
    title: string
    inquiryDeadlineAt: string | null
    submissionDeadlineAt: string
    owner: boolean
  }
  invitations: Array<{
    id: string
    recipientCompanyId: string
    status: string
    message: string | null
  }>
  questions: Array<{
    id: string
    visibility: "PUBLIC" | "PRIVATE"
    status: string
    question: string
    answer: string | null
  }>
  addenda: Array<{
    id: string
    version: number
    title: string
    body: string
    status: string
    requiresAck: boolean
    acknowledgedAt: string | null
  }>
}

export interface PortalMember {
  id: string
  role: string
  status: string
  title: string | null
  department: string | null
  invitationEmail: string | null
  joinedAt: string | null
  lastAccessedAt: string | null
  version: number
  displayName: string | null
  profileId: string
}

export interface PortalCatalogueItem {
  id: string
  name: string
  offeringType: string
  categoryId: string | null
  description: string | null
  version?: number
}

export interface PortalEquipmentItem {
  id: string
  name: string
  listingType: string
  condition?: string | null
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  yearManufactured?: number | null
  categoryId?: string | null
  cityId?: string | null
  status: string
  publicationStatus: string
  currency: string | null
  dailyRateMinor: string | null
  weeklyRateMinor?: string | null
  monthlyRateMinor?: string | null
  salePriceMinor: string | null
  ratePublic?: boolean
  operatorIncluded?: boolean
  deliveryAvailable?: boolean
  description?: string | null
  version?: number
}

export interface PortalEquipmentEnquiry {
  id: string
  equipmentId: string
  requesterId: string
  status: string
  startsOn: string
  endsOn: string
  message: string | null
  proposedRateMinor: string | null
  currency: string | null
  ownerResponse: string | null
  version: number
  equipment: { id: string; name: string }
}

export async function listPortalEquipmentEnquiries(companyId?: string) {
  const path = companyId
    ? `/api/v1/workspaces/${companyId}/equipment-enquiries`
    : "/api/v1/me/equipment-enquiries"
  return backendApi<{ items: PortalEquipmentEnquiry[] }>(path)
}

export async function createPortalEquipmentEnquiry(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return backendApi<PortalEquipmentEnquiry>("/api/v1/me/equipment-enquiries", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  })
}

export async function transitionPortalEquipmentEnquiry(
  companyId: string,
  id: string,
  status: "NEGOTIATING" | "ACCEPTED" | "DECLINED" | "CLOSED",
  version: number,
) {
  return backendApi<PortalEquipmentEnquiry>(
    `/api/v1/workspaces/${companyId}/equipment-enquiries/${id}/transition`,
    {
      method: "POST",
      headers: { "If-Match": String(version) },
      body: JSON.stringify({ status, version }),
    },
  )
}

export interface PortalDocument {
  id: string
  originalName: string
  documentType: string | null
  purpose: string
  issuedAt: string | null
  expiresAt: string | null
  status: string
  expiryRequired: boolean
  expiryMissing: boolean
}

export interface PortalVisibility {
  publicProfileVisible: ProfileVisibilityContract["publicProfileVisible"]
  websiteVisible: ProfileVisibilityContract["websiteVisible"]
  displayNameVisible: ProfileVisibilityContract["displayNameVisible"]
  profileImageVisible: ProfileVisibilityContract["profileImageVisible"]
  biographyVisible: ProfileVisibilityContract["biographyVisible"]
  skillsVisible: ProfileVisibilityContract["skillsVisible"]
  languagesVisible: ProfileVisibilityContract["languagesVisible"]
  portfolioVisible: ProfileVisibilityContract["portfolioVisible"]
  reviewsVisible: ProfileVisibilityContract["reviewsVisible"]
  generalLocationVisible: ProfileVisibilityContract["generalLocationVisible"]
  exactAddressVisible: ProfileVisibilityContract["exactAddressVisible"]
  phoneVisible: ProfileVisibilityContract["phoneVisible"]
  emailVisible: ProfileVisibilityContract["emailVisible"]
  availabilityVisible: ProfileVisibilityContract["availabilityVisible"]
  lastActiveVisible: ProfileVisibilityContract["lastActiveVisible"]
  searchEngineIndexable: ProfileVisibilityContract["searchEngineIndexable"]
  version: ProfileVisibilityContract["version"]
}

export async function listPortalProjects(
  input: {
    page?: number
    companyId?: string
    q?: string
    status?: string
    categoryId?: string
    tagId?: string
    cityId?: string
    projectStage?: string
    procurementStage?: string
    publicationStatus?: string
    deadlineFrom?: string
    deadlineTo?: string
    sort?: "newest" | "title"
  } = {},
) {
  const path = input.companyId
    ? `/api/v1/workspaces/${input.companyId}/projects`
    : "/api/v1/me/projects"
  return backendApi<PortalPaged<PortalProject>>(
    `${path}${queryString({ page: input.page ?? 1, pageSize: 10, q: input.q, status: input.status, categoryId: input.categoryId, tagId: input.tagId, cityId: input.cityId, projectStage: input.projectStage, procurementStage: input.procurementStage, publicationStatus: input.publicationStatus, deadlineFrom: input.deadlineFrom, deadlineTo: input.deadlineTo, sort: input.sort })}`,
  )
}

export async function getPortalProject(id: string, page = 1) {
  return backendApi<PortalProjectDetail>(
    `/api/v1/me/projects/${id}${queryString({ page, pageSize: 10 })}`,
  )
}

export async function listPortalOpportunities(input: {
  page?: number
  kind?: string
  scope?: "owned" | "discover"
  companyId?: string
  q?: string
  status?: string
  sort?: "newest" | "title"
}) {
  const path = input.companyId
    ? `/api/v1/workspaces/${input.companyId}/opportunities`
    : "/api/v1/me/opportunities"
  return backendApi<PortalPaged<PortalOpportunity>>(
    `${path}${queryString({
      page: input.page ?? 1,
      pageSize: 10,
      kind: input.kind,
      scope: input.scope,
      q: input.q,
      status: input.status,
      sort: input.sort,
    })}`,
  )
}

export async function getPortalOpportunity(id: string, page = 1) {
  return backendApi<PortalOpportunity>(
    `/api/v1/me/opportunities/${encodeURIComponent(id)}?page=${page}`,
  )
}

export async function listPortalTenders(input: {
  page?: number
  scope?: "owned" | "discover"
  companyId?: string
  q?: string
  status?: string
  sort?: "newest" | "title"
}) {
  const path = input.companyId
    ? `/api/v1/workspaces/${input.companyId}/tenders`
    : "/api/v1/me/tenders"
  return backendApi<PortalPaged<PortalTender>>(
    `${path}${queryString({
      page: input.page ?? 1,
      pageSize: 10,
      scope: input.scope,
      q: input.q,
      status: input.status,
      sort: input.sort,
    })}`,
  )
}

export async function getPortalTender(id: string, page = 1) {
  return backendApi<
    PortalTender & {
      lots: PortalTenderLot[]
      lotsPage: PortalPageInfo
      criteria: PortalTenderCriterion[]
    }
  >(`/api/v1/me/tenders/${id}${queryString({ page, pageSize: 10 })}`)
}

export async function listPortalBidInvites(
  inbox: "received" | "sent" = "received",
) {
  return backendApi<PortalPaged<PortalBidInvite>>(
    `/api/v1/me/bid-invites${queryString({ inbox, page: 1, pageSize: 20 })}`,
  )
}

export async function createPortalBidInvite(body: {
  tenderId?: string
  opportunityId?: string
  inviteeCompanyId?: string
  inviteeProfileId?: string
  message?: string
}) {
  return backendApi<PortalBidInvite>("/api/v1/me/bid-invites", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function respondPortalBidInvite(
  id: string,
  decision: "accept" | "decline",
) {
  return backendApi<PortalBidInvite>(
    `/api/v1/me/bid-invites/${id}/${decision}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  )
}

export async function listPortalBidQuestions(tenderId: string) {
  return backendApi<{ items: PortalBidQuestion[] }>(
    `/api/v1/me/bid-questions${queryString({ tenderId })}`,
  )
}

export async function createPortalBidQuestion(body: {
  tenderId: string
  question: string
}) {
  return backendApi<PortalBidQuestion>("/api/v1/me/bid-questions", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function answerPortalBidQuestion(id: string, answer: string) {
  return backendApi<PortalBidQuestion>(
    `/api/v1/me/bid-questions/${id}/answer`,
    {
      method: "POST",
      body: JSON.stringify({ answer, published: true }),
    },
  )
}

export async function listPortalBidAddenda(tenderId: string) {
  return backendApi<{ items: PortalBidAddendum[] }>(
    `/api/v1/me/bid-addenda${queryString({ tenderId })}`,
  )
}

export async function createPortalBidAddendum(body: {
  tenderId: string
  title: string
  body: string
  submissionDeadlineAt?: string
  publish?: boolean
}) {
  return backendApi<PortalBidAddendum>("/api/v1/me/bid-addenda", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function listPortalBidLeveling(tenderId: string) {
  return backendApi<{ items: PortalLevelingRow[] }>(
    `/api/v1/me/bid-leveling${queryString({ tenderId })}`,
  )
}

export async function evaluatePortalOffer(
  offerId: string,
  body: { score?: number; notes?: string },
) {
  return backendApi(`/api/v1/me/offers/${offerId}/evaluate`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function getTenderCollaboration(id: string) {
  return backendApi<PortalTenderCollaboration>(
    `/api/v1/me/tenders/${id}/collaboration`,
  )
}

export async function inviteTenderBidder(
  companyId: string,
  tenderId: string,
  body: { recipientCompanyId: string; message?: string | null },
) {
  return backendApi(
    `/api/v1/workspaces/${companyId}/tenders/${tenderId}/invitations`,
    { method: "POST", body: JSON.stringify(body) },
  )
}

export async function respondTenderInvitation(
  id: string,
  status: "INTERESTED" | "DECLINED",
) {
  return backendApi(`/api/v1/me/tender-invitations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export async function askTenderQuestion(
  tenderId: string,
  body: {
    question: string
    visibility: "PUBLIC" | "PRIVATE"
    companyId?: string
  },
) {
  return backendApi(`/api/v1/me/tenders/${tenderId}/questions`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function answerTenderQuestion(
  companyId: string,
  questionId: string,
  answer: string,
) {
  return backendApi(
    `/api/v1/workspaces/${companyId}/tender-questions/${questionId}/answer`,
    { method: "POST", body: JSON.stringify({ answer }) },
  )
}

export async function createTenderAddendum(
  companyId: string,
  tenderId: string,
  body: { title: string; body: string; requiresAck: boolean },
) {
  return backendApi(
    `/api/v1/workspaces/${companyId}/tenders/${tenderId}/addenda`,
    {
      method: "POST",
      body: JSON.stringify({ ...body, issue: true }),
    },
  )
}

export async function acknowledgeTenderAddendum(
  addendumId: string,
  companyId?: string,
) {
  return backendApi(`/api/v1/me/tender-addenda/${addendumId}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({ companyId }),
  })
}

export async function listPortalMembers(
  companyId: string,
  input: {
    page?: number
    q?: string
    status?: string
    sort?: "newest" | "title"
  } = {},
) {
  return backendApi<PortalPaged<PortalMember>>(
    `/api/v1/workspaces/${companyId}/members${queryString({ page: input.page ?? 1, pageSize: 10, q: input.q, status: input.status, sort: input.sort })}`,
  )
}

export async function invitePortalMember(
  companyId: string,
  body: MemberInviteContract,
) {
  return backendApi(`/api/v1/workspaces/${companyId}/members`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updatePortalMember(
  companyId: string,
  membershipId: string,
  body: MemberUpdateContract,
) {
  return backendApi(`/api/v1/workspaces/${companyId}/members/${membershipId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function removePortalMember(
  companyId: string,
  membershipId: string,
) {
  return backendApi(`/api/v1/workspaces/${companyId}/members/${membershipId}`, {
    method: "DELETE",
  })
}

export async function listPortalCatalogue(
  companyId: string,
  input: {
    page?: number
    q?: string
    sort?: "newest" | "title"
  } = {},
) {
  return backendApi<PortalPaged<PortalCatalogueItem>>(
    `/api/v1/workspaces/${companyId}/catalogue${queryString({ page: input.page ?? 1, pageSize: 10, q: input.q, sort: input.sort })}`,
  )
}

export async function getPortalCatalogue(companyId: string, id: string) {
  return backendApi<PortalCatalogueItem>(
    `/api/v1/workspaces/${companyId}/catalogue/${encodeURIComponent(id)}`,
  )
}

export async function listPortalEquipment(
  input: {
    page?: number
    companyId?: string
    q?: string
    status?: string
    sort?: "newest" | "title"
  } = {},
) {
  const path = input.companyId
    ? `/api/v1/workspaces/${input.companyId}/equipment`
    : "/api/v1/me/equipment"
  return backendApi<PortalPaged<PortalEquipmentItem>>(
    `${path}${queryString({ page: input.page ?? 1, pageSize: 10, q: input.q, status: input.status, sort: input.sort })}`,
  )
}

export async function getPortalEquipment(id: string) {
  return backendApi<PortalEquipmentItem>(
    `/api/v1/me/equipment/${encodeURIComponent(id)}`,
  )
}

export async function listPortalDocuments() {
  return backendApi<{ items: PortalDocument[] }>("/api/v1/me/documents")
}

export interface PortalVerificationRequirement {
  documentType: string
  required: boolean
  expiryRequired: boolean
  uploaded: boolean
}

export interface PortalVerificationOverview {
  verificationStatus: string
  primaryAccountType: string | null
  requirements: PortalVerificationRequirement[]
  missingRequired: PortalVerificationRequirement[]
  submission: {
    id: string
    cycle: number
    status: string
    policyName: string
    submittedAt: string | null
  } | null
  requests: Array<{
    id: string
    subjectType: string
    status: string
    priority: string
    dueAt: string | null
    slaState: "ON_TRACK" | "AT_RISK" | "BREACHED" | "MET"
  }>
}

export async function getPortalVerification() {
  return backendApi<PortalVerificationOverview>("/api/v1/me/verification")
}

export async function getPortalVisibility() {
  return backendApi<PortalVisibility>("/api/v1/me/visibility")
}

export async function updatePortalVisibility(
  input: Partial<PortalVisibility> & { version: number },
) {
  return backendApi<PortalVisibility>("/api/v1/me/visibility", {
    method: "PATCH",
    headers: { "If-Match": String(input.version) },
    body: JSON.stringify(input),
  })
}

export async function getPortalPersona() {
  return backendApi<{
    accountType: string | null
    professions: Array<{ id: string; slug: string; translations: unknown }>
    categories: Array<{ id: string; slug: string; translations: unknown }>
    worker: {
      professionId: string | null
      yearsExperience: number
      availability: string | null
      availabilityStatus: string
      availableFrom: string | null
      bio: string | null
      preferredEmploymentTypes: string[]
      preferredWorkArrangement: string | null
      willingToTravel: boolean
      travelRadiusKm: number | null
      hasOwnTransport: boolean
      workPermitCountries: string[]
      expectedPayMinMinor: string | null
      expectedPayCurrency: string | null
      expectedPayInterval: string | null
    } | null
    subcontractor: {
      primaryCategoryId: string | null
      tradingName: string | null
      yearsExperience: number
      capabilityStatement: string | null
      availabilityStatus: string
      availableFrom: string | null
      maxConcurrentProjects: number | null
      crewSize: number | null
      travelRadiusKm: number | null
      emergencyCallout: boolean
    } | null
    serviceProvider: {
      providerIdentity: string
      tradingName: string | null
      yearsExperience: number
      professionalBackground: string
      capabilityStatement: string
      professionalTitle: string | null
      licenceNumber: string | null
      licenceCountryCode: string | null
      professionalBody: string | null
      availability: string | null
      availabilityStatus: string
      availableFrom: string | null
      hourlyRateMinMinor: string | null
      rateCurrency: string | null
      remoteServices: boolean
    } | null
    projectOwner: {
      background: string | null
      description: string | null
      organizationName: string | null
      website: string | null
      preferredProjectTypes: string[]
      typicalBudgetMinMinor: string | null
      typicalBudgetMaxMinor: string | null
      budgetCurrency: string | null
      acceptsIntroductions: boolean
      yearsExperience: number
      serviceRegionIds: string[]
    } | null
    regions: Array<{ id: string; label: string; countryCode: string }>
  }>("/api/v1/me/persona")
}

export async function updatePortalPersona(
  input: PersonaUpdateContract,
  version: number,
) {
  return backendApi("/api/v1/me/persona", {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...input, version }),
  })
}

export interface PortalTaxonomyItem {
  id: string
  slug?: string
  name?: string
  label?: string
  translations?: unknown
}

export async function listPortalTaxonomy(
  kind: "categories" | "cities" | "professions" | "regions" | "skills" | "tags",
) {
  return backendApi<{ items: PortalTaxonomyItem[] }>(
    `/api/v1/me/taxonomy${queryString({ kind })}`,
  )
}

export interface PortalWorkspaceProfile {
  id: string
  name: string
  legalName: string | null
  registrationNumber: string | null
  vatNumber: string | null
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  version: number
  capabilities: Array<{ capability: string; status: string }>
  addressLine1: string | null
  cityText: string | null
  cityId: string | null
  region: string | null
  postalCode: string | null
  countryCode: string
  categoryId?: string | null
  subcategoryId?: string | null
  categoryIds?: string[]
  tagIds?: string[]
  serviceRegionIds?: string[]
  status?: string | null
  publicationStatus?: string | null
  identifiers?: Array<{
    id: string
    countryCode: string
    kind:
      | "VAT"
      | "FISCAL_CODE"
      | "REGISTRATION_NUMBER"
      | "REA"
      | "EORI"
      | "LEI"
      | "OTHER"
    rawValue: string
    isPrimary: boolean
    isPublic: boolean
  }>
  visibility?: CompanyVisibilityContract | null
  services?: Array<{ id: string; name: string; description: string | null }>
  certifications?: Array<{
    id: string
    name: string
    issuer: string | null
    issuedAt: string | null
    expiresAt: string | null
  }>
}

export async function getPortalGeographyOptions(query: string) {
  return backendApi<{
    level: string
    items: Array<{ id: string; label: string }>
  }>(`/api/v1/me/geography/options?${query}`)
}

export async function getPortalCity(id: string) {
  return backendApi<{
    city: {
      id: string
      regionId: string
      countryCode: string
      name: string
      regionName: string
      countryName: string
    }
  }>(`/api/v1/me/geography/cities/${id}`)
}

export async function createPortalWorkspace(input: WorkspaceCreateContract) {
  return backendApi<PortalWorkspaceProfile>("/api/v1/me/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getWorkspaceProfile(companyId: string) {
  return backendApi<PortalWorkspaceProfile>(`/api/v1/workspaces/${companyId}`)
}

export async function updateWorkspaceProfile(
  companyId: string,
  input: WorkspaceUpdateContract,
  version: number,
) {
  return backendApi<PortalWorkspaceProfile>(`/api/v1/workspaces/${companyId}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...input, version }),
  })
}

export async function publishWorkspaceProfile(
  companyId: string,
  version: number,
) {
  return backendApi<PortalWorkspaceProfile>(
    `/api/v1/workspaces/${companyId}/publish`,
    {
      method: "POST",
      headers: { "If-Match": String(version) },
    },
  )
}

export interface PortalCompanyClaim {
  id: string
  status: string
  reason: string | null
  submittedAt: string
  reviewedAt: string | null
  company: { id: string; name: string; slug: string | null }
}

export async function listPortalCompanyClaims() {
  return backendApi<{ items: PortalCompanyClaim[] }>(
    "/api/v1/me/company-claims",
  )
}

export async function createPortalCompanyClaim(input: {
  companyId: string
  reason: string
}) {
  return backendApi<{ id: string; status: string; submittedAt: string }>(
    "/api/v1/me/company-claims",
    { method: "POST", body: JSON.stringify(input) },
  )
}

export async function createPortalProject(
  body: ProjectMutationContract,
  idempotencyKey: string,
  companyId?: string,
) {
  const path = companyId
    ? `/api/v1/workspaces/${companyId}/projects`
    : "/api/v1/me/projects"
  return backendApi<{ id: string; version: number; publicationStatus: string }>(
    path,
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  )
}

export async function publishPortalProject(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi(`/api/v1/me/projects/${id}/publish`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ confirm: true, version }),
  })
}

export async function transitionPortalProject(
  id: string,
  input: ProjectTransitionContract,
  idempotencyKey: string,
) {
  return backendApi<PortalProject>(`/api/v1/me/projects/${id}/status`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(input.version),
    },
    body: JSON.stringify(input),
  })
}

export async function archivePortalProject(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalProject>(`/api/v1/me/projects/${id}/archive`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ confirm: true, version }),
  })
}

export async function createPortalOpportunity(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  const path = companyId
    ? `/api/v1/workspaces/${companyId}/opportunities`
    : "/api/v1/me/opportunities"
  return backendApi<{ id: string; version: number; publicationStatus: string }>(
    path,
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  )
}

export async function publishPortalOpportunity(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi(`/api/v1/me/opportunities/${id}/publish`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ confirm: true, version }),
  })
}

export async function createPortalTender(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  const path = companyId
    ? `/api/v1/workspaces/${companyId}/tenders`
    : "/api/v1/me/tenders"
  return backendApi<{ id: string; version: number; publicationStatus: string }>(
    path,
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  )
}

export async function publishPortalTender(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi(`/api/v1/me/tenders/${id}/publish`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ confirm: true, version }),
  })
}

export async function createPortalCatalogue(
  companyId: string,
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return backendApi(`/api/v1/workspaces/${companyId}/catalogue`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  })
}

export async function createPortalEquipment(
  body: Record<string, unknown>,
  idempotencyKey: string,
  companyId?: string,
) {
  const path = companyId
    ? `/api/v1/workspaces/${companyId}/equipment`
    : "/api/v1/me/equipment"
  return backendApi<{ id: string; version: number; publicationStatus: string }>(
    path,
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  )
}

export async function publishPortalEquipment(
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi(`/api/v1/me/equipment/${id}/publish`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
      "If-Match": String(version),
    },
    body: JSON.stringify({ confirm: true, version }),
  })
}

export async function createPortalUploadIntent(input: {
  fileName: string
  mimeType: string
  sizeBytes: number
  kind?: "image" | "document"
  purpose?: "attachment" | "document" | "image"
  documentType?: string
  expiresAt?: string
}) {
  return backendApi<{
    assetId: string
    bucket: string
    signedUrl: string
    token: string
    path: string
    expiresAt: string
  }>("/api/v1/me/uploads/intents", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function completePortalUpload(assetId: string) {
  return backendApi(`/api/v1/me/uploads/${assetId}/complete`, {
    method: "POST",
  })
}

export async function getPortalUploadDownload(assetId: string) {
  return backendApi<{
    url: string
    name: string
    mimeType: string
    expiresInSeconds: number
  }>(`/api/v1/me/uploads/${assetId}/download`)
}

export async function deletePortalUpload(assetId: string) {
  return backendApi(`/api/v1/me/uploads/${assetId}`, { method: "DELETE" })
}

export async function getReviewEligibility(input: {
  targetType: string
  targetId: string
}) {
  return backendApi<{
    eligible: boolean
    verifiedEngagement: boolean
    reason:
      | "self_target"
      | "already_reviewed"
      | "not_eligible"
      | "verified_engagement"
      | "verified_interaction"
  }>(
    `/api/v1/me/reviews/eligibility?targetType=${encodeURIComponent(input.targetType)}&targetId=${encodeURIComponent(input.targetId)}`,
  )
}

export async function createPortalReview(input: {
  targetType: string
  targetId: string
  rating: number
  title?: string
  comment: string
  locale: Locale
}) {
  return backendApi<{
    id: string
    status: string
  }>("/api/v1/me/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function shortlistWorkspaceOffer(
  companyId: string,
  id: string,
  version: number,
  idempotencyKey: string,
) {
  return backendApi<PortalOffer>(
    `/api/v1/workspaces/${companyId}/offers/${id}/shortlist`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
        "If-Match": String(version),
      },
      body: JSON.stringify({ version }),
    },
  )
}

export async function withdrawPortalOffer(id: string, version: number) {
  return backendApi<PortalOffer>(`/api/v1/me/offers/${id}/withdraw`, {
    method: "POST",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ version }),
  })
}

export async function withdrawPortalApplication(id: string, version: number) {
  return backendApi<PortalApplication>(
    `/api/v1/me/applications/${id}/withdraw`,
    {
      method: "POST",
      headers: { "If-Match": String(version) },
      body: JSON.stringify({ version }),
    },
  )
}

export interface PortalNotificationPreferences {
  version: number
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  marketingEnabled: boolean
  digestFrequency: "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY" | "OFF"
}

export async function getPortalNotificationPreferences() {
  return backendApi<PortalNotificationPreferences>(
    "/api/v1/me/notifications/preferences",
  )
}

export async function updatePortalNotificationPreferences(
  input: Partial<PortalNotificationPreferences> & { version: number },
) {
  return backendApi<PortalNotificationPreferences>(
    "/api/v1/me/notifications/preferences",
    {
      method: "PATCH",
      headers: { "If-Match": String(input.version) },
      body: JSON.stringify(input),
    },
  )
}

export async function updatePortalSavedSearch(
  id: string,
  input: Record<string, unknown>,
  version: number,
) {
  return backendApi<PortalSavedSearch>(`/api/v1/me/saved-searches/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...input, version }),
  })
}

export async function createPortalSavedItem(input: {
  entityType: string
  entityId: string
  label?: string
  metadata?: {
    slug?: string
    module?: string
    kind?: string
  }
}) {
  return backendApi<PortalSavedItem>("/api/v1/me/saved-items", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getWorkspacePermissions(companyId: string) {
  return backendApi<{ permissions: string[] }>(
    `/api/v1/workspaces/${companyId}/permissions`,
  )
}

export async function requestWorkspaceCapability(
  companyId: string,
  input: { capability: string; requestReason?: string },
) {
  return backendApi<{ ok: true; status: string; capability: string }>(
    `/api/v1/workspaces/${companyId}/capabilities/request`,
    { method: "POST", body: JSON.stringify(input) },
  )
}

export async function updatePortalProject(
  id: string,
  body: ProjectMutationContract,
  version: number,
) {
  return backendApi(`/api/v1/me/projects/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function updatePortalOpportunity(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi(`/api/v1/me/opportunities/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function updatePortalTender(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi(`/api/v1/me/tenders/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function updatePortalEquipment(
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi(`/api/v1/me/equipment/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export async function updatePortalCatalogueItem(
  companyId: string,
  id: string,
  body: Record<string, unknown>,
  version: number,
) {
  return backendApi(`/api/v1/workspaces/${companyId}/catalogue/${id}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    body: JSON.stringify({ ...body, version }),
  })
}

export interface PortalSupportTicket {
  id: string
  reference: string
  subject: string
  category: string
  priority: string
  status: string
  assigneeName?: string
  createdAt: string
  updatedAt: string
  dueAt: string
  resolutionNote?: string
  slaState: string
  messages?: Array<{
    id: string
    author: string
    body: string
    createdAt: string
  }>
}

export async function listPortalSupportTickets(page = 1) {
  return backendApi<PortalPaged<PortalSupportTicket>>(
    `/api/v1/me/support/tickets${queryString({ page, pageSize: 10 })}`,
  )
}

export async function createPortalSupportTicket(input: {
  subject: string
  category: string
  priority?: string
  body: string
}) {
  return backendApi<PortalSupportTicket>("/api/v1/me/support/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getPortalSupportTicket(id: string) {
  return backendApi<PortalSupportTicket>(`/api/v1/me/support/tickets/${id}`)
}

export async function replyPortalSupportTicket(id: string, body: string) {
  return backendApi<PortalSupportTicket>(
    `/api/v1/me/support/tickets/${id}/messages`,
    { method: "POST", body: JSON.stringify({ body }) },
  )
}

export interface PortalVerificationStatus {
  verificationStatus: string
  documents: Array<{
    id: string
    originalName: string
    documentType: string | null
    status: string
    expiresAt: string | null
    createdAt: string
  }>
  submission: {
    id: string
    status: string
    cycle: number
    applicantNotes: string | null
    submittedAt: string | null
    decidedAt: string | null
    checklist: Array<{
      id: string
      code: string
      label: string
      documentType: string
      required: boolean
      fulfilled: boolean
    }>
    decisions: Array<{
      id: string
      decision: string
      reason: string | null
      reviewer: string
      createdAt: string
    }>
  } | null
  openIssues: Array<{
    id: string
    code: string
    title: string
    description: string | null
    severity: string
    createdAt: string
  }>
}

export async function getPortalVerificationStatus() {
  return backendApi<PortalVerificationStatus>("/api/v1/me/verification/status")
}

export async function submitPortalVerification(input: {
  documentAssetIds: string[]
  applicantNotes?: string
  companyId?: string
}) {
  return backendApi<PortalVerificationStatus & { submissionId?: string }>(
    "/api/v1/me/verification/submit",
    { method: "POST", body: JSON.stringify(input) },
  )
}
