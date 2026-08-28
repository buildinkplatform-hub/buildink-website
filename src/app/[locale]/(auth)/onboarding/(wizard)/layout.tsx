import { redirect } from "next/navigation"

import { getPortalBootstrap } from "@/features/dashboard/data/portal-client"
import { getOnboardingDraftAction } from "@/features/onboarding/actions/onboarding.actions"
import { OnboardingProvider } from "@/features/onboarding/components/onboarding-provider"
import { ReviewFeedbackBanner } from "@/features/onboarding/components/review-feedback-banner"
import {
  canUsePortalAccess,
  getSignedInDestination,
} from "@/lib/auth/destination"
import { getApplicationIdentity } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { isLocale } from "@/shared/constants/platform"

export const instant = false

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const supabase = await createClient()
  // Run the auth check, portal bootstrap and identity lookup in parallel so a
  // cold onboarding load pays one round-trip instead of three.
  const [authResult, bootstrap, identity] = await Promise.all([
    supabase.auth.getUser(),
    getPortalBootstrap(),
    getApplicationIdentity(),
  ])
  const user = authResult.data.user
  if (!user) redirect(`/${locale}/login`)
  if (!user.email_confirmed_at)
    redirect(
      `/${locale}/verify-email?email=${encodeURIComponent(user.email ?? "")}`,
    )
  if (canUsePortalAccess(bootstrap?.access)) {
    redirect(getSignedInDestination(locale, "enter_portal"))
  }
  const nextAction = identity?.account?.nextAction
  if (
    nextAction === "await_review" ||
    nextAction === "onboarding_rejected" ||
    nextAction === "account_restricted"
  ) {
    redirect(getSignedInDestination(locale, nextAction))
  }
  const metadata = user.user_metadata as Record<string, unknown>
  const initialDraft = await getOnboardingDraftAction({
    name:
      typeof metadata.name === "string"
        ? metadata.name
        : typeof metadata.full_name === "string"
          ? metadata.full_name
          : "",
    email: user.email ?? "",
    preferredLocale: locale,
    termsAcceptedAt: "",
    privacyAcceptedAt: "",
    marketing: metadata.marketing_consent === true,
  })
  return (
    <OnboardingProvider initialDraft={initialDraft}>
      <ReviewFeedbackBanner />
      {children}
    </OnboardingProvider>
  )
}
