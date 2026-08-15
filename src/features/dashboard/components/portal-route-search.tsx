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
        className="border-line text-muted hover:border-line focus-visible:ring-primary/12 flex size-11 shrink-0 items-center justify-center rounded-[10px] border bg-[#F8FAFC] text-start text-sm transition hover:bg-accent focus-visible:ring-2 focus-visible:outline-none sm:h-10 sm:w-full sm:max-w-[460px] sm:justify-start sm:gap-2.5 sm:px-3.5"
        aria-label="Search dashboard pages"
      >
        <Search className="size-4" />
        <span className="hidden min-w-0 flex-1 truncate sm:block">
          Search dashboard pages...
        </span>
        <kbd className="hidden rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 md:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[8%] w-[calc(100vw-1.5rem)] max-w-xl translate-y-0 p-0 sm:top-[12%]">
          <DialogHeader className="sr-only">
            <DialogTitle>Search dashboard pages</DialogTitle>
            <DialogDescription>
              Navigate quickly between dashboard pages.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b px-4 focus-within:border-primary/30 focus-within:bg-accent/45">
            <Search className="text-muted size-5" />
            <Input
              aria-label="Search dashboard pages"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dashboard pages..."
              className="h-14 rounded-none border-0 bg-transparent px-0 shadow-none focus:border-transparent focus:ring-0 focus-visible:ring-0"
            />
          </div>
          <div className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
            {items.length ? (
              items.map((item) => {
                const Icon =
                  portalIcons[item.segment || "dashboard"] ?? portalIcons.dashboard
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="hover:bg-accent focus-visible:ring-primary/12 flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="bg-primary/8 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-brand-navy block truncate text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="text-muted mt-0.5 block truncate text-xs">
                        {item.description}
                      </span>
                    </span>
                    <CornerDownLeft className="text-muted size-4" />
                  </button>
                )
              })
            ) : (
              <div className="text-muted p-8 text-center text-sm">
                No matching pages found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
