import { AlertTriangle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"

export async function PortalModuleLoadFallback({
  href = "/dashboard",
}: {
  href?: string
}) {
  const t = await getTranslations("dashboard")

  return (
    <Card className="border-warning/25 bg-warning/[0.025] mx-auto w-full max-w-2xl overflow-hidden">
      <CardContent className="flex items-start gap-4 pt-5 sm:pt-6">
        <span className="border-warning/20 bg-warning/10 text-warning grid size-10 shrink-0 place-items-center rounded-xl border">
          <AlertTriangle className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-brand-navy text-lg font-semibold tracking-[-0.02em]">
            {t("portalErrorTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("portalErrorBody")}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href={href}>{t("retry")}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
