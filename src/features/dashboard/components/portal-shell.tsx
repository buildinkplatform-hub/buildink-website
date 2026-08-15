"use client"

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { useState } from "react"

import { PublicUserMenu } from "@/components/layout/public-user-menu"
import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PortalCurrencyIndicator } from "@/features/dashboard/components/portal-currency-indicator"
import { PortalDateRangePicker } from "@/features/dashboard/components/portal-date-range-picker"
import { PortalLanguageSwitcher } from "@/features/dashboard/components/portal-language-switcher"
import { PortalMainContent } from "@/features/dashboard/components/portal-main-content"
import { PortalNavBadge } from "@/features/dashboard/components/portal-nav-badge"
import { portalIcons } from "@/features/dashboard/components/portal-icons"
import { PortalRouteSearch } from "@/features/dashboard/components/portal-route-search"
import { PortalNotificationMenu } from "@/features/dashboard/notifications/notification-menu"
import { PortalPushPermissionBootstrap } from "@/features/dashboard/notifications/use-push-notifications"
import { PortalRealtimeProvider } from "@/features/dashboard/realtime/portal-realtime-provider"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import { usePortalNavigationStore } from "@/stores/portal-navigation-store"
import { usePortalSidebarStore } from "@/stores/portal-sidebar-store"
import { primaryAccountTypeLabelKeys } from "@/shared/constants/platform"
import type {
  Locale,
  PortalRouteDefinition,
  SessionClaims,
} from "@/shared/types/platform"

function Navigation({
  routes,
  close,
  collapsed = false,
  instance = "desktop",
}: {
  routes: PortalRouteDefinition[]
  close?: () => void
  collapsed?: boolean
  instance?: "desktop" | "mobile"
}) {
  const t = useTranslations()
  const pathname = usePathname()
  const startNavigation = usePortalNavigationStore((state) => state.start)
  const links = [
    { segment: "", labelKey: "common.dashboard", state: "active" as const },
    ...routes,
  ]

  return (
    <nav aria-label={t("common.portalNav")} className="flex min-h-0 flex-1 flex-col">
      {!collapsed ? (
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400/80 uppercase">
          {t("common.portalNav")}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.25)_transparent] space-y-0.5 overflow-y-auto px-2 pb-4">
        {links.map((route) => {
          const href = route.segment ? `/dashboard/${route.segment}` : "/dashboard"
          const active = route.segment
            ? new RegExp(`/dashboard/${route.segment}(?:/|$)`).test(pathname)
            : /\/dashboard\/?$/.test(pathname)
          const Icon =
            portalIcons[route.segment || "dashboard"] ?? portalIcons.dashboard
          const label = t(route.labelKey)
          const comingSoon = route.state === "coming-soon"
          const collapsedTitle = comingSoon
            ? `${label} (${t("common.comingSoon")})`
            : label

          const link = (
            <Link
              key={route.segment || "dashboard"}
              href={href}
              onClick={() => {
                if (!active) startNavigation()
                close?.()
              }}
              title={collapsed ? collapsedTitle : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-brand-400/60 relative flex h-9 items-center gap-3 rounded-lg px-3 text-[12px] font-medium text-slate-300 transition-[background-color,color,transform] outline-none hover:bg-[rgba(23,107,255,0.16)] hover:text-white focus-visible:ring-2",
                collapsed && "justify-center px-0",
                active && "text-white",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`portal-active-nav-${instance}`}
                  className="bg-primary absolute inset-0 rounded-lg"
                  transition={{ type: "spring", stiffness: 440, damping: 36 }}
                />
              ) : null}
              <Icon className="relative z-10 size-4 shrink-0" strokeWidth={1.8} />
              {!collapsed ? (
                <span className="relative z-10 min-w-0 flex-1 truncate">
                  {label}
                </span>
              ) : (
                <span className="sr-only">{label}</span>
              )}
              {!collapsed && comingSoon ? (
                <span className="relative z-10 shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[9px] font-bold text-white/45 uppercase">
                  {t("common.comingSoon")}
                </span>
              ) : null}
              <PortalNavBadge segment={route.segment} collapsed={collapsed} />
            </Link>
          )

          return link
        })}
      </div>
    </nav>
  )
}

