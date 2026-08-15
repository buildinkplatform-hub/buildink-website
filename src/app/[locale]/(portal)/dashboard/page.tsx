import { DashboardPage } from "@/features/dashboard/components/dashboard-page"
import { getRequiredPortalSession } from "@/lib/auth/session"

export default async function DashboardRoute() {
  const session = await getRequiredPortalSession()
  if (!session) return null
  return <DashboardPage session={session} />
}
