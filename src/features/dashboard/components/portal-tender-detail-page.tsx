import { Suspense } from "react"
import { ArrowLeft, FileText } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BidLevelingTable } from "@/features/dashboard/components/bid-board-forms"
import { DocumentLink } from "@/features/dashboard/components/document-link"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { PortalInlineAlert } from "@/features/dashboard/components/portal-form-layout"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import { TenderCollaboration } from "@/features/dashboard/components/tender-collaboration"
import { TenderLifecycleActions } from "@/features/dashboard/components/tender-lifecycle-actions"
import {
  getPortalBootstrap,
  getPortalTender,
  getTenderCollaboration,
  listPortalBidLeveling,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import {
  hasAnyPortalPermission,
  resolveEffectivePermissions,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"
import {
  portalEditPath,
  portalListPath,
} from "@/features/dashboard/config/portal-routes"
import { Link } from "@/i18n/navigation"

const tenderPermissions: readonly CompanyPermission[] = [
  "tenders.view",
  "tenders.create",
  "tenders.edit",
  "tenders.publish",
]

function effectiveTenderPermissions(
  bootstrap: Awaited<ReturnType<typeof getPortalBootstrap>>,
) {
  return resolveEffectivePermissions({
    permissions: bootstrap?.entitlements.permissions ?? [],
    hasActiveWorkspace: Boolean(bootstrap?.activeWorkspace),
    personalPermissions: tenderPermissions,
  })
}

async function TenderCollaborationSection({
  id,
  companyId,
}: {
  id: string
  companyId?: string
}) {
  const collaboration = await getTenderCollaboration(id).catch(() => null)
  if (!collaboration) return null
  return (
    <TenderCollaboration collaboration={collaboration} companyId={companyId} />
  )
}

export async function PortalTenderDetailPage({
  id,
  page = 1,
}: {
  id: string
  page?: number
}) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const detail = await getPortalTender(id, page).catch(() => null)

  if (!detail) {
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          title={t("dashboard.nav.tenders")}
          description={t("dashboard.descriptions.tenders")}
          breadcrumbs={[
            { label: t("common.dashboard"), href: "/dashboard" },
            {
              label: t("dashboard.nav.tenders"),
              href: portalListPath("tenders"),
            },
          ]}
        />
        <Card className="border-dashed p-6">
          <p className="text-muted-foreground text-sm">
            {t("dashboard.bootstrapUnavailable")}
          </p>
        </Card>
      </div>
    )
  }

  const canManage = Boolean(
    bootstrap &&
    (detail.createdById === bootstrap.profile.id ||
      (detail.organizationCompanyId != null &&
        bootstrap.workspaces.some(
          (workspace) => workspace.companyId === detail.organizationCompanyId,
        ))),
  )
  const canEdit =
    canManage &&
    Boolean(detail.version) &&
    hasAnyPortalPermission(effectiveTenderPermissions(bootstrap), [
      "tenders.edit",
    ])
  const levelingRows = canManage
    ? await listPortalBidLeveling(detail.id)
    : { items: [] }
  const activeCompanyId = getActiveCompanyId(bootstrap?.workspaces)
  const offerParams = new URLSearchParams({
    tender: detail.id,
    target: `tender:${detail.id}`,
    tenderTitle: detail.title,
  })
  if (detail.currency) offerParams.set("tenderCurrency", detail.currency)
  const offerHref = `/dashboard/offers/create?${offerParams.toString()}`
  const canSubmitOffer = !canManage && detail.eligibleForOffer

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        title={detail.title}
        description={t("dashboard.descriptions.tenders")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.tenders"),
            href: portalListPath("tenders"),
          },
          { label: detail.title },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={portalListPath("tenders")}>
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t("common.back")}
              </Link>
            </Button>
            {canEdit ? (
              <Button asChild size="sm">
                <Link href={portalEditPath("tenders", detail.id)}>
                  {t("dashboard.edit.open")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[detail.sourceKind, detail.submissionChannel, detail.publicationStatus]
          .filter((value): value is string => Boolean(value))
          .map((value) => (
            <StatusBadge
              key={value}
              status={value}
              label={value.replaceAll("_", " ")}
            />
          ))}
      </div>

      <EntityDetailFields
        entity="tender"
        data={detail as unknown as Record<string, unknown>}
        labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
      />

      {canManage && detail.version ? (
        <TenderLifecycleActions
          id={detail.id}
          version={detail.version}
          status={detail.status}
        />
      ) : null}

      {!canManage ? (
        canSubmitOffer ? (
          <Button asChild>
            <Link href={offerHref}>{t("dashboard.create.submitOffer")}</Link>
          </Button>
        ) : detail.sourceUrl ? (
          <Button asChild variant="secondary">
            <a href={detail.sourceUrl} target="_blank" rel="noreferrer">
              {t("dashboard.tenders.external")}
            </a>
          </Button>
        ) : (
          <PortalInlineAlert tone="info">
            {t("dashboard.tenders.externalBlocked")}
          </PortalInlineAlert>
        )
      ) : null}

      {detail.lots.length ? (
        <Card className="overflow-hidden">
          <div className="bg-muted/18 border-b px-4 py-3.5 sm:px-5">
            <h2 className="text-foreground text-base font-semibold">
              {t("dashboard.fields.lots")}
            </h2>
          </div>
          <div className="divide-border/70 divide-y">
            {detail.lots.map((lot) => (
              <article key={lot.id} className="px-4 py-3.5 sm:px-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold">{lot.title}</p>
                    {lot.description ? (
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        {lot.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground shrink-0 text-xs sm:text-end">
                    {[lot.reference, lot.valueMinor, lot.currency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      ) : null}

      {detail.criteria.length ? (
        <Card className="overflow-hidden">
          <div className="bg-muted/18 border-b px-4 py-3.5 sm:px-5">
            <h2 className="text-foreground text-base font-semibold">
              {t("dashboard.fields.criteria")}
            </h2>
          </div>
          <div className="divide-border/70 divide-y">
            {detail.criteria.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <p className="text-foreground font-semibold">{item.label}</p>
                <p className="text-muted-foreground text-xs">
                  {item.kind.replaceAll("_", " ")} · {item.weight}% ·{" "}
                  {item.required ? t("common.required") : t("common.optional")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {canManage ? <BidLevelingTable rows={levelingRows.items} /> : null}

      {detail.media?.length ? (
        <Card className="overflow-hidden">
          <div className="bg-muted/18 border-b px-4 py-3.5 sm:px-5">
            <h2 className="text-foreground text-base font-semibold">
              {t("dashboard.projects.documents")}
            </h2>
          </div>
          <div className="divide-border/70 divide-y">
            {detail.media.map((item) => (
              <div
                key={item.assetId}
                className="flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <span className="border-primary/10 bg-primary/8 text-primary grid size-9 shrink-0 place-items-center rounded-xl border">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <DocumentLink assetId={item.assetId} label={item.name} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Suspense fallback={null}>
        <TenderCollaborationSection
          id={detail.id}
          companyId={activeCompanyId}
        />
      </Suspense>
    </div>
  )
}
