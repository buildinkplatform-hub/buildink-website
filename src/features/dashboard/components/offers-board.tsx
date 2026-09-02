import { FileText, ListChecks, Send, Trophy } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { OffersTable } from "@/features/dashboard/components/offers-table"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  OfferDecisionActions,
  OfferWithdrawAction,
} from "@/features/dashboard/components/marketplace-actions"
import { OfferActionsMenu } from "@/features/dashboard/components/offer-actions-menu"
import { OfferDraftEditForm } from "@/features/dashboard/components/offer-draft-edit-form"
import { OfferCreateForm } from "@/features/dashboard/components/marketplace-create"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import { loadOfferCreateTargets } from "@/features/dashboard/lib/offer-create-targets"
import { formatOfferAmount } from "@/features/dashboard/lib/offer-display"
import { canWithdrawOffer } from "@/features/dashboard/lib/offer-withdraw"
import {
  hasAnyPortalPermission,
  resolveEffectivePermissions,
} from "@/features/dashboard/lib/portal-permissions"
import {
  getPortalBootstrap,
  listOfferTargets,
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

type DraftOfferRuntimeFields = PortalOffer & {
  proposedDurationDays?: number | null
  coverMessage?: string | null
}

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

const editableOfferStatuses = new Set(["DRAFT", "CHANGES_REQUESTED"])

function canEditBidderOffer(status: string) {
  return editableOfferStatuses.has(status)
}

function bidderEditLabel(status: string) {
  return status === "CHANGES_REQUESTED" ? "Revise offer" : "Edit draft"
}

export async function OffersBoard({ query = {} }: { query?: OffersQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const permissions = offerPermissions(bootstrap)
  const modules = new Set(bootstrap?.entitlements.modules ?? [])
  const accountType = bootstrap?.profile.primaryAccountType

  const canCreate = hasAnyPortalPermission(permissions, [
    "bids.create",
    "bids.submit",
  ])
  const canEvaluateWorkspace =
    Boolean(companyId) &&
    hasAnyPortalPermission(permissions, ["bids.evaluate", "bids.award"])

  const buyerMode = accountType === "PROJECT_OWNER" || modules.has("projects")

  if (query.action === "create") {
    const { opportunities, packages, lots } =
      await loadOfferCreateTargets(listOfferTargets)
    return (
      <div className="space-y-5">
        <PortalPageHeader
          title={t("dashboard.create.offerTitle")}
          description={t("dashboard.descriptions.offers")}
          actions={
            <Button asChild variant="secondary">
              <Link href={portalListPath("offers")}>{t("common.back")}</Link>
            </Button>
          }
        />
        <Card>
          <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
            <CardTitle>{t("dashboard.create.offerTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.descriptions.offers")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6">
            <OfferCreateForm
              opportunities={opportunities.items}
              packages={packages.items}
              lots={lots.items}
              submitterCompanyId={companyId}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const [submitted, received] = await Promise.all([
    buyerMode ? Promise.resolve({ items: [] }) : listPortalOffers("submitted"),
    buyerMode
      ? companyId
        ? listWorkspaceOffers(companyId)
        : listPortalOffers("received")
      : Promise.resolve({ items: [] }),
  ])

  const mode = buyerMode ? "buyer" : "bidder"
  const items = mode === "buyer" ? received.items : submitted.items
  const selected = query.id
    ? items.find((item) => item.id === query.id)
    : undefined
  const revisions = selected
    ? await listPortalOfferRevisions(selected.id).catch(() => ({ items: [] }))
    : { items: [] }

  if (query.action === "edit" && query.id) {
    if (
      mode !== "bidder" ||
      !selected ||
      !canEditBidderOffer(selected.status)
    ) {
      return (
        <Card className="mx-auto max-w-2xl border-dashed p-6 text-center shadow-none">
          <p className="text-muted-foreground text-sm">
            This offer cannot be edited in its current state.
          </p>
        </Card>
      )
    }
    const draft = selected as DraftOfferRuntimeFields
    return (
      <div className="space-y-5">
        <PortalPageHeader
          eyebrow={selected.reference}
          title={`${bidderEditLabel(selected.status)} · ${selected.targetTitle || selected.title || selected.reference}`}
          description={t("dashboard.descriptions.bidBoard")}
          actions={
            <Button asChild variant="secondary">
              <Link href={portalListPath("offers")}>{t("common.back")}</Link>
            </Button>
          }
        />
        <Card>
          <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
            <CardTitle>{bidderEditLabel(selected.status)}</CardTitle>
            <CardDescription>
              {selected.targetTitle || selected.title || selected.reference}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6">
            <OfferDraftEditForm
              offer={{
                id: draft.id,
                version: draft.version,
                status: draft.status,
                targetTitle: draft.targetTitle,
                title: draft.title,
                reference: draft.reference,
                proposedPriceMinor: draft.proposedPriceMinor,
                currency: draft.currency,
                proposedDurationDays: draft.proposedDurationDays,
                coverMessage: draft.coverMessage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (query.action === "detail" && query.id) {
    if (!selected)
      return (
        <Card className="mx-auto max-w-2xl border-dashed p-6 text-center shadow-none">
          <p className="text-muted-foreground text-sm">
            {t("dashboard.offersEmpty")}
          </p>
        </Card>
      )
    return (
      <OfferDetail
        offer={selected}
        revisions={revisions.items}
        buyer={mode === "buyer"}
        companyId={companyId}
        canEvaluate={canEvaluateWorkspace}
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
    <div className="space-y-5">
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
          canCreate && mode === "bidder" ? (
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
          <Card
            key={String(key)}
            className="group hover:border-primary/15 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] motion-reduce:hover:translate-y-0"
          >
            <CardContent className="flex min-h-[108px] items-start justify-between gap-4 pt-5 sm:pt-5">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-semibold">
                  {t(`dashboard.metric.${key}` as "dashboard.metric.offers")}
                </p>
                <p className="text-brand-navy mt-1.5 text-[1.65rem] leading-8 font-bold tracking-[-0.03em] tabular-nums">
                  {value}
                </p>
              </div>
              <span className="border-primary/10 bg-primary/8 text-primary grid size-10 shrink-0 place-items-center rounded-xl border">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
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
          amount: formatOfferAmount(item, locale),
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
              status={item.status}
              viewHref={portalDetailPath("offers", item.id)}
              editHref={
                mode === "bidder" && canEditBidderOffer(item.status)
                  ? `/dashboard/offers/${item.id}/edit`
                  : undefined
              }
              labels={{
                actions: t("dashboard.table.actions"),
                details: t("dashboard.table.details"),
                editDraft: bidderEditLabel(item.status),
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
  const locale = await getLocale()
  return (
    <div className="space-y-5">
      <PortalPageHeader
        eyebrow={offer.reference}
        title={offer.targetTitle || offer.title || offer.reference}
        actions={
          <div className="flex flex-wrap gap-2">
            {!buyer && canEditBidderOffer(offer.status) ? (
              <Button asChild>
                <Link href={`/dashboard/offers/${offer.id}/edit`}>
                  {bidderEditLabel(offer.status)}
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link href={portalListPath("offers")}>{t("common.back")}</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <EntityDetailFields
              entity="offer"
              data={offer as unknown as Record<string, unknown>}
              labels={(key) =>
                t(`dashboard.${key}` as "dashboard.fields.title")
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
            <CardTitle>
              {buyer
                ? t("dashboard.offers.board.decisionWorkflow")
                : t("dashboard.offers.board.submissionHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6">
            {buyer && companyId && canEvaluate ? (
              <OfferDecisionActions
                companyId={companyId}
                id={offer.id}
                version={offer.version}
                status={offer.status}
                acceptLabel={t("dashboard.marketplace.accept")}
                rejectLabel={t("dashboard.marketplace.reject")}
                requestChangesLabel={t("dashboard.marketplace.requestChanges")}
                shortlistLabel={t("dashboard.marketplace.shortlist")}
              />
            ) : !buyer && canWithdrawOffer(offer.status) ? (
              <OfferWithdrawAction
                id={offer.id}
                version={offer.version}
                label={t("dashboard.marketplace.withdraw")}
              />
            ) : buyer ? (
              <p className="text-muted-foreground text-sm leading-6">
                {t("dashboard.offers.board.receivedDescription")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
          <CardTitle>{t("dashboard.offers.board.revisions")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          <div className="space-y-2">
            {revisions.length ? (
              revisions.map((revision) => (
                <div
                  key={revision.id}
                  className="border-border/90 rounded-xl border bg-slate-50/50 px-4 py-3 text-sm dark:bg-white/[0.02]"
                >
                  #{revision.revisionNo} · {revision.status} ·{" "}
                  {formatOfferAmount(revision, locale)}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("dashboard.offers.board.noRevisions")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
