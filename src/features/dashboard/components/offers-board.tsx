import { FileText, ListChecks, Send, Trophy } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OffersTable } from "@/features/dashboard/components/offers-table"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  OfferDecisionActions,
  OfferWithdrawAction,
} from "@/features/dashboard/components/marketplace-actions"
import { OfferActionsMenu } from "@/features/dashboard/components/offer-actions-menu"
import { OfferCreateForm } from "@/features/dashboard/components/marketplace-create"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { BidLevelingTable } from "@/features/dashboard/components/bid-board-forms"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import {
  hasAnyPortalPermission,
  resolveEffectivePermissions,
} from "@/features/dashboard/lib/portal-permissions"
import {
  getPortalBootstrap,
  listOfferTargets,
  listPortalBidLeveling,
  listPortalOfferRevisions,
  listPortalOffers,
  listWorkspaceOffers,
  type PortalOffer,
} from "@/features/dashboard/data/portal-client"
import {
  portalDetailPath,
  portalListPath,
  type PortalPageAction,
} from "@/features/dashboard/config/portal-routes"
import { Link } from "@/i18n/navigation"

type OffersQuery = { action?: PortalPageAction; id?: string }

function offerPermissions(
  bootstrap: Awaited<ReturnType<typeof getPortalBootstrap>>,
) {
  return resolveEffectivePermissions({
    permissions: bootstrap?.entitlements.permissions ?? [],
    hasActiveWorkspace: Boolean(bootstrap?.activeWorkspace),
    personalPermissions: [
      "bids.view",
      "bids.create",
      "bids.submit",
      "bids.withdraw",
    ],
  })
}

function amount(offer: PortalOffer, locale: string) {
  const minor = offer.totalPriceMinor ?? offer.proposedPriceMinor
  if (!minor) return "-"
  const value = Number(minor) / 100
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: offer.currency ?? "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

const offerStatuses = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "SHORTLISTED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
] as const

