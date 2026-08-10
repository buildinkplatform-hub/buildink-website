import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PortalShell } from "@/features/dashboard/components/portal-shell"
import { getPortalRoutes } from "@/features/dashboard/config/portal-routes"
import { getSession } from "@/lib/auth/session"
import { isLocale } from "@/shared/constants/platform"

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) redirect("/it")
  const session = await getSession()
  if (!session) redirect(`/${locale}/login`)
  return (
    <PortalShell
      session={session}
      locale={locale}
      routes={getPortalRoutes(session.profileType)}
    >
      {children}
    </PortalShell>
  )
}
