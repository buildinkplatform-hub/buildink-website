"use client"

import { Coins } from "lucide-react"

import { Link } from "@/i18n/navigation"

export function PortalCurrencyIndicator() {
  return (
    <Link
      href="/dashboard/settings"
      aria-label="Currency: EUR"
      className="border-line hover:border-line hover:bg-accent hidden h-10 items-center gap-2 rounded-[10px] border bg-white px-4 text-sm font-semibold text-brand-navy transition sm:inline-flex"
    >
      <Coins className="size-4" />
      EUR
    </Link>
  )
}
