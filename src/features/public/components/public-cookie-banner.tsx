"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

const KEY = "buildink_cookie_banner_dismissed"

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
  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" && !window.localStorage.getItem(KEY),
  )

  if (!open) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-5xl rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-brand-navy text-sm font-bold">{title}</p>
          <p className="text-muted mt-1 text-sm leading-6">{body}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => {
              window.localStorage.setItem(KEY, "managed")
              setOpen(false)
            }}
          >
            {manageLabel}
          </Button>
          <Button
            onClick={() => {
              window.localStorage.setItem(KEY, "accepted")
              setOpen(false)
            }}
          >
            {acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
