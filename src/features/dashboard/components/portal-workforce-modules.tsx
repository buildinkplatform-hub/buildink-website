import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import {
  getPortalBootstrap,
  getPortalWorkforceOverview,
} from "@/features/dashboard/data/portal-client"
import { Link } from "@/i18n/navigation"
import { getRequiredPortalSession } from "@/lib/auth/session"

function tableLabels(
  t: Awaited<ReturnType<typeof getTranslations>>,
): PortalTableLabels {
  return {
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
  }
}

export async function WorkforceModulePage({ detailId }: { detailId?: string }) {
  void detailId
  const t = await getTranslations()
  const session = await getRequiredPortalSession()
  const isWorker = session?.primaryAccountType === "WORKER"
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)

  if (isWorker) {
    const { WorkerProfileRecords } =
      await import("@/features/dashboard/components/worker-profile-records")
    const workforce = await getPortalWorkforceOverview()
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          eyebrow={t("common.dashboard")}
          title={t("dashboard.nav.workforce")}
          description={t("dashboard.descriptions.workforce")}
        />
        {workforce ? <WorkerProfileRecords data={workforce} /> : null}
      </div>
    )
  }

  const { listPortalOpportunities, listWorkspaceApplications } =
    await import("@/features/dashboard/data/portal-client")
  const [requests, applications] = await Promise.all([
    listPortalOpportunities({
      page: 1,
      kind: "WORKFORCE_REQUEST",
      companyId,
      scope: "owned",
    }),
    companyId
      ? listWorkspaceApplications(companyId)
      : Promise.resolve({ items: [] }),
  ])

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.workforce")}
        description={t("dashboard.descriptions.workforceCompany")}
      />
      <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("dashboard.workforce.requests")}
        </h2>
        <PortalDataTable
          empty={t("dashboard.workforce.requestsEmpty")}
          labels={tableLabels(t)}
          columns={[
            {
              id: "request",
              header: "Request",
              className: "min-w-[260px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">{String(row.kindLabel ?? "-")}</p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => String(row.statusLabel ?? "-"),
            },
            {
              id: "publication",
              header: "Publication",
              render: (row) => String(row.publicationLabel ?? "-"),
            },
            {
              id: "actions",
              header: "Actions",
              cellClassName: "w-[1%] whitespace-nowrap",
              render: (row) =>
                row.detailHref ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={String(row.detailHref)}>{tableLabels(t).details}</Link>
                  </Button>
                ) : null,
            },
          ]}
          rows={requests.items.map((item) => ({
            id: item.id,
            title: item.title,
            kindLabel: item.kind?.replaceAll("_", " ") ?? "-",
            statusLabel: item.statusV1?.replaceAll("_", " ") ?? "-",
            publicationLabel: item.publicationStatus.replaceAll("_", " "),
            secondary: item.kind ?? undefined,
            statuses: [item.statusV1, item.publicationStatus],
            detailHref: `/dashboard/opportunities/${item.id}`,
          }))}
        />
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/opportunities?kind=WORKFORCE_REQUEST">
            {t("dashboard.workforce.createRequest")}
          </Link>
        </Button>
      </Card>
      <Card className="space-y-4 rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("dashboard.workforce.applications")}
        </h2>
        <PortalDataTable
          empty={t("dashboard.workforce.applicationsEmpty")}
          labels={tableLabels(t)}
          columns={[
            {
              id: "application",
              header: "Application",
              className: "min-w-[260px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">{String(row.reference ?? "-")}</p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => String(row.statusLabel ?? "-"),
            },
            {
              id: "actions",
              header: "Actions",
              cellClassName: "w-[1%] whitespace-nowrap",
              render: (row) =>
                row.detailHref ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={String(row.detailHref)}>{tableLabels(t).details}</Link>
                  </Button>
                ) : null,
            },
          ]}
          rows={applications.items.map((item) => ({
            id: item.id,
            title: item.opportunityTitle || item.reference,
            reference: item.reference,
            statusLabel: item.status.replaceAll("_", " "),
            secondary: item.reference,
            statuses: [item.status],
            detailHref: `/dashboard/applications/${item.id}`,
          }))}
        />
      </Card>
    </div>
  )
}
