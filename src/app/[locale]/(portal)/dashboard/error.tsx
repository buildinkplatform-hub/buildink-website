"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PortalDashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const t = useTranslations("dashboard")

  useEffect(() => {
    console.error("Portal route failed", error)
  }, [error])

  return (
    <Card
      className="border-danger/25 mx-auto max-w-2xl p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle
        className="text-danger mx-auto size-9"
        aria-hidden="true"
      />
      <h1 className="text-brand-navy mt-4 text-2xl font-bold">
        {t("portalErrorTitle")}
      </h1>
      <p className="text-muted mt-2 text-sm">{t("portalErrorBody")}</p>
      {error.digest ? (
        <p className="text-muted mt-3 font-mono text-xs">
          {t("portalErrorReference", { reference: error.digest })}
        </p>
      ) : null}
      <Button className="mt-6" onClick={retry}>
        {t("retry")}
      </Button>
    </Card>
  )
}