export function PortalShell({
  children,
  session,
  locale,
  routes,
  profileImageUrl,
}: {
  children: React.ReactNode
  session: SessionClaims
  locale: Locale
  routes: PortalRouteDefinition[]
  profileImageUrl?: string | null
}) {
  const t = useTranslations()
  const rtl = useLocale() === "ar"
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = usePortalSidebarStore((state) => state.collapsed)
  const toggleSidebar = usePortalSidebarStore((state) => state.toggle)

  return (
    <PortalRealtimeProvider>
      <div className="bg-background min-h-svh">
        <PortalPushPermissionBootstrap />

        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-40 hidden flex-col border-e border-white/8 bg-[linear-gradient(180deg,#081a33_0%,#0c2343_100%)] text-white shadow-[24px_0_60px_rgba(7,26,51,0.28)] transition-[width] duration-200 lg:flex",
            collapsed ? "w-[72px]" : "w-[248px]",
          )}
        >
          <div
            className={cn(
              "flex h-[76px] shrink-0 items-center border-b border-white/8",
              collapsed ? "justify-center px-2" : "px-5",
            )}
          >
            <BrandLogo compact={collapsed} inverted={!collapsed} linked />
          </div>
          <div className="h-4 shrink-0" />
          <Navigation routes={routes} collapsed={collapsed} instance="desktop" />
          <span className="sr-only">{session.name}</span>
          <div
            className={cn(
              "flex shrink-0 items-center border-t border-white/8 p-3",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {!collapsed ? (
              <span className="text-[10px] text-slate-500">Buildink 2026</span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-9 text-slate-400 hover:bg-[rgba(23,107,255,0.16)] hover:text-white"
              aria-label={
                collapsed
                  ? t("common.expandSidebar")
                  : t("common.collapseSidebar")
              }
            >
              {collapsed ? (
                <PanelLeftOpen className="rtl:rotate-180" />
              ) : (
                <PanelLeftClose className="rtl:rotate-180" />
              )}
            </Button>
          </div>
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side={rtl ? "right" : "left"}
            className="border-white/8 bg-[linear-gradient(180deg,#081a33_0%,#0c2343_100%)] p-0 text-white"
          >
            <div className="flex h-[76px] items-center border-b border-white/8 px-5">
              <BrandLogo inverted linked />
            </div>
            <div className="h-4 shrink-0" />
            <Navigation
              routes={routes}
              close={() => setMobileOpen(false)}
              instance="mobile"
            />
          </SheetContent>

          <div
            className={cn(
              "min-h-svh transition-[padding] duration-200 lg:ps-[248px]",
              collapsed && "lg:ps-[72px]",
            )}
          >
            <header className="border-line/70 sticky top-0 z-30 flex min-h-[76px] items-center gap-2 border-b bg-white/95 px-3 backdrop-blur sm:gap-3 sm:px-6 lg:px-7">
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="lg:hidden"
                  aria-label={t("common.openMenu")}
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <div className="min-w-0 flex-1">
                <PortalRouteSearch routes={routes} />
              </div>

              <div className="ms-auto flex items-center gap-2">
                <PortalDateRangePicker />
                <PortalLanguageSwitcher />
                <PortalCurrencyIndicator />
                <PortalNotificationMenu />
                <div className="bg-border hidden h-8 w-px sm:block" />
                <PublicUserMenu
                  locale={locale}
                  name={session.name}
                  email={session.email}
                  subtitle={
                    session.primaryAccountType
                      ? t(primaryAccountTypeLabelKeys[session.primaryAccountType])
                      : undefined
                  }
                  dashboardHref="/dashboard/profile"
                  profileImageUrl={profileImageUrl}
                  initials={session.name.slice(0, 2).toUpperCase()}
                  dashboardLabel={t("common.profile")}
                  logoutLabel={t("common.logout")}
                  confirmTitle={t("common.logoutConfirmTitle")}
                  confirmBody={t("common.logoutConfirmBody")}
                  confirmActionLabel={t("common.logoutConfirmAction")}
                  cancelLabel={t("common.cancel")}
                  mobileIconOnly
                  chrome="dashboard"
                />
              </div>
            </header>

            <main
              id="main-content"
              className="min-h-[calc(100vh-76px)] w-full px-4 py-5 sm:px-7 sm:py-7 lg:px-8 xl:px-10"
            >
              <PortalMainContent>{children}</PortalMainContent>
            </main>
          </div>
        </Sheet>
      </div>
    </PortalRealtimeProvider>
  )
}
