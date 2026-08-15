import "server-only"

import { cache } from "react"

import {
  canUsePortalAccess,
  getSignedInDestination,
} from "@/lib/auth/destination"
import { backendApi } from "@/lib/backend/api"
import { stripLocalePrefix } from "@/i18n/route-utils"
import { createClient } from "@/lib/supabase/server"
import { getPortalBootstrap } from "@/features/dashboard/data/portal-client"
import { isProfileType } from "@/shared/constants/platform"
import { resolveCanonicalAccountType } from "@/shared/lib/account-type-mapping"
import type {
  Locale,
  PortalModule,
  PrimaryAccountType,
  ProfileType,
  PublicViewer,
  SessionClaims,
  VerificationStatus,
} from "@/shared/types/platform"

interface MeResponse {
  identity: { id: string; email: string | null }
  account?: {
    status: string
    onboardingStatus: string
    nextAction: string
  }
  profile: {
    displayName: string | null
    profileType: string | null
    primaryAccountType?: string | null
    verificationStatus: string
    profileImageAssetId: string | null
    version?: number
  } | null
  companyMemberships?: Array<{
    id: string
    role: string
    status: string
    isPrimary?: boolean
    company: { id: string; name: string; slug: string; status?: string }
    capabilities?: Array<{ capability: string; status: string }>
  }>
}

export type { MeResponse }

const readApplicationIdentity = cache(async (): Promise<MeResponse | null> => {
  try {
    return await backendApi<MeResponse>("/api/v1/auth/me")
  } catch {
    return null
  }
})

export async function getApplicationIdentity(): Promise<MeResponse | null> {
  return readApplicationIdentity()
}

export async function getPublicViewer(
  locale: Locale,
): Promise<PublicViewer | null> {
  const me = await getApplicationIdentity()
  if (!me?.identity.id) return null

  const nextAction = me.account?.nextAction ?? "continue_onboarding"

  return {
    name:
      me.profile?.displayName ??
      me.identity.email?.split("@")[0] ??
      "Buildink user",
    email: me.identity.email ?? "",
    nextAction,
    profileHref: stripLocalePrefix(getSignedInDestination(locale, nextAction)),
    profileImageAssetId: me.profile?.profileImageAssetId ?? null,
  }
}

export async function getPrivateAssetDownloadUrl(
  assetId: string,
): Promise<string | null> {
  try {
    const result = await backendApi<{
      url: string
    }>(`/api/v1/onboarding/uploads/${assetId}/download`)
    return result.url
  } catch {
    return null
  }
}

function asProfileType(
  profileType: string | null | undefined,
  accountType?: string | null,
): ProfileType {
  const normalized = profileType?.toLowerCase()
  if (isProfileType(normalized)) return normalized
  switch (accountType) {
    case "WORKER":
      return "worker"
    case "SERVICE_PROVIDER":
      return "service_provider"
    case "COMPANY":
    case "SUBCONTRACTOR":
      return "contractor"
    case "PROJECT_OWNER":
      return "individual"
    default:
      return "individual"
  }
}

function asVerificationStatus(
  value: string | null | undefined,
): VerificationStatus {
  const normalized = value?.toLowerCase()
  if (normalized === "verified") return "verified"
  if (normalized === "changes_requested") return "changes_requested"
  return "pending"
}

export async function getSession(): Promise<SessionClaims | null> {
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap || !canUsePortalAccess(bootstrap.access)) return null
  return {
    userId: bootstrap.profile.id,
    name:
      bootstrap.profile.displayName ??
      bootstrap.profile.email?.split("@")[0] ??
      "Buildink user",
    email: bootstrap.profile.email ?? "",
    profileType: asProfileType(undefined, bootstrap.profile.primaryAccountType),
    primaryAccountType:
      resolveCanonicalAccountType({
        primaryAccountType: bootstrap.profile.primaryAccountType,
      }) ?? null,
    modules: bootstrap.entitlements.modules,
    permissions: bootstrap.entitlements.permissions,
    capabilities: bootstrap.entitlements.capabilities,
    hasActiveWorkspace: Boolean(bootstrap.activeWorkspace),
    counts: bootstrap.counts,
    onboardingComplete: true,
    verificationStatus: asVerificationStatus(
      bootstrap.profile.verificationStatus,
    ),
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }
}

export async function getRequiredPortalSession(): Promise<SessionClaims | null> {
  return getSession()
}

export async function clearAuthCookies(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export type { PortalModule, PrimaryAccountType }
