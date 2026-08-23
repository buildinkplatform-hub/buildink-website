import "server-only"

import { redirect } from "next/navigation"

import { getApplicationIdentity } from "@/lib/auth/session"
import { isLocale } from "@/shared/constants/platform"

/**
 * Terminal onboarding pages (pending / rejected) must never redirect to
 * themselves — that creates an infinite redirect loop through the layout.
 * Each page only redirects to a DIFFERENT destination when the user's state
 * no longer matches the page being viewed.
 */
export async function guardOnboardingTerminalPage(
  requestedLocale: string,
  currentPage: "pending" | "rejected",
): Promise<void> {
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const identity = await getApplicationIdentity()
  if (!identity?.identity?.id) redirect(`/${locale}/login`)

  const nextAction = identity.account?.nextAction
  if (nextAction === "enter_portal") redirect(`/${locale}/dashboard`)
  if (nextAction === "account_restricted")
    redirect(`/${locale}/account-restricted`)

  const wizardEntry =
    nextAction === "update_onboarding"
      ? `/${locale}/onboarding/profile`
      : nextAction === "continue_onboarding"
        ? `/${locale}/onboarding/profile-type`
        : null
  if (wizardEntry) redirect(wizardEntry)

  if (currentPage === "pending" && nextAction === "onboarding_rejected") {
    redirect(`/${locale}/onboarding/rejected`)
  }
  if (currentPage === "rejected" && nextAction === "await_review") {
    redirect(`/${locale}/onboarding/pending`)
  }
}
