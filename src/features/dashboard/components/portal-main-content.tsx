"use client"

import { useEffect } from "react"

import { PortalPageSkeleton } from "@/components/shared/page-skeletons"
import { usePathname } from "@/i18n/navigation"
import { usePortalNavigationStore } from "@/stores/portal-navigation-store"

export function PortalMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pending = usePortalNavigationStore((state) => state.pending)
  const finish = usePortalNavigationStore((state) => state.finish)

  useEffect(() => {
    finish()
  }, [pathname, finish])

  return pending ? (
    <PortalPageSkeleton />
  ) : (
    <div className="mx-auto w-full max-w-[1380px]">{children}</div>
  )
}
