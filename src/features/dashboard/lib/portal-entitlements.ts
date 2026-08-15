import type { MeResponse } from "@/lib/auth/session"
import type { PortalModule } from "@/shared/types/platform"

const BASE_MODULES: PortalModule[] = [
  "overview",
  "profile",
  "verification",
  "notifications",
  "messages",
  "saved",
  "settings",
  "support",
]

const ACTIVE_CAPABILITIES = new Set(["ACTIVE", "active"])

function hasCapability(
  me: MeResponse,
  capability: string,
): boolean {
  return (me.companyMemberships ?? []).some(
    (membership) =>
      membership.status.toLowerCase() === "active" &&
      (membership.capabilities ?? []).some(
        (item) =>
          item.capability === capability &&
          ACTIVE_CAPABILITIES.has(item.status),
      ),
  )
}

function activeWorkspace(me: MeResponse) {
  const memberships = me.companyMemberships ?? []
  return (
    memberships.find(
      (membership) =>
        membership.isPrimary && membership.status.toLowerCase() === "active",
    ) ??
    memberships.find((membership) => membership.status.toLowerCase() === "active") ??
    null
  )
}

function canManageMembers(me: MeResponse): boolean {
  const membership = activeWorkspace(me)
  if (!membership) return false
  const role = membership.role.toLowerCase()
  return role === "owner" || role === "company_admin"
}

/**
 * Derive sidebar modules from /auth/me when /portal/bootstrap is unavailable.
 * Mirrors backend portal-policy heuristics using account type and memberships.
 */
export function resolvePortalModulesFromIdentity(
  me: MeResponse,
): PortalModule[] {
  const modules = new Set<PortalModule>(BASE_MODULES)
  const accountType = me.profile?.primaryAccountType
  const workspace = activeWorkspace(me)
  const hasWorkspace = Boolean(workspace)

  if (hasWorkspace) {
    modules.add("workspace")
    modules.add("engagements")
    if (canManageMembers(me)) {
      modules.add("members")
    }
  }

  const isPublisher =
    accountType === "PROJECT_OWNER" ||
    hasCapability(me, "PROJECT_PUBLISHER") ||
    hasCapability(me, "GENERAL_CONTRACTOR")

  const isSubcontractor =
    accountType === "SUBCONTRACTOR" || hasCapability(me, "SUBCONTRACTOR")

  const isServiceProvider =
    accountType === "SERVICE_PROVIDER" ||
    hasCapability(me, "PROFESSIONAL_SERVICES")

  const isSupplier = hasCapability(me, "SUPPLIER")
  const isEquipmentProvider = hasCapability(me, "EQUIPMENT_PROVIDER")

  if (isPublisher) {
    modules.add("projects")
    modules.add("opportunities")
    modules.add("tenders")
    modules.add("offers")
    if (canManageMembers(me)) {
      modules.add("workforce")
    }
  }

  if (isSubcontractor || hasCapability(me, "GENERAL_CONTRACTOR")) {
    modules.add("offers")
    modules.add("opportunities")
    modules.add("tenders")
    modules.add("engagements")
  }

  if (isServiceProvider) {
    modules.add("offers")
    modules.add("tenders")
    modules.add("engagements")
  }

  if (isSupplier) {
    modules.add("catalogue")
    modules.add("offers")
  }

  if (isEquipmentProvider) {
    modules.add("equipment")
    modules.add("offers")
  }

  switch (accountType) {
    case "COMPANY":
      if (!isPublisher && !isSubcontractor && !isSupplier && !isEquipmentProvider) {
        modules.add("projects")
        modules.add("opportunities")
        modules.add("tenders")
        modules.add("offers")
        if (canManageMembers(me)) {
          modules.add("workforce")
        }
      }
      break
    case "WORKER":
      modules.add("applications")
      modules.add("workforce")
      modules.add("opportunities")
      modules.add("engagements")
      break
    default:
      break
  }

  return [...modules]
}
