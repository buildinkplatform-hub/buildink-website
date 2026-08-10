"use client"

import { RefreshCw, WifiOff } from "lucide-react"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <main className="bg-canvas grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-md">
        <BrandLogo className="mx-auto" />
        <div className="bg-light-blue text-primary mx-auto mt-10 flex size-16 items-center justify-center rounded-2xl">
          <WifiOff className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-brand-navy mt-6 text-3xl font-bold">
          Sei offline / You are offline / أنت غير متصل
        </h1>
        <p className="text-muted mt-4 leading-7">
          Reconnect and try again. Private account responses are never stored
          for offline use.
        </p>
        <Button className="mt-8" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      </div>
    </main>
  )
}
