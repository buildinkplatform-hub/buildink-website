"use client"

import { useIsFetching, useIsMutating } from "@tanstack/react-query"

import { usePortalNavigationStore } from "@/stores/portal-navigation-store"

export function PortalHeaderActivityBar() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const navigationPending = usePortalNavigationStore((state) => state.pending)
  const active = navigationPending || fetching > 0 || mutating > 0

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="bg-primary/10 pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
    >
      <div className="loader-progress bg-primary h-full w-1/3 rounded-full" />
    </div>
  )
}
