"use client"

import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

const KEY = "buildink_cookie_banner_dismissed"
const subscribe = () => () => undefined

export function PublicCookieBanner({
  title,
  body,
  acceptLabel,
  manageLabel,
}: {
  title: string
  body: string
  acceptLabel: string
  manageLabel: string
}) {
  const [dismissed, setDismissed] = useState(false)
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const open = hydrated && !dismissed && !window.localStorage.getItem(KEY)

  if (!open) return null

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
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => {
              window.localStorage.setItem(KEY, "managed")
              setDismissed(true)
            }}
          >
            {manageLabel}
          </Button>
          <Button
            onClick={() => {
              window.localStorage.setItem(KEY, "accepted")
              setDismissed(true)
            }}
          >
            {acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
