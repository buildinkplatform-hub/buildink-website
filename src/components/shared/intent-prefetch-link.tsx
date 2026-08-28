"use client"

import * as React from "react"

import { Link, useRouter } from "@/i18n/navigation"

export type IntentPrefetchLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string
  prefetch?: boolean
  prefetchOnRender?: boolean
}

export function IntentPrefetchLink({
  href,
  prefetch = true,
  prefetchOnRender = false,
  onFocus,
  onMouseEnter,
  onPointerDown,
  onTouchStart,
  ...props
}: IntentPrefetchLinkProps) {
  const router = useRouter()
  const prefetchedRef = React.useRef(false)

  const prefetchIntent = React.useCallback(() => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    router.prefetch(href)
  }, [href, router])

  React.useEffect(() => {
    if (!prefetchOnRender) return
    // Warm high-value destinations after the shell becomes interactive rather
    // than competing with the first protected-page render.
    const timeout = window.setTimeout(prefetchIntent, 350)
    return () => window.clearTimeout(timeout)
  }, [prefetchIntent, prefetchOnRender])

  return (
    <Link
      href={href}
      prefetch={prefetch}
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
