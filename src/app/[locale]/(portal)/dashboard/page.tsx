import { DashboardPage } from "@/features/dashboard/components/dashboard-page"
import { getSession } from "@/lib/auth/session"

export default async function DashboardRoute() {
  const session = await getSession()
  if (!session) return null
  return <DashboardPage session={session} />
}
