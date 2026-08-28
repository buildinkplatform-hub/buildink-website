"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PortalDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("dashboard")

  useEffect(() => {
    console.error("Portal route failed", error)
  }, [error])

  return (
    <Card
      className="border-destructive/25 mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center p-6 text-center shadow-sm sm:p-10"
      role="alert"
      aria-live="assertive"
    >
      <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </span>
      <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-[0.16em] uppercase">
        Workspace unavailable
      </p>
      <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight">
        {t("portalErrorTitle")}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
        {t("portalErrorBody")}
      </p>
      {error.digest ? (
        <p className="bg-muted text-muted-foreground mt-4 rounded-lg px-3 py-1.5 font-mono text-xs">
          {t("portalErrorReference", { reference: error.digest })}
        </p>
      ) : null}
      <Button className="mt-6" onClick={reset}>
        <RefreshCcw className="size-4" /> {t("retry")}
      </Button>
    </Card>
  )
}
