import { sanitizeReturnTo } from "@/i18n/route-utils"
import type { Locale } from "@/shared/types/platform"

export function getSignedInDestination(
  locale: Locale,
  nextAction?: string | null,
  requested?: string,
): string {
  switch (nextAction) {
    case "enter_portal":
      return requested
        ? sanitizeReturnTo(requested, locale)
        : `/${locale}/dashboard`
    case "await_review":
      return `/${locale}/onboarding/pending`
    case "update_onboarding":
    case "continue_onboarding":
      return `/${locale}/onboarding/profile-type`
    case "onboarding_rejected":
      return `/${locale}/onboarding/rejected`
    case "account_restricted":
      return `/${locale}/account-restricted`
    default:
      return `/${locale}/onboarding/profile-type`
  }
}
