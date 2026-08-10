import { ArrowLeft, Construction } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { portalIcons } from "@/features/dashboard/components/portal-icons"
import { Link } from "@/i18n/navigation"
import type { PortalRouteDefinition } from "@/shared/types/platform"

export async function ComingSoonPage({
  route,
}: {
  route: PortalRouteDefinition
}) {
  const t = await getTranslations()
  const Icon = portalIcons[route.segment] ?? Construction
  return (
    <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-3xl place-items-center">
      <Card className="w-full overflow-hidden text-center shadow-[var(--shadow-card)]">
        <div className="h-2 bg-[linear-gradient(90deg,#176BFF,#31B5FF)]" />
        <div className="p-8 sm:p-12">
          <div className="bg-light-blue text-primary mx-auto flex size-16 items-center justify-center rounded-2xl">
            <Icon className="size-8" />
          </div>
          <p className="text-primary mt-6 text-xs font-bold tracking-[0.18em] uppercase">
            {t("common.comingSoon")}
          </p>
          <h1 className="text-brand-navy mt-3 text-3xl font-bold sm:text-4xl">
            {t(route.labelKey)}
          </h1>
          <p className="text-muted mx-auto mt-4 max-w-xl text-lg leading-8">
            {t(route.descriptionKey)}
          </p>
          <p className="text-muted mx-auto mt-3 max-w-xl text-sm leading-6">
            {t("common.comingSoonBody")}
          </p>
          <Button asChild className="mt-8">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("common.returnDashboard")}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
