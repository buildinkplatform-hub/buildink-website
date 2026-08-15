export const portalQueryKeys = {
  all: ["portal"] as const,
  bootstrap: () => [...portalQueryKeys.all, "bootstrap"] as const,
  notifications: (filters: { page: number; pageSize: number; read?: string }) =>
    [...portalQueryKeys.all, "notifications", filters] as const,
  unreadNotifications: () =>
    [...portalQueryKeys.all, "notifications", "unread-count"] as const,
  resource: (
    resource: string,
    parameters?: Readonly<Record<string, unknown>>,
  ) => [...portalQueryKeys.all, resource, parameters ?? {}] as const,
}
