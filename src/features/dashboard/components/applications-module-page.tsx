import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ApplicationReviewActions } from "@/features/dashboard/components/application-review-actions"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { ApplicationWithdrawAction } from "@/features/dashboard/components/marketplace-actions"
import { ApplicationCreateForm } from "@/features/dashboard/components/marketplace-create"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  getPortalApplication,
  getPortalBootstrap,
  getWorkspaceApplication,
  listApplicationTargets,
  listPortalApplications,
  listWorkspaceApplications,
  type PortalApplication,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import { canWithdrawApplication } from "@/features/dashboard/lib/application-decision"
import {
  portalDetailPath,
  portalListPath,
} from "@/features/dashboard/config/portal-routes"
import { Link } from "@/i18n/navigation"

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

export async function ApplicationsModulePage({
  query,
}: {
  query: PortalQuery
}) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const isWorker = bootstrap?.profile.primaryAccountType === "WORKER"
  const companyId = getActiveCompanyId(bootstrap?.workspaces)

  if (query.action === "create") {
    if (!isWorker) {
      return (
        <ApplicationUnavailable
          message={t("dashboard.bootstrapUnavailable")}
          backLabel={t("common.back")}
        />
      )
    }
    const targets = await listApplicationTargets().catch(() => ({ items: [] }))
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          title={t("dashboard.create.applicationTitle")}
          description={t("dashboard.descriptions.applications")}
          actions={
            <Button asChild variant="secondary" size="sm">
              <Link href={portalListPath("applications")}>
                {t("common.back")}
              </Link>
            </Button>
          }
        />
        <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
          <ApplicationCreateForm targets={targets.items} />
        </Card>
      </div>
    )
  }

  const selected = query.id
    ? await loadApplicationDetail({ id: query.id, isWorker, companyId })
    : null

  if (query.action === "detail" && query.id) {
    if (!selected) {
      return (
        <ApplicationUnavailable
          message={t("dashboard.applicationsEmpty")}
          backLabel={t("common.back")}
        />
      )
    }
    return (
      <ApplicationDetail
        application={selected}
        isWorker={isWorker}
        companyId={companyId}
      />
    )
  }

  const result = isWorker
    ? await listPortalApplications("submitted").catch(() => null)
    : companyId
      ? await listWorkspaceApplications(companyId).catch(() => null)
      : null

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        title={t("dashboard.nav.applications")}
        description={t("dashboard.descriptions.applications")}
        actions={
          isWorker ? (
            <Button asChild size="sm">
              <Link href="/dashboard/applications/create">
                {t("dashboard.create.applicationTitle")}
              </Link>
            </Button>
          ) : undefined
        }
      />
      {!result ? (
        <Card className="p-6">
          <p className="text-muted text-sm">
            {t("dashboard.bootstrapUnavailable")}
          </p>
        </Card>
      ) : (
        <PortalDataTable
          empty={t("dashboard.applicationsEmpty")}
          labels={tableLabels(t)}
          rows={result.items.map((application) => ({
            id: application.id,
            title: application.opportunityTitle || application.reference,
            secondary: application.reference,
            meta: application.coverMessage ?? undefined,
            statuses: [application.status],
            detailHref: portalDetailPath("applications", application.id),
            actions: application.conversationId ? (
              <Button asChild size="sm" variant="ghost">
                <Link
                  href={`/dashboard/messages/${application.conversationId}`}
                >
                  {t("dashboard.marketplace.message")}
                </Link>
              </Button>
            ) : undefined,
          }))}
        />
      )}
    </div>
  )
}

async function loadApplicationDetail({
  id,
  isWorker,
  companyId,
}: {
  id: string
  isWorker: boolean
  companyId?: string
}) {
  if (isWorker) return getPortalApplication(id).catch(() => null)
  if (!companyId) return null
  return getWorkspaceApplication(companyId, id).catch(() => null)
}

async function ApplicationDetail({
  application,
  isWorker,
  companyId,
}: {
  application: PortalApplication
  isWorker: boolean
  companyId?: string
}) {
  const t = await getTranslations()
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={application.reference}
        title={application.opportunityTitle || application.reference}
        description={t("dashboard.descriptions.applications")}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href={portalListPath("applications")}>
              {t("common.back")}
            </Link>
          </Button>
        }
      />
      <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
        <EntityDetailFields
          entity="application"
          data={application as unknown as Record<string, unknown>}
          labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
        />
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {application.conversationId ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/dashboard/messages/${application.conversationId}`}>
                {t("dashboard.marketplace.message")}
              </Link>
            </Button>
          ) : null}
          {isWorker && canWithdrawApplication(application.status) ? (
            <ApplicationWithdrawAction
              id={application.id}
              version={application.version}
              label={t("dashboard.marketplace.withdraw")}
            />
          ) : null}
          {!isWorker && companyId ? (
            <ApplicationReviewActions
              companyId={companyId}
              id={application.id}
              version={application.version}
              status={application.status}
              updateStageLabel={t("dashboard.workforce.updateStage")}
              acceptLabel={t("dashboard.marketplace.accept")}
              rejectLabel={t("dashboard.marketplace.reject")}
            />
          ) : null}
        </div>
      </Card>
    </div>
  )
}

async function ApplicationUnavailable({
  message,
  backLabel,
}: {
  message: string
  backLabel: string
}) {
  const t = await getTranslations()
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        title={t("dashboard.nav.applications")}
        description={t("dashboard.descriptions.applications")}
      />
      <Card className="p-6">
        <p className="text-muted text-sm">{message}</p>
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link href={portalListPath("applications")}>{backLabel}</Link>
        </Button>
      </Card>
    </div>
  )
}
