import "server-only"

import { cache } from "react"

import { getSignedInDestination } from "@/lib/auth/destination"
import { backendApi } from "@/lib/backend/api"
import { stripLocalePrefix } from "@/i18n/route-utils"
import { createClient } from "@/lib/supabase/server"
import type {
  Locale,
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
    verificationStatus: string
    profileImageAssetId: string | null
  } | null
}

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

export async function getSession(): Promise<SessionClaims | null> {
  const me = await getApplicationIdentity()
  if (!me || me.account?.nextAction !== "enter_portal" || !me.profile?.profileType)
    return null
  return {
    userId: me.identity.id,
    name: me.profile.displayName ?? me.identity.email?.split("@")[0] ?? "Buildink user",
    email: me.identity.email ?? "",
    profileType: me.profile.profileType.toLowerCase() as ProfileType,
    onboardingComplete: true,
    verificationStatus: me.profile.verificationStatus.toLowerCase() as VerificationStatus,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }
}

export async function clearAuthCookies(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
