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
      className="border-warning/25 bg-warning/[0.035] mx-auto w-full max-w-2xl p-6 sm:p-7"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <span className="border-warning/20 bg-warning/10 text-warning grid size-10 shrink-0 place-items-center rounded-xl border">
          <ShieldAlert className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-brand-navy text-lg font-semibold tracking-[-0.02em]">
            {t("permissionDeniedTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {description ?? t("permissionDeniedBody")}
          </p>
        </div>
      </div>
    </Card>
  )
}
