export interface TenderOwnershipRecord {
  createdById?: string | null
  organizationCompanyId?: string | null
}

export function isTenderOwnedByPortalActor(
  tender: TenderOwnershipRecord | null | undefined,
  profileId: string,
  workspaceCompanyIds: readonly string[],
): boolean {
  if (!tender) return false
  if (tender.createdById === profileId) return true
  return Boolean(
    tender.organizationCompanyId &&
    workspaceCompanyIds.includes(tender.organizationCompanyId),
  )
}
