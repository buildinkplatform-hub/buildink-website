/**
 * Mirrors the backend company permission catalogue in
 * backend/src/portal/policy/company-permissions.ts. The server remains the
 * authority: these helpers only decide whether an action is offered in the UI.
 */
export const companyPermissions = [
  "company.view",
  "company.edit",
  "company.publish",
  "team.view",
  "team.invite",
  "team.role.manage",
  "team.remove",
  "projects.view",
  "projects.create",
  "projects.edit",
  "projects.publish",
  "projects.archive",
  "tenders.view",
  "tenders.create",
  "tenders.edit",
  "tenders.publish",
  "tenders.suspend",
  "tenders.close",
  "bids.view",
  "bids.create",
  "bids.submit",
  "bids.withdraw",
  "bids.evaluate",
  "bids.award",
  "worker_requests.manage",
  "worker_applications.review",
  "supplier_requests.manage",
  "equipment_requests.manage",
  "service_requests.manage",
  "documents.manage",
  "verification.submit",
  "certifications.manage",
  "messages.send",
  "reviews.respond",
  "reports.view",
  "reports.export",
  "activity.view",
  "company_settings.view",
  "company_settings.edit",
] as const

export type CompanyPermission = (typeof companyPermissions)[number]

export const opportunityKinds = [
  "SUBCONTRACT_WORK",
  "PROFESSIONAL_SERVICE",
  "MATERIAL_SUPPLY",
  "EQUIPMENT_REQUEST",
  "WORKFORCE_REQUEST",
] as const

export type OpportunityKind = (typeof opportunityKinds)[number]

/**
 * Mirrors permissionForOpportunityKind in
 * backend/src/portal/policy/company-permissions.ts: each kind is authorised by
 * its own permission, so a member may create some kinds and not others.
 */
export const opportunityKindPermissions: Record<
  OpportunityKind,
  CompanyPermission
> = {
  SUBCONTRACT_WORK: "tenders.create",
  PROFESSIONAL_SERVICE: "service_requests.manage",
  MATERIAL_SUPPLY: "supplier_requests.manage",
  EQUIPMENT_REQUEST: "equipment_requests.manage",
  WORKFORCE_REQUEST: "worker_requests.manage",
}

/** Union of every permission that authorises creating at least one kind. */
export const opportunityCreatePermissions: readonly CompanyPermission[] = [
  ...new Set(Object.values(opportunityKindPermissions)),
]

export function permittedOpportunityKinds(
  granted: readonly string[] | undefined | null,
): OpportunityKind[] {
  return opportunityKinds.filter((kind) =>
    hasPortalPermission(granted, opportunityKindPermissions[kind]),
  )
}

export function hasPortalPermission(
  granted: readonly string[] | undefined | null,
  permission: CompanyPermission,
): boolean {
  return Boolean(granted?.includes(permission))
}

export function hasAnyPortalPermission(
  granted: readonly string[] | undefined | null,
  permissions: readonly CompanyPermission[],
): boolean {
  return permissions.some((permission) =>
    hasPortalPermission(granted, permission),
  )
}

/**
 * Personal (non-workspace) accounts own their own records, so actions that are
 * company-permission gated for members stay available to the owner directly.
 */
export function resolveEffectivePermissions(input: {
  permissions: readonly string[]
  hasActiveWorkspace: boolean
  personalPermissions?: readonly CompanyPermission[]
}): string[] {
  if (input.hasActiveWorkspace) return [...input.permissions]
  return [...input.permissions, ...(input.personalPermissions ?? [])]
}
