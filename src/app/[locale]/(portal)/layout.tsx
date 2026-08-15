import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { PortalShell } from "@/features/dashboard/components/portal-shell"
import { getPortalRoutes } from "@/features/dashboard/config/portal-routes"
import { getPortalBootstrap } from "@/features/dashboard/data/portal-client"
import { PortalQueryProvider } from "@/features/dashboard/query/portal-query-provider"
import {
  canUsePortalAccess,
  getSignedInDestination,
  isDashboardHref,
} from "@/lib/auth/destination"
import {
  getApplicationIdentity,
  getPrivateAssetDownloadUrl,
  getRequiredPortalSession,
} from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { isLocale } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  if (!isLocale(requestedLocale)) redirect("/it")
  const locale: Locale = requestedLocale

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    redirect(`/${locale}/login?next=/${locale}/dashboard`)
  }

  const bootstrap = await getPortalBootstrap()
  if (bootstrap && !canUsePortalAccess(bootstrap.access)) {
    const destination = getSignedInDestination(
      locale,
      bootstrap.access.nextAction,
    )
    if (!isDashboardHref(destination, locale)) redirect(destination)
  } else if (!bootstrap) {
    const identity = await getApplicationIdentity()
    const nextAction = identity?.account?.nextAction
    if (nextAction && nextAction !== "enter_portal") {
      const destination = getSignedInDestination(locale, nextAction)
      if (!isDashboardHref(destination, locale)) redirect(destination)
    }
    const t = await getTranslations({ locale, namespace: "dashboard" })
    return (
      <main className="bg-canvas flex min-h-screen items-center justify-center px-5 py-16">
        <section className="border-line w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-brand-navy text-xl font-semibold">
            {t("title")}
          </h1>
          <p className="text-muted mt-3 text-sm">{t("bootstrapUnavailable")}</p>
          <a
            href={`/${locale}/dashboard`}
            className="bg-primary mt-6 inline-flex min-h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white"
          >
            {t("retry")}
          </a>
        </section>
      </main>
    )
  }

  const session = await getRequiredPortalSession()
  if (!session) redirect(`/${locale}/login?next=/${locale}/dashboard`)
  const profileImageUrl = bootstrap?.profile.profileImageAssetId
    ? await getPrivateAssetDownloadUrl(bootstrap.profile.profileImageAssetId)
    : null

  return (
    <PortalQueryProvider initialBootstrap={bootstrap}>
      <PortalShell
        session={session}
        locale={locale}
        routes={getPortalRoutes(
          bootstrap?.entitlements.modules ?? session.modules,
          bootstrap?.profile.primaryAccountType ?? session.primaryAccountType,
        )}
        profileImageUrl={profileImageUrl}
      >
        {children}
      </PortalShell>
    </PortalQueryProvider>
  )
}
