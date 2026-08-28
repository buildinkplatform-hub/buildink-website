"use client"

import * as React from "react"

import { PortalRouteSkeleton } from "@/features/dashboard/components/portal-route-skeleton"

export default function PortalDynamicRouteLoading() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    // Prefetched/cached routes normally complete before this threshold. Delaying
    // the skeleton prevents a distracting flash on every protected navigation,
    // while genuinely cold routes still get an explicit loading state.
    const timeout = window.setTimeout(() => setVisible(true), 180)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!visible) return null
  return <PortalRouteSkeleton />
}
