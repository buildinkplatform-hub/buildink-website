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

export const dynamic = "force-dynamic"
export const revalidate = 0

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
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect(`/${locale}/login`)
  if (!data.user.email_confirmed_at)
    redirect(
      `/${locale}/verify-email?email=${encodeURIComponent(data.user.email ?? "")}`,
    )
  const bootstrap = await getPortalBootstrap()
  if (canUsePortalAccess(bootstrap?.access)) {
    redirect(getSignedInDestination(locale, "enter_portal"))
  }
  const identity = await getApplicationIdentity()
  const nextAction = identity?.account?.nextAction
  if (
    nextAction === "await_review" ||
    nextAction === "onboarding_rejected" ||
    nextAction === "account_restricted"
  ) {
    redirect(getSignedInDestination(locale, nextAction))
  }
  const metadata = data.user.user_metadata as Record<string, unknown>
  const initialDraft = await getOnboardingDraftAction({
    name:
      typeof metadata.name === "string"
        ? metadata.name
        : typeof metadata.full_name === "string"
          ? metadata.full_name
          : "",
    email: data.user.email ?? "",
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
