"use client"

import { ChevronDown, Menu, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Suspense } from "react"

import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { publicNavGroups } from "@/features/public/config/public-site.config"
import { Link } from "@/i18n/navigation"

export function PublicNavigation() {
  const t = useTranslations("publicSite")
  const common = useTranslations("common")
  const searchLabel = t("nav.items.search")

  return (
    <>
      <nav
        className="hidden min-w-0 items-center gap-1.5 xl:flex"
        aria-label={common("primaryNav")}
      >
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="border-line/70 me-1 size-10 min-h-10 rounded-xl bg-white/70 shadow-none"
        >
          <Link href="/search" aria-label={searchLabel} title={searchLabel}>
            <Search className="size-4" />
          </Link>
        </Button>
        {publicNavGroups.map((group) => (
          <DropdownMenu key={group.key}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-brand-navy hover:bg-light-blue/80 hover:text-primary focus-visible:ring-primary/15 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-transparent px-3.5 text-sm font-semibold transition-[background-color,color,box-shadow] outline-none focus-visible:ring-4"
              >
                {t(group.labelKey)}
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 opacity-60"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="border-line/70 min-w-72 rounded-2xl bg-white/96 p-2 shadow-[var(--shadow-floating)] backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-muted px-3 py-2 text-[11px] font-bold tracking-[0.16em] uppercase">
                {t(group.labelKey)}
              </DropdownMenuLabel>
              {group.items.map((item) => {
                const label = t(item.labelKey)

                return (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className="focus:bg-light-blue rounded-xl px-3 py-3"
                  >
                    <Link
                      href={item.href}
                      className="flex w-full items-center justify-between gap-3 font-medium"
                    >
                      <span>{label}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="text-primary/55 size-4 -rotate-90 rtl:rotate-90"
                      />
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </nav>

      <div className="flex items-center gap-2 xl:hidden">
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="size-10 min-h-10 rounded-xl bg-white/75 shadow-none"
        >
          <Link href="/search" aria-label={searchLabel}>
            <Search className="size-4" />
          </Link>
        </Button>
        <Suspense fallback={null}>
          <LocaleSwitcher compact />
        </Suspense>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-10 min-h-10 rounded-xl bg-white/75 shadow-none"
              aria-label={t("nav.groups.browse")}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-line/70 bg-white/98 p-0">
            <SheetHeader
              title="Buildink"
              className="border-line border-b px-5 py-5"
            />
            <div className="max-h-[calc(100svh-80px)] space-y-7 overflow-y-auto px-5 py-6">
              {publicNavGroups.map((group) => (
                <div key={group.key} className="space-y-3">
                  <p className="text-muted text-[11px] font-bold tracking-[0.16em] uppercase">
                    {t(group.labelKey)}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="border-line/70 hover:border-primary/15 hover:bg-light-blue text-brand-navy flex min-h-12 items-center justify-between rounded-xl border bg-white px-4 text-sm font-semibold shadow-[var(--shadow-xs)] transition-colors"
                      >
                        <span>{t(item.labelKey)}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className="text-primary/60 size-4 -rotate-90 rtl:rotate-90"
                        />
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