export async function OffersBoard({ query = {} }: { query?: OffersQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const permissions = offerPermissions(bootstrap)
  const canCreate = hasAnyPortalPermission(permissions, [
    "bids.create",
    "bids.submit",
  ])
  const canEvaluate =
    Boolean(companyId) &&
    hasAnyPortalPermission(permissions, ["bids.evaluate", "bids.award"])
  const [submitted, received, opportunities, packages, lots] =
    await Promise.all([
      listPortalOffers("submitted"),
      canEvaluate && companyId
        ? listWorkspaceOffers(companyId)
        : Promise.resolve({ items: [] }),
      listOfferTargets("opportunity"),
      listOfferTargets("package"),
      listOfferTargets("lot"),
    ])

  if (query.action === "create") {
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
            opportunities={opportunities.items}
            packages={packages.items}
            lots={lots.items}
            submitterCompanyId={companyId}
          />
        </Card>
      </div>
    )
  }

  const mode = canEvaluate ? "buyer" : "bidder"
  const items = mode === "buyer" ? received.items : submitted.items
  const selected = query.id
    ? items.find((item) => item.id === query.id)
    : undefined
  const revisions = selected
    ? await listPortalOfferRevisions(selected.id)
    : { items: [] }
  const targetId = selected ? undefined : undefined
  const leveling =
    mode === "buyer" && targetId
      ? await listPortalBidLeveling(targetId)
      : { items: [] }

  if (query.action === "detail" && query.id) {
    if (!selected)
      return (
        <Card className="text-muted p-8 text-sm">
          {t("dashboard.offersEmpty")}
        </Card>
      )
    return (
      <OfferDetail
        offer={selected}
        revisions={revisions.items}
        buyer={mode === "buyer"}
        companyId={companyId}
        canEvaluate={canEvaluate}
      />
    )
  }

  const stats: Array<[string, number, typeof FileText]> =
    mode === "buyer"
      ? [
          ["receivedOffers", items.length, FileText],
          [
            "shortlistedReceivedOffers",
            items.filter((item) => item.status === "SHORTLISTED").length,
            ListChecks,
          ],
          [
            "wonOffers",
            items.filter((item) => item.status === "ACCEPTED").length,
            Trophy,
          ],
        ]
      : [
          [
            "draftOffers",
            items.filter((item) => item.status === "DRAFT").length,
            FileText,
          ],
          [
            "submittedOffers",
            items.filter((item) => item.status === "SUBMITTED").length,
            Send,
          ],
          [
            "shortlistedOffers",
            items.filter((item) => item.status === "SHORTLISTED").length,
            Trophy,
          ],
        ]
  const statusLabels = Object.fromEntries(
    offerStatuses.map((status) => [
      status,
      t(`dashboard.offers.statuses.${status}`),
    ]),
  )
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={
          mode === "buyer"
            ? t("dashboard.offers.board.receivedTitle")
            : t("dashboard.nav.offers")
        }
        description={
          mode === "buyer"
            ? t("dashboard.offers.board.receivedDescription")
            : t("dashboard.descriptions.bidBoard")
        }
        actions={
          canCreate ? (
            <Button asChild>
              <Link href="/dashboard/offers/create">
                {t("dashboard.create.offerTitle")}
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(([key, value, Icon]) => (
          <Card key={String(key)} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">
                {t(`dashboard.metric.${key}` as "dashboard.metric.offers")}
              </p>
              <Icon className="text-primary size-5" />
            </div>
            <p className="text-brand-navy mt-3 text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>
      {leveling.items.length ? (
        <Card className="p-5">
          <BidLevelingTable rows={leveling.items} />
        </Card>
      ) : null}
      <OffersTable
        empty={t("dashboard.offersEmpty")}
        offerLabel={t("dashboard.offers.board.offer")}
        amountLabel={t("dashboard.offers.board.amount")}
        labels={{
          search: t("dashboard.table.search"),
          status: t("dashboard.table.status"),
          allStatuses: t("dashboard.table.allStatuses"),
          sort: t("dashboard.table.sort"),
          newest: t("dashboard.table.newest"),
          titleAsc: t("dashboard.table.titleAsc"),
          details: t("dashboard.table.details"),
          actions: t("dashboard.table.actions"),
          previous: t("dashboard.table.previous"),
          next: t("dashboard.table.next"),
          showing: t("dashboard.table.showing"),
          reference: t("dashboard.offers.board.reference"),
          direction: t("dashboard.offers.board.direction"),
          submitted: t("dashboard.offers.board.submitted"),
          revisions: t("dashboard.offers.board.revisions"),
          totalRecords: t("dashboard.offers.board.totalRecords"),
          rows: t("dashboard.offers.board.rows"),
          statusLabels,
        }}
        rows={items.map((item) => ({
          id: item.id,
          title: item.targetTitle || item.title || item.reference,
          secondary: item.targetTitle ? item.title : null,
          reference: item.reference,
          inbox: t(
            `dashboard.offers.board.inbox.${item.inbox}` as "dashboard.offers.board.inbox.submitted",
          ),
          amount: amount(item, locale),
          submitted: item.submittedAt
            ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                new Date(item.submittedAt),
              )
            : t("dashboard.offers.board.notSubmitted"),
          revisions: item.revisionCount,
          status: item.status,
          statusLabel:
            statusLabels[item.status] ?? item.status.replaceAll("_", " "),
          statuses: [item.status],
          actions: (
            <OfferActionsMenu
              mode={mode}
              companyId={companyId}
              id={item.id}
              version={item.version}
              viewHref={portalDetailPath("offers", item.id)}
              labels={{
                actions: t("dashboard.table.actions"),
                details: t("dashboard.table.details"),
                accept: t("dashboard.marketplace.accept"),
                reject: t("dashboard.marketplace.reject"),
                requestChanges: t("dashboard.marketplace.requestChanges"),
                shortlist: t("dashboard.marketplace.shortlist"),
                withdraw: t("dashboard.marketplace.withdraw"),
                cancel: t("common.cancel"),
              }}
            />
          ),
        }))}
      />
    </div>
  )
}

async function OfferDetail({
  offer,
  revisions,
  buyer,
  companyId,
  canEvaluate,
}: {
  offer: PortalOffer
  revisions: Awaited<ReturnType<typeof listPortalOfferRevisions>>["items"]
  buyer: boolean
  companyId?: string
  canEvaluate: boolean
}) {
  const t = await getTranslations()
  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={offer.reference}
        title={offer.targetTitle || offer.title || offer.reference}
        actions={
          <Button asChild variant="secondary">
            <Link href={portalListPath("offers")}>{t("common.back")}</Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="p-6">
          <EntityDetailFields
            entity="offer"
            data={offer as unknown as Record<string, unknown>}
            labels={(key) => key}
          />
        </Card>
        <Card className="p-6">
          <h2 className="text-brand-navy font-semibold">
            {buyer
              ? t("dashboard.offers.board.decisionWorkflow")
              : t("dashboard.offers.board.submissionHistory")}
          </h2>
          {buyer && companyId && canEvaluate ? (
            <OfferDecisionActions
              companyId={companyId}
              id={offer.id}
              version={offer.version}
              acceptLabel={t("dashboard.marketplace.accept")}
              rejectLabel={t("dashboard.marketplace.reject")}
              requestChangesLabel={t("dashboard.marketplace.requestChanges")}
              shortlistLabel={t("dashboard.marketplace.shortlist")}
            />
          ) : !buyer ? (
            <OfferWithdrawAction
              id={offer.id}
              version={offer.version}
              label={t("dashboard.marketplace.withdraw")}
            />
          ) : null}
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="text-brand-navy font-semibold">
          {t("dashboard.offers.board.revisions")}
        </h2>
        <div className="mt-4 space-y-3">
          {revisions.length ? (
            revisions.map((revision) => (
              <div
                key={revision.id}
                className="border-line rounded-xl border p-3 text-sm"
              >
                #{revision.revisionNo} · {revision.status} ·{" "}
                {revision.totalPriceMinor ?? revision.proposedPriceMinor}{" "}
                {revision.currency}
              </div>
            ))
          ) : (
            <p className="text-muted text-sm">
              {t("dashboard.offers.board.noRevisions")}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
