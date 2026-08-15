import { getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import type { PortalCompanyClaim } from "@/features/dashboard/data/portal-client"

export async function CompanyClaimList({
  items,
}: {
  items: PortalCompanyClaim[]
}) {
  const t = await getTranslations()
  if (!items.length) return null
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("dashboard.workspace.claims.title")}
        </h2>
        <p className="text-muted mt-1 text-sm">
          {t("dashboard.workspace.claims.hint")}
        </p>
      </div>
      <ul className="divide-line divide-y">
        {items.map((claim) => (
          <li
            key={claim.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div>
              <p className="text-ink text-sm font-medium">
                {claim.company.name}
              </p>
              <p className="text-muted text-xs">
                {new Date(claim.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge
              status={claim.status}
              label={t(`dashboard.workspace.claims.status.${claim.status}`)}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
