import { ShieldAlert } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import {
  hasAnyPortalPermission,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"

/**
 * Renders children only when the workspace grants at least one permission.
 * The API still enforces authorization; this prevents offering actions that
 * would fail with 403.
 */
export function PermissionGuard({
  permissions,
  granted,
  children,
  fallback = null,
}: {
  permissions: readonly CompanyPermission[]
  granted: readonly string[] | undefined | null
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  if (!hasAnyPortalPermission(granted, permissions)) return <>{fallback}</>
  return <>{children}</>
}

export async function PermissionDeniedState({
  description,
}: {
  description?: string
}) {
  const t = await getTranslations("dashboard")
  return (
    <Card
      className="border-warning/30 mx-auto max-w-2xl p-8 text-center"
      role="alert"
    >
      <ShieldAlert className="text-warning mx-auto size-9" aria-hidden="true" />
      <h1 className="text-brand-navy mt-4 text-2xl font-bold">
        {t("permissionDeniedTitle")}
      </h1>
      <p className="text-muted mt-2 text-sm">
        {description ?? t("permissionDeniedBody")}
      </p>
    </Card>
  )
}
