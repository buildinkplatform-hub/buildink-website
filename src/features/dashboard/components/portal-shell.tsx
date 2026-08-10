"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { BrandLogo } from "@/components/shared/brand-logo"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/actions/auth.actions"
import { portalIcons } from "@/features/dashboard/components/portal-icons"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import { profileTypeLabelKeys } from "@/shared/constants/platform"
import type {
  Locale,
  PortalRouteDefinition,
  SessionClaims,
} from "@/shared/types/platform"

function Navigation({
  routes,
  close,
}: {
  routes: PortalRouteDefinition[]
  close?: () => void
}) {
  const t = useTranslations()
  const pathname = usePathname()
  const links = [
    { segment: "", labelKey: "common.dashboard", state: "active" as const },
    ...routes,
  ]
  return (
    <nav className="space-y-1" aria-label="Portal">
      {links.map((route) => {
        const href = route.segment
          ? `/dashboard/${route.segment}`
          : "/dashboard"
        const active = route.segment
          ? pathname.endsWith(`/dashboard/${route.segment}`)
          : /\/dashboard\/?$/.test(pathname)
        const Icon = portalIcons[route.segment || "dashboard"]
        return (
          <Link
            key={route.segment || "dashboard"}
            href={href}
            onClick={close}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
              active
                ? "bg-primary text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t(route.labelKey)}</span>
            {route.state === "coming-soon" ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  active ? "bg-white/15" : "bg-white/8 text-white/45",
                )}
              >
                {t("common.comingSoon")}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

export function PortalShell({
  children,
  session,
  locale,
  routes,
}: {
  children: React.ReactNode
  session: SessionClaims
  locale: Locale
  routes: PortalRouteDefinition[]
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-canvas min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="bg-brand-navy hidden min-h-screen p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link href="/" className="rounded-xl bg-white p-2">
          <BrandLogo />
        </Link>
        <div className="mt-7 flex-1 overflow-y-auto">
          <Navigation routes={routes} />
        </div>
        <div className="mt-5 border-t border-white/10 pt-5 text-xs text-white/45">
          {t(profileTypeLabelKeys[session.profileType])}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-line sticky top-0 z-30 flex min-h-18 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur sm:px-7">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="lg:hidden"
                aria-label={t("common.openMenu")}
              >
                <Menu className="size-5" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-brand-navy/45 fixed inset-0 z-50 backdrop-blur-sm" />
              <Dialog.Content className="bg-brand-navy fixed inset-y-0 start-0 z-50 w-[min(88vw,310px)] overflow-y-auto p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-white p-2">
                    <BrandLogo />
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="flex size-11 items-center justify-center rounded-xl bg-white/10"
                      aria-label={t("common.closeMenu")}
                    >
                      <X className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="mt-7">
                  <Navigation routes={routes} close={() => setOpen(false)} />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <div className="ms-auto flex items-center gap-2">
            <LocaleSwitcher compact />
            <Button asChild size="icon" variant="secondary">
              <Link
                href="/dashboard/notifications"
                aria-label={t("common.notifications")}
              >
                <Bell className="size-5" />
              </Link>
            </Button>
            <div className="border-line hidden items-center gap-3 rounded-xl border px-3 py-1.5 sm:flex">
              <div className="bg-light-blue text-primary flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {session.name.slice(0, 1)}
              </div>
              <div className="max-w-36">
                <p className="text-brand-navy truncate text-xs font-bold">
                  {session.name}
                </p>
                <p className="text-muted ltr-content truncate text-[10px]">
                  {session.email}
                </p>
              </div>
              <ChevronDown className="text-muted size-4" />
            </div>
            <form action={logoutAction.bind(null, locale)}>
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                aria-label={t("common.logout")}
              >
                <LogOut className="size-5" />
              </Button>
            </form>
          </div>
        </header>
        <main id="main-content" className="p-4 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  )
}
