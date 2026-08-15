import { sanitizeReturnTo } from "@/i18n/route-utils"
import type { Locale } from "@/shared/types/platform"

export interface PortalAccessHint {
  kind?: string | null
  nextAction?: string | null
}

function dashboardPath(locale: Locale): string {
  return `/${locale}/dashboard`
}

function requestedDashboardPath(
  requested: string | undefined,
  locale: Locale,
): string | null {
  if (!requested) return null
  const safe = sanitizeReturnTo(requested, locale)
  const dashboard = dashboardPath(locale)
  if (safe === dashboard || safe.startsWith(`${dashboard}/`)) return safe
  return null
}

export function canUsePortalAccess(access?: PortalAccessHint | null): boolean {
  if (!access) return false
  return access.kind === "portal" || access.nextAction === "enter_portal"
}

export function isDashboardHref(href: string, locale: Locale): boolean {
  const dashboard = dashboardPath(locale)
  const [path] = href.split(/[?#]/)
  return path === dashboard || path.startsWith(`${dashboard}/`)
}

export function getSignedInDestination(
  locale: Locale,
  nextAction?: string | null,
  requested?: string,
): string {
  switch (nextAction) {
    case "enter_portal":
      return requestedDashboardPath(requested, locale) ?? dashboardPath(locale)
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
