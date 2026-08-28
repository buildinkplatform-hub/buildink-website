"use client"

import { RefreshCw, ShieldCheck, WifiOff } from "lucide-react"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <main className="bg-background relative grid min-h-svh place-items-center overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_50%_0%,rgb(245_158_11/0.12),transparent_34rem)]" />
      <section className="surface-panel relative w-full max-w-2xl overflow-hidden rounded-[2rem] p-6 text-center shadow-[var(--shadow-floating)] sm:p-10">
        <BrandLogo className="mx-auto" />
        <span className="border-warning/15 bg-warning/8 text-warning mx-auto mt-8 grid size-14 place-items-center rounded-2xl border">
          <WifiOff className="size-6" aria-hidden="true" />
        </span>
        <p className="text-warning mt-5 text-xs font-bold tracking-[0.16em] uppercase">
          Connection unavailable
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Sei offline / You are offline / أنت غير متصل
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-sm leading-7 sm:text-base">
          Reconnect and try again. Private account responses are never stored
          for offline use.
        </p>
        <div className="border-border/80 bg-muted/25 mx-auto mt-6 flex max-w-lg items-start gap-3 rounded-2xl border p-4 text-start">
          <span className="bg-card text-primary grid size-9 shrink-0 place-items-center rounded-xl shadow-xs">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-foreground text-xs font-semibold">
              Your account data remains private
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              Buildink does not cache authenticated API responses for offline
              viewing. Reconnecting restores the latest data from the service.
            </p>
          </div>
        </div>
        <Button className="mt-7" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      </section>
    </main>
  )
}
