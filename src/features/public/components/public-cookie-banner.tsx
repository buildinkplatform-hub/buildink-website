"use client"

import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

const BANNER_KEY = "buildink_cookie_banner_dismissed"
const PREFERENCES_KEY = "buildink_cookie_preferences"
const subscribe = () => () => undefined

export function PublicCookieBanner({
  title,
  body,
  acceptLabel,
  rejectLabel,
  manageLabel,
}: {
  title: string
  body: string
  acceptLabel: string
  rejectLabel: string
  manageLabel: string
}) {
  const [dismissed, setDismissed] = useState(false)
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const open =
    hydrated && !dismissed && !window.localStorage.getItem(BANNER_KEY)

  if (!open) return null

  const saveConsent = (value: "accepted" | "rejected", enabled: boolean) => {
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        preferences: enabled,
        analytics: enabled,
        marketing: enabled,
      }),
    )
    window.localStorage.setItem(BANNER_KEY, value)
    setDismissed(true)
  }

  const dismissAsManaged = () => {
    window.localStorage.setItem(BANNER_KEY, "managed")
    setDismissed(true)
  }

  return (
    <div
      className="border-brand-navy/10 fixed inset-x-3 bottom-3 z-50 mx-auto max-h-[calc(100svh-1.5rem)] max-w-5xl overflow-y-auto rounded-3xl border bg-white p-4 shadow-[var(--shadow-card)] sm:inset-x-4 sm:bottom-4 sm:p-5"
      role="region"
      aria-label={title}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-brand-navy text-sm font-bold">{title}</p>
          <p className="text-muted mt-1 text-sm leading-6">{body}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            variant="secondary"
            onClick={() => saveConsent("rejected", false)}
          >
            {rejectLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => saveConsent("accepted", true)}
          >
            {acceptLabel}
          </Button>
          <Button asChild variant="outline">
            <Link href="/cookies#cookie-preferences" onClick={dismissAsManaged}>
              {manageLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
