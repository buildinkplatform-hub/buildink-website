import { AlertTriangle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"

export async function PortalModuleLoadFallback({
  href = "/dashboard",
}: {
  href?: string
}) {
  const t = await getTranslations("dashboard")

  return (
    <Card className="border-warning/20 bg-warning/5 mx-auto max-w-2xl rounded-[24px] p-6 text-center shadow-sm">
      <AlertTriangle
        className="text-warning mx-auto size-8"
        aria-hidden="true"
      />
      <h1 className="text-brand-navy mt-4 text-xl font-bold">
        {t("portalErrorTitle")}
      </h1>
      <p className="text-muted mt-2 text-sm">{t("portalErrorBody")}</p>
      <Button asChild className="mt-5" variant="secondary">
        <Link href={href}>{t("retry")}</Link>
      </Button>
    </Card>
  )
}
