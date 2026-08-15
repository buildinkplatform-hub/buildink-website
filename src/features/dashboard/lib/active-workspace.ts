import type { PortalWorkspace } from "@/features/dashboard/data/portal-client"

type ActiveWorkspaceLike = Pick<
  PortalWorkspace,
  "companyId" | "isPrimary" | "status"
>

/** Returns the user's active company workspace (primary, else first active). */
export function getActiveWorkspace<T extends ActiveWorkspaceLike>(
  workspaces: T[] | null | undefined,
): T | null {
  if (!workspaces?.length) return null
  const primary = workspaces.find(
    (workspace) =>
      workspace.isPrimary && workspace.status.toLowerCase() === "active",
  )
  if (primary) return primary
  return (
    workspaces.find(
      (workspace) => workspace.status.toLowerCase() === "active",
    ) ?? workspaces[0] ?? null
  )
}

export function getActiveCompanyId(
  workspaces: ActiveWorkspaceLike[] | null | undefined,
): string | undefined {
  return getActiveWorkspace(workspaces)?.companyId
}
