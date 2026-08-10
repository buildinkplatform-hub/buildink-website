import { notFound } from "next/navigation"

import { ComingSoonPage } from "@/features/dashboard/components/coming-soon-page"
import { getPortalRoute } from "@/features/dashboard/config/portal-routes"
import { getSession } from "@/lib/auth/session"

export default async function PortalPlaceholderRoute({
  params,
}: {
  params: Promise<{ segments: string[] }>
}) {
  const session = await getSession()
  if (!session) return null
  const { segments } = await params
  const route = getPortalRoute(session.profileType, segments)
  if (!route) notFound()
  return <ComingSoonPage route={route} />
}
