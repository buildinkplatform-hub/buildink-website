import {
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  UserCheck,
  UsersRound,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  OperationsMetricCard,
  OperationsStatusBadge,
} from "@/features/dashboard/components/operations-ui"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  PortalServerTable,
  type PortalServerTableLabels,
} from "@/features/dashboard/components/portal-server-table"
import { WorkforceFlowNav } from "@/features/dashboard/components/workforce-flow-nav"
import {
  getPortalBootstrap,
  getPortalWorkforceOverview,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import { Link } from "@/i18n/navigation"
import { getRequiredPortalSession } from "@/lib/auth/session"

function tableLabels(
  t: Awaited<ReturnType<typeof getTranslations>>,
): PortalServerTableLabels {
  return {
    search: t("dashboard.table.search"),
    status: t("dashboard.table.status"),
    allStatuses: t("dashboard.table.allStatuses"),
    sort: t("dashboard.table.sort"),
    newest: t("dashboard.table.newest"),
    titleAsc: t("dashboard.table.titleAsc"),
    previous: t("dashboard.table.previous"),
    next: t("dashboard.table.next"),
  }
}

export async function WorkforceModulePage({ detailId }: { detailId?: string }) {
  void detailId
  const t = await getTranslations()
  const session = await getRequiredPortalSession()
  const isWorker = session?.primaryAccountType === "WORKER"
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const hasWorkforceRequests =
    bootstrap?.entitlements.modules.includes("opportunities") ?? false
  const canReviewHiring =
    hasWorkforceRequests &&
    (bootstrap?.entitlements.permissions.includes(
      "worker_applications.review",
    ) ??
      false)

  if (isWorker) {
    const { WorkerProfileRecords } =
      await import("@/features/dashboard/components/worker-profile-records")
    const workforce = await getPortalWorkforceOverview()
    const { WorkerOperationsSummary } =
      await import("@/features/dashboard/components/portal-operations-pages")
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          eyebrow={t("common.dashboard")}
          title={t("dashboard.nav.workforce")}
          description={t("dashboard.descriptions.workforce")}
        />
        <WorkforceFlowNav audience="worker" />
        <WorkerOperationsSummary />
        <section id="availability" className="scroll-mt-24">
          {workforce ? <WorkerProfileRecords data={workforce} /> : null}
        </section>
      </div>
    )
  }

  const { listPortalOpportunities, listWorkspaceApplications } =
    await import("@/features/dashboard/data/portal-client")
  const [requests, applications] = await Promise.all([
    canReviewHiring
      ? listPortalOpportunities({
          page: 1,
          kind: "WORKFORCE_REQUEST",
          companyId,
          scope: "owned",
        })
      : Promise.resolve({ items: [] }),
    companyId && canReviewHiring
      ? listWorkspaceApplications(companyId)
      : Promise.resolve({ items: [] }),
  ])
  const { WorkforceOperationsSummary } =
    await import("@/features/dashboard/components/portal-operations-pages")

  const inReview = applications.items.filter((item) =>
    ["SUBMITTED", "REVIEW", "SHORTLISTED", "INTERVIEW"].includes(item.status),
  ).length
  const hired = applications.items.filter((item) =>
    ["HIRED", "ACCEPTED", "APPROVED"].includes(item.status),
  ).length

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.workforce")}
        description={t("dashboard.descriptions.workforceCompany")}
      />

      <WorkforceFlowNav audience="company" showHiring={canReviewHiring} />

      {companyId ? <WorkforceOperationsSummary companyId={companyId} /> : null}

      {canReviewHiring ? (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OperationsMetricCard
              label="Open workforce requests"
              value={requests.items.length}
              detail="Roles and capacity currently being sourced"
              icon={BriefcaseBusiness}
              tone="blue"
            />
            <OperationsMetricCard
              label="Applicants"
              value={applications.items.length}
              detail="Candidates across your active requests"
              icon={UsersRound}
              tone="navy"
            />
            <OperationsMetricCard
              label="In review"
              value={inReview}
              detail="Applications needing a hiring decision"
              icon={Clock3}
              tone={inReview ? "amber" : "green"}
            />
            <OperationsMetricCard
              label="Hired / accepted"
              value={hired}
              detail="Candidates moved into the workforce"
              icon={UserCheck}
              tone="green"
            />
          </div>

          <div className="bg-card text-card-foreground overflow-hidden rounded-[24px] border shadow-sm">
            <div className="bg-muted/15 flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                  <BriefcaseBusiness className="size-5" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Demand planning
                  </p>
                  <h2 className="text-foreground mt-1 text-lg font-semibold">
                    {t("dashboard.workforce.requests")}
                  </h2>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                    Define workforce demand, review publication state and open
                    the request before screening candidates.
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/opportunities?kind=WORKFORCE_REQUEST">
                  {t("dashboard.workforce.createRequest")}
                </Link>
              </Button>
            </div>
            <div className="p-4 sm:p-5">
              <PortalServerTable
                empty={t("dashboard.workforce.requestsEmpty")}
                labels={tableLabels(t)}
                basePath="/dashboard/workforce"
                columns={[
                  {
                    id: "request",
                    header: "Request",
                    className: "min-w-[260px]",
                    render: (row) => (
                      <div className="space-y-1">
                        <p className="text-foreground font-semibold">
                          {row.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {String(row.kindLabel ?? "-")}
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "status",
                    header: "Request status",
                    render: (row) => (
                      <OperationsStatusBadge
                        status={String(row.statusLabel ?? "-")}
                      />
                    ),
                  },
                  {
                    id: "publication",
                    header: "Publication",
                    render: (row) => (
                      <OperationsStatusBadge
                        status={String(row.publicationLabel ?? "-")}
                      />
                    ),
                  },
                  {
                    id: "actions",
                    header: "Actions",
                    cellClassName: "w-[1%] whitespace-nowrap",
                    render: (row) =>
                      row.detailHref ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={String(row.detailHref)}>
                            {t("dashboard.table.details")}
                          </Link>
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
            </div>
          </div>

          <Card className="overflow-hidden rounded-[24px] shadow-sm">
            <div className="bg-muted/15 flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <FileCheck2 className="size-5" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Hiring pipeline
                  </p>
                  <h2 className="text-foreground mt-1 text-lg font-semibold">
                    {t("dashboard.workforce.applications")}
                  </h2>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                    Screen applicants consistently and move each candidate
                    toward review, interview, acceptance or closure.
                  </p>
                </div>
              </div>
              {inReview ? (
                <span className="w-fit rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {inReview} need review
                </span>
              ) : null}
            </div>
            <div className="p-4 sm:p-5">
              <PortalServerTable
                empty={t("dashboard.workforce.applicationsEmpty")}
                labels={tableLabels(t)}
                basePath="/dashboard/workforce"
                columns={[
                  {
                    id: "application",
                    header: "Candidate / request",
                    className: "min-w-[260px]",
                    render: (row) => (
                      <div className="space-y-1">
                        <p className="text-foreground font-semibold">
                          {row.title}
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {String(row.reference ?? "-")}
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "status",
                    header: "Hiring stage",
                    render: (row) => (
                      <OperationsStatusBadge
                        status={String(row.statusLabel ?? "-")}
                      />
                    ),
                  },
                  {
                    id: "actions",
                    header: "Actions",
                    cellClassName: "w-[1%] whitespace-nowrap",
                    render: (row) =>
                      row.detailHref ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={String(row.detailHref)}>
                            {t("dashboard.table.details")}
                          </Link>
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
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  )
}
