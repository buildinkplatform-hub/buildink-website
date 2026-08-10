import { getLocale, getTranslations } from "next-intl/server"

import { PublicAuthControls } from "@/components/layout/public-auth-controls"
import { PublicNavigation } from "@/components/layout/public-navigation"
import { BrandLogo } from "@/components/shared/brand-logo"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { Link } from "@/i18n/navigation"
import {
  getPrivateAssetDownloadUrl,
  getPublicViewer,
} from "@/lib/auth/session"
import type { Locale } from "@/shared/types/platform"

export async function PublicHeader() {
  const common = await getTranslations("common")
  const locale = (await getLocale()) as Locale
  const viewer = await getPublicViewer(locale)
  const profileImageUrl = viewer?.profileImageAssetId
    ? await getPrivateAssetDownloadUrl(viewer.profileImageAssetId)
    : null

  return (
    <header className="border-line/80 sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="page-container flex min-h-18 items-center justify-between gap-4">
        <Link href="/" aria-label="Buildink home">
          <BrandLogo />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 xl:justify-between">
          <PublicNavigation />
          <div className="hidden xl:block">
            <LocaleSwitcher compact />
          </div>
          <PublicAuthControls
            locale={locale}
            viewer={viewer}
            profileImageUrl={profileImageUrl}
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
        </div>
      </div>
    </header>
  )
}
