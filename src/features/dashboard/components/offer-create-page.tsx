import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OfferCreateForm } from "@/features/dashboard/components/marketplace-create"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  getPortalTender,
  listOfferTargets,
  type PortalBootstrap,
  type PortalOfferTarget,
} from "@/features/dashboard/data/portal-client"
import { portalListPath } from "@/features/dashboard/config/portal-routes"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import { Link } from "@/i18n/navigation"

/**
 * Dedicated create route so opening the offer form does not wait for the
 * submitted/received offers board. Tender deep links stay scoped to the
 * selected tender instead of dropping bidder context.
 */
export async function OfferCreatePage({
  bootstrap,
  tenderId,
  tenderTitle,
  tenderCurrency,
  initialTarget,
}: {
  bootstrap: PortalBootstrap | null
  tenderId?: string
  tenderTitle?: string
  tenderCurrency?: string
  initialTarget?: string
}) {
  const t = await getTranslations()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)

  let opportunities: PortalOfferTarget[] = []
  let packages: PortalOfferTarget[] = []
  let lots: PortalOfferTarget[] = []
  let tenders: Array<{
    id: string
    kind: "tender"
    title: string
    currency?: string | null
  }> = []
  let resolvedInitialTarget = initialTarget

  if (tenderId && tenderTitle) {
    // The bidder arrived from an already-rendered authoritative tender detail.
    // Reuse that presentation context so the create form does not re-fetch the
    // same heavy detail payload before it can render. The mutation API remains
    // authoritative and revalidates the tender ID when a draft/offer is saved.
    tenders = [
      {
        id: tenderId,
        kind: "tender",
        title: tenderTitle,
        currency: tenderCurrency ?? null,
      },
    ]
    resolvedInitialTarget = `tender:${tenderId}`
  } else if (tenderId) {
    // Direct/manual deep links still resolve and validate the target server-side.
    const tender = await getPortalTender(tenderId).catch(() => null)
    if (!tender || !tender.eligibleForOffer) notFound()

    tenders = [
      {
        id: tender.id,
        kind: "tender",
        title: tender.title,
        currency: tender.currency,
      },
    ]
    lots = tender.lots.map((lot) => ({
      id: lot.id,
      kind: "lot" as const,
      title: lot.title,
      parentId: tender.id,
      parentTitle: tender.title,
      tenderId: tender.id,
      currency: lot.currency ?? tender.currency,
      reference: lot.reference,
      eligible: true,
    }))

    const scopedTargets = [...tenders, ...lots]
    if (
      !resolvedInitialTarget ||
      !scopedTargets.some(
        (item) => `${item.kind}:${item.id}` === resolvedInitialTarget,
      )
    ) {
      resolvedInitialTarget = `tender:${tender.id}`
    }
  } else {
    const targets = await Promise.all([
      listOfferTargets("opportunity"),
      listOfferTargets("package"),
      listOfferTargets("lot"),
    ])
    opportunities = targets[0].items
    packages = targets[1].items
    lots = targets[2].items

    if (
      resolvedInitialTarget &&
      ![...opportunities, ...packages, ...lots].some(
        (item) => `${item.kind}:${item.id}` === resolvedInitialTarget,
      )
    ) {
      resolvedInitialTarget = undefined
    }
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={t("dashboard.create.offerTitle")}
        description={t("dashboard.descriptions.offers")}
        actions={
          <Button asChild variant="secondary">
            <Link href={portalListPath("offers")}>{t("common.back")}</Link>
          </Button>
        }
      />
      <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <OfferCreateForm
          opportunities={opportunities}
          packages={packages}
          lots={lots}
          tenders={tenders}
          initialTarget={resolvedInitialTarget}
          submitterCompanyId={companyId}
        />
      </Card>
    </div>
  )
}
