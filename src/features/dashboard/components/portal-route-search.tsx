"use client"

import { CornerDownLeft, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { portalIcons } from "@/features/dashboard/components/portal-icons"
import { usePortalNavigationStore } from "@/stores/portal-navigation-store"
import type { PortalRouteDefinition } from "@/shared/types/platform"
import { useRouter } from "@/i18n/navigation"

export function PortalRouteSearch({
  routes,
}: {
  routes: PortalRouteDefinition[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const startNavigation = usePortalNavigationStore((state) => state.start)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const items = useMemo(() => {
    const base = [
      {
        segment: "",
        href: "/dashboard",
        label: t("common.dashboard"),
        description: t("dashboard.subtitle"),
      },
      ...routes.map((route) => ({
        segment: route.segment,
        href: `/dashboard/${route.segment}`,
        label: t(route.labelKey),
        description: t(route.descriptionKey),
      })),
    ]
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return base
    return base.filter((item) =>
      `${item.label} ${item.description} ${item.href}`
        .toLocaleLowerCase()
        .includes(normalized),
    )
  }, [query, routes, t])

  function navigate(href: string) {
    setOpen(false)
    setQuery("")
    startNavigation()
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-primary/10 bg-card text-foreground hover:border-primary/25 hover:bg-primary/[0.025] focus-visible:ring-primary/15 flex size-11 shrink-0 items-center justify-center rounded-[10px] border text-start text-sm shadow-[var(--shadow-xs)] transition-[border-color,background-color,box-shadow] focus-visible:ring-2 focus-visible:outline-none sm:h-10 sm:w-full sm:max-w-[460px] sm:justify-start sm:gap-2.5 sm:px-2.5"
        aria-label="Search dashboard pages"
      >
        <span className="bg-primary/[0.08] text-primary grid size-7 shrink-0 place-items-center rounded-lg">
          <Search className="size-4" strokeWidth={2.1} />
        </span>
        <span className="text-muted-foreground hidden min-w-0 flex-1 truncate sm:block">
          Search dashboard pages...
        </span>
        <kbd className="border-primary/10 bg-primary/[0.04] text-primary hidden rounded-md border px-1.5 py-0.5 text-[10px] font-semibold md:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-primary/10 top-[8%] w-[calc(100vw-1.5rem)] max-w-xl translate-y-0 overflow-hidden p-0 shadow-[var(--shadow-floating)] sm:top-[12%]">
          <DialogHeader className="sr-only">
            <DialogTitle>Search dashboard pages</DialogTitle>
            <DialogDescription>
              Navigate quickly between dashboard pages.
            </DialogDescription>
          </DialogHeader>
          <div className="border-primary/10 bg-primary/[0.02] focus-within:bg-primary/[0.035] flex items-center gap-3 border-b px-4 transition-colors">
            <span className="bg-primary/[0.08] text-primary grid size-8 shrink-0 place-items-center rounded-lg">
              <Search className="size-4" strokeWidth={2.1} />
            </span>
            <Input
              aria-label="Search dashboard pages"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dashboard pages..."
              className="h-14 rounded-none border-0 bg-transparent px-0 shadow-none focus:border-transparent focus:ring-0 focus-visible:ring-0"
            />
          </div>
          <div className="portal-scrollbar max-h-[min(60vh,440px)] overflow-y-auto p-2">
            {items.length ? (
              items.map((item) => {
                const Icon =
                  portalIcons[item.segment || "dashboard"] ??
                  portalIcons.dashboard
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="hover:bg-primary/[0.045] focus-visible:ring-primary/15 flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="border-primary/10 bg-primary/[0.07] text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-brand-navy block truncate text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                        {item.description}
                      </span>
                    </span>
                    <CornerDownLeft className="text-primary/60 size-4 shrink-0" />
                  </button>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <span className="border-primary/10 bg-primary/[0.06] text-primary mx-auto mb-3 grid size-10 place-items-center rounded-xl border">
                  <Search className="size-4" />
                </span>
                <p className="text-muted-foreground text-sm">
                  No matching pages found.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
