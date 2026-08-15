"use client"

import { ChevronDown, Menu } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { publicNavGroups } from "@/features/public/config/public-site.config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
export function PublicNavigation() {
  const t = useTranslations("publicSite")
  const common = useTranslations("common")

  return (
    <>
      <nav className="hidden items-center gap-2 xl:flex" aria-label={common("primaryNav")}>
        {publicNavGroups.map((group) => (
          <DropdownMenu key={group.key}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-brand-navy hover:bg-light-blue hover:text-primary focus-visible:ring-primary/20 inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all outline-none focus-visible:ring-4"
              >
                {t(group.labelKey)}
                <ChevronDown aria-hidden="true" className="size-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-72 rounded-[24px] p-2">
              <DropdownMenuLabel>{t(group.labelKey)}</DropdownMenuLabel>
              {group.items.map((item) => {
                const label = t(item.labelKey)

                return (
                  <DropdownMenuItem key={item.href} asChild className="px-3 py-3">
                    <Link href={item.href} className="flex w-full items-center justify-between gap-3">
                      <span>{label}</span>
                      <ChevronDown aria-hidden="true" className="-rotate-90 size-4 text-primary/60 rtl:rotate-90" />
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </nav>
      <div className="flex items-center gap-2 xl:hidden">
        <LocaleSwitcher compact />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t("nav.groups.browse")}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader title="Buildink" />
            <div className="space-y-6">
              {publicNavGroups.map((group) => (
                <div key={group.key} className="space-y-3">
                  <p className="text-brand-navy text-xs font-bold uppercase tracking-[0.16em]">
                    {t(group.labelKey)}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="border-line hover:bg-light-blue flex min-h-12 items-center justify-between rounded-2xl border px-4 text-sm font-semibold text-brand-navy transition-colors"
                      >
                        <span>{t(item.labelKey)}</span>
                        <ChevronDown aria-hidden="true" className="-rotate-90 size-4 text-primary/60 rtl:rotate-90" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
