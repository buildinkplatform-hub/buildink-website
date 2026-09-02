"use client"

import * as React from "react"

import { Link } from "@/i18n/navigation"

export type IntentPrefetchLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string
  prefetch?: boolean | null
  prefetchOnRender?: boolean
}

export function IntentPrefetchLink({
  href,
  prefetch,
  prefetchOnRender = false,
  onFocus,
  onMouseEnter,
  onPointerDown,
  onTouchStart,
  ...props
}: IntentPrefetchLinkProps) {
  const [intentActive, setIntentActive] = React.useState(prefetchOnRender)

  const prefetchIntent = React.useCallback(() => {
    setIntentActive(true)
  }, [])

  React.useEffect(() => {
    if (!prefetchOnRender) return
    const timeout = window.setTimeout(prefetchIntent, 350)
    return () => window.clearTimeout(timeout)
  }, [prefetchIntent, prefetchOnRender])

  // Avoid viewport-wide protected-route prefetching. On real user intent,
  // restore Next.js automatic prefetch behavior so dynamic routes use the
  // nearest loading boundary and warm only the reusable shell.
  const resolvedPrefetch =
    prefetch !== undefined ? prefetch : intentActive ? null : false

  return (
    <Link
      href={href}
      prefetch={resolvedPrefetch}
      onFocus={(event) => {
        prefetchIntent()
        onFocus?.(event)
      }}
      onMouseEnter={(event) => {
        prefetchIntent()
        onMouseEnter?.(event)
      }}
      onPointerDown={(event) => {
        prefetchIntent()
        onPointerDown?.(event)
      }}
      onTouchStart={(event) => {
        prefetchIntent()
        onTouchStart?.(event)
      }}
      {...props}
    />
  )
}
