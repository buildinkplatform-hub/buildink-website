"use client"

import * as React from "react"

export default function PortalSectionLoading() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), 250)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading portal page"
    >
      <div className="bg-primary h-full w-1/3 animate-pulse rounded-full" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
