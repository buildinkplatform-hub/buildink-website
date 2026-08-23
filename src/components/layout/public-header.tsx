import { Suspense } from "react"
import { getLocale, getTranslations } from "next-intl/server"

import { PublicAuthControls } from "@/components/layout/public-auth-controls"
import { PublicNavigation } from "@/components/layout/public-navigation"
import { BrandLogo } from "@/components/shared/brand-logo"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { HeaderAuthSkeleton } from "@/components/shared/page-skeletons"
import { Link } from "@/i18n/navigation"
import {
  getPrivateAssetDownloadUrl,
  getPublicViewer,
} from "@/lib/auth/session"
import type { Locale } from "@/shared/types/platform"

export async function PublicHeader() {
  const common = await getTranslations("common")

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="page-container flex min-h-[76px] items-center justify-between gap-3">
        <Link href="/" aria-label={common("home")} className="shrink-0">
          <BrandLogo />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 xl:justify-between xl:gap-4">
          <PublicNavigation />
          <div className="hidden xl:block">
            <Suspense fallback={<HeaderAuthSkeleton />}>
              <LocaleSwitcher compact />
            </Suspense>
          </div>
          <Suspense fallback={<HeaderAuthSkeleton />}>
            <PublicHeaderAuth
              labels={{
                login: common("login"),
                register: common("register"),
                dashboard: common("dashboard"),
                logout: common("logout"),
                confirmLogoutTitle: common("logoutConfirmTitle"),
                confirmLogoutBody: common("logoutConfirmBody"),
                confirmLogoutAction: common("logoutConfirmAction"),
                cancel: common("cancel"),
              }}
            />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function PublicHeaderAuth({
  labels,
}: {
  labels: {
    login: string
    register: string
    dashboard: string
    logout: string
    confirmLogoutTitle: string
    confirmLogoutBody: string
    confirmLogoutAction: string
    cancel: string
  }
}) {
  const locale = (await getLocale()) as Locale
  const viewer = await getPublicViewer(locale)
  const profileImageUrl = viewer?.profileImageAssetId
    ? await getPrivateAssetDownloadUrl(viewer.profileImageAssetId)
    : null
  return (
    <PublicAuthControls
      locale={locale}
      viewer={viewer}
      profileImageUrl={profileImageUrl}
      labels={labels}
    />
  )
}
