import { DashboardPage } from "@/features/dashboard/components/dashboard-page"
import { PortalModuleLoadFallback } from "@/features/dashboard/components/portal-module-load-fallback"
import { getRequiredPortalSession } from "@/lib/auth/session"

export default async function DashboardRoute() {
  const session = await getRequiredPortalSession()
  if (!session) return null
  try {
    return await DashboardPage({ session })
  } catch (error) {
    console.error("Portal dashboard failed", error)
    return <PortalModuleLoadFallback href="/dashboard" />
  }
}
