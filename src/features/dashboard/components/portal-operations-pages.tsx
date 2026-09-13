import {
  AlertTriangle,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarCheck,
  Clock3,
  Coins,
  HardHat,
  ListChecks,
  PackageCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TabsNav } from "@/components/ui/tabs"
import { OperationsCreatePanel } from "@/features/dashboard/components/operations-create-panel"
import { OperationsApprovalActions } from "@/features/dashboard/components/operations-approval-actions"
import {
  OperationsAlertCard,
  OperationsDataTable,
  OperationsEmptyState,
  OperationsMetricCard,
  OperationsStatusBadge,
  labelize,
} from "@/features/dashboard/components/operations-ui"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { WorkerAttendanceCheckIn } from "@/features/dashboard/components/worker-attendance-check-in"
import { PayrollApprovalActions } from "@/features/dashboard/components/payroll-approval-actions"
import { PayrollExportActions } from "@/features/dashboard/components/payroll-export-actions"
import { OperationsImportDialog } from "@/features/dashboard/components/operations-import-dialog"
import { OperationsEvidenceUploader } from "@/features/dashboard/components/operations-evidence-uploader"
import { ComplianceAdministration } from "@/features/dashboard/components/compliance-administration"
import { AlertRuleAdministration } from "@/features/dashboard/components/alert-rule-administration"
import {
  getPortalBootstrap,
  getComplianceAdministration,
  getProjectOperationsOverview,
  getWorkforceOperationsOverview,
  getWorkerOperationsOverview,
  listProjectOperationsResource,
  listWorkforceAlerts,
  listWorkforceAlertRules,
  listWorkforceAttendance,
  listWorkforcePayroll,
  type OperationsAlert,
  type OperationsShift,
  type OperationsTask,
  type ProjectOperationsOverview,
  type WorkforceOperationsOverview,
  type WorkerOperationsOverview,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import { Link } from "@/i18n/navigation"
import { getRequiredPortalSession } from "@/lib/auth/session"

const operationsSections = [
  "attendance",
  "crews",
  "tasks",
  "production",
  "labour",
  "materials",
  "equipment",
  "costs",
  "profit-control",
  "forecasts",
  "sal",
  "daily-reports",
  "compliance",
  "payroll",
  "alerts",
] as const
const projectSections = [
  "operations",
  "sites",
  "tasks",
  "production",
  "labour",
  "materials",
  "equipment",
  "costs",
  "profit-control",
  "forecast",
  "sal",
  "daily-reports",
  "compliance",
  "alerts",
] as const

export async function WorkforceOperationsSummary({
  companyId,
}: {
  companyId: string
}) {
  const data = await getWorkforceOperationsOverview(companyId)
  return <WorkforceSummary data={data} />
}

export async function WorkerOperationsSummary() {
  const data = await getWorkerOperationsOverview()
  return <WorkerShiftSummary data={data} />
}

export async function OperationsPage({
  section = "overview",
}: {
  section?: string
}) {
  const t = await getTranslations()
  const session = await getRequiredPortalSession()
  if (session?.primaryAccountType === "WORKER") {
    const workerData = await getWorkerOperationsOverview()
    return (
      <div className="space-y-6">
        <PortalPageHeader
          eyebrow={t("common.dashboard")}
          title={t("operations.worker.title")}
          description={t("operations.worker.description")}
        />
        {section === "attendance/check-in" || section === "attendance" ? (
          <WorkerAttendanceCheckIn initialShift={workerData.activeShift} />
        ) : (
          <WorkerShiftSummary data={workerData} />
        )}
      </div>
    )
  }
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const permissions = bootstrap?.entitlements.permissions ?? []
  const canManageEvidence = permissions.includes("workforce.evidence.manage")
  if (!companyId)
    return (
      <OperationsEmptyState
        title={t("operations.selectWorkspace")}
        description={t("operations.selectWorkspaceDescription")}
      />
    )
  const tabs = operationsSections.map((value) => ({
    value,
    label: t(`operations.sections.${value}`),
    href: `/dashboard/operations/${value}`,
    active: value === section,
  }))
  let content: React.ReactNode
  if (section === "attendance" || section === "attendance/exceptions") {
    const result = await listWorkforceAttendance(companyId)
    const shifts =
      section === "attendance/exceptions"
        ? result.items.filter((item) => item.exceptionCodes.length > 0)
        : result.items
    content = (
      <AttendanceTable
        companyId={companyId}
        shifts={shifts}
        canManageEvidence={canManageEvidence}
      />
    )
  } else if (section === "payroll") {
    const result = await listWorkforcePayroll(companyId)
    const canExportPayroll = permissions.includes(
      "workforce.pay_sensitive.view",
    )
    content = (
      <OperationsDataTable
        rows={result.items}
        columns={[
          {
            key: "startsOn",
            label: t("operations.payroll.periodStart"),
            render: (row) => formatDate(row.startsOn),
          },
          {
            key: "endsOn",
            label: t("operations.payroll.periodEnd"),
            render: (row) => formatDate(row.endsOn),
          },
          {
            key: "status",
            label: t("operations.payroll.status"),
            render: (row) => (
              <OperationsStatusBadge status={String(row.status)} />
            ),
          },
          {
            key: "grossMinor",
            label: t("operations.payroll.gross"),
            render: (row) => formatMoney(row.grossMinor, row.currency),
          },
          {
            key: "netMinor",
            label: t("operations.payroll.operationalNet"),
            render: (row) => formatMoney(row.netMinor, row.currency),
          },
          {
            key: "actions",
            label: t("operations.payroll.actions"),
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                <PayrollApprovalActions
                  companyId={companyId}
                  row={{
                    id: String(row.id),
                    status: String(row.status),
                    version: Number(row.version),
                  }}
                />
                {canExportPayroll ? (
                  <PayrollExportActions
                    companyId={companyId}
                    periodId={String(row.id)}
                  />
                ) : null}
              </div>
            ),
          },
        ]}
        companyId={companyId}
        resource="payroll"
      />
    )
  } else if (section === "alerts") {
    const canManageAlerts = permissions.includes("workforce.alerts.manage")
    const [result, ruleResult] = await Promise.all([
      listWorkforceAlerts(companyId),
      canManageAlerts
        ? listWorkforceAlertRules(companyId)
        : Promise.resolve({ items: [] }),
    ])
    content = (
      <AlertRuleAdministration
        companyId={companyId}
        rules={ruleResult.items}
        alerts={result.items as unknown as Array<Record<string, unknown>>}
        canManage={canManageAlerts}
      />
    )
  } else if (section === "overview") {
    const data = await getWorkforceOperationsOverview(companyId)
    content = <WorkforceSummary data={data} />
  } else {
    const data = await getWorkforceOperationsOverview(companyId)
    content = <CompanyProjectLinks data={data} section={section} />
  }
  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={
          section === "overview"
            ? t("operations.commandCenter")
            : t.has(`operations.sections.${section}`)
              ? t(`operations.sections.${section}`)
              : labelize(section)
        }
        description={t("operations.companyDescription")}
      />
      <TabsNav items={tabs} />
      {content}
    </div>
  )
}

export async function ProjectOperationsPage({
  projectId,
  section,
}: {
  projectId: string
  section: string
}) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const permissions = bootstrap?.entitlements.permissions ?? []
  if (!companyId)
    return <OperationsEmptyState title="Select a company workspace" />
  const overview = await getProjectOperationsOverview(companyId, projectId)
  const canManageEvidence = permissions.includes("workforce.evidence.manage")
  const canManageCompliance = permissions.includes(
    "workforce.compliance.manage",
  )
  const tabs = projectSections.map((value) => ({
    value,
    label: t(`operations.sections.${value}`),
    href: `/dashboard/projects/${projectId}/${value}`,
    active: value === section,
  }))
  const resource = resourceFor(section)
  const result = resource
    ? await listProjectOperationsResource<Record<string, unknown>>(
        companyId,
        projectId,
        resource,
      )
    : { items: [] }
  const approvalRows =
    section === "materials"
      ? (
          await listProjectOperationsResource<Record<string, unknown>>(
            companyId,
            projectId,
            "materials/transactions",
          )
        ).items
      : section === "equipment"
        ? (
            await listProjectOperationsResource<Record<string, unknown>>(
              companyId,
              projectId,
              "equipment-usage",
            )
          ).items
        : []
  const taskOptions =
    section === "production"
      ? (
          await listProjectOperationsResource<OperationsTask>(
            companyId,
            projectId,
            "tasks",
          )
        ).items.map((task) => ({ id: task.id, title: task.title }))
      : []
  const eligibleWorkers =
    section === "tasks"
      ? (
          await listProjectOperationsResource<{
            profileId: string
            role: string
            profile: { displayName: string | null; email: string | null }
          }>(companyId, projectId, "eligible-workers")
        ).items
      : []
  const crewOptions =
    section === "tasks"
      ? (
          await listProjectOperationsResource<{ id: string; name: string }>(
            companyId,
            projectId,
            "crews",
          )
        ).items
      : []
  const siteOptions = ["materials", "equipment"].includes(section)
    ? (
        await listProjectOperationsResource<{ id: string; name: string }>(
          companyId,
          projectId,
          "sites",
        )
      ).items
    : []
  const complianceAdministration =
    section === "compliance"
      ? await getComplianceAdministration(companyId, projectId)
      : null
  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={t("operations.projectControl")}
        title={overview.project.title}
        description={`${labelize(section)} · ${overview.project.projectTimezone}`}
      />
      <TabsNav items={tabs} />
      <ProjectControlMetrics overview={overview} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-brand-navy text-lg font-semibold">
            {t.has(`operations.sections.${section}`)
              ? t(`operations.sections.${section}`)
              : labelize(section)}
          </h2>
          <p className="text-muted text-sm">
            {t("operations.approvedLedgerDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {importTypeFor(section) && canImportSection(section, permissions) ? (
            <OperationsImportDialog
              companyId={companyId}
              projectId={projectId}
              defaultType={importTypeFor(section)!}
            />
          ) : null}
          {(
            [
              "sites",
              "tasks",
              "production",
              "costs",
              "forecast",
              "sal",
            ] as string[]
          ).includes(section) ? (
            <OperationsCreatePanel
              companyId={companyId}
              projectId={projectId}
              kind={
                section as
                  | "sites"
                  | "tasks"
                  | "production"
                  | "costs"
                  | "forecast"
                  | "sal"
              }
              tasks={taskOptions}
              workers={eligibleWorkers.map((item) => ({
                id: item.profileId,
                label:
                  item.profile.displayName ||
                  item.profile.email ||
                  item.profileId,
                role: item.role,
              }))}
              crews={crewOptions}
            />
          ) : null}
          {section === "materials" ? (
            <>
              <OperationsCreatePanel
                companyId={companyId}
                projectId={projectId}
                kind="materials"
              />
              <OperationsCreatePanel
                companyId={companyId}
                projectId={projectId}
                kind="material-usage"
                materials={result.items.map((item) => ({
                  id: String(item.id),
                  name: String(item.name),
                }))}
                sites={siteOptions}
              />
              <OperationsCreatePanel
                companyId={companyId}
                projectId={projectId}
                kind="material-transfer"
                materials={result.items.map((item) => ({
                  id: String(item.id),
                  name: String(item.name),
                }))}
                sites={siteOptions}
              />
            </>
          ) : null}
          {section === "equipment" ? (
            <>
              <OperationsCreatePanel
                companyId={companyId}
                projectId={projectId}
                kind="equipment"
                sites={siteOptions}
              />
              <OperationsCreatePanel
                companyId={companyId}
                projectId={projectId}
                kind="equipment-usage"
                equipment={result.items.map((item) => ({
                  id: String(item.id),
                  name: String(item.name),
                }))}
                sites={siteOptions}
              />
            </>
          ) : null}
        </div>
      </div>
      <ProjectSection
        companyId={companyId}
        projectId={projectId}
        section={section}
        overview={overview}
        rows={result.items}
        canManageEvidence={canManageEvidence}
      />
      {complianceAdministration ? (
        <ComplianceAdministration
          companyId={companyId}
          projectId={projectId}
          data={complianceAdministration}
          canManage={canManageCompliance}
        />
      ) : null}
      {approvalRows.length ? (
        <OperationalUsageTable
          companyId={companyId}
          projectId={projectId}
          section={section as "materials" | "equipment"}
          rows={approvalRows}
          canManageEvidence={canManageEvidence}
        />
      ) : null}
    </div>
  )
}

async function WorkforceSummary({
  data,
}: {
  data: WorkforceOperationsOverview
}) {
  const t = await getTranslations("operations")
  const present =
    count(data.attendance, "OPEN") +
    count(data.attendance, "SUBMITTED") +
    count(data.attendance, "APPROVED")
  const exceptions =
    countAlerts(data.alerts, "CRITICAL") + countAlerts(data.alerts, "WARNING")
  const activeTasks =
    count(data.tasks, "READY") +
    count(data.tasks, "IN_PROGRESS") +
    count(data.tasks, "BLOCKED")
  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OperationsMetricCard
          label={t("summary.onSiteToday")}
          value={present}
          detail={t("summary.openShifts")}
          icon={UsersRound}
          tone="blue"
        />
        <OperationsMetricCard
          label={t("summary.activeTasks")}
          value={activeTasks}
          detail={t("summary.blockedTasks", {
            count: count(data.tasks, "BLOCKED"),
          })}
          icon={ListChecks}
          tone={count(data.tasks, "BLOCKED") ? "amber" : "navy"}
        />
        <OperationsMetricCard
          label={t("summary.operationalRisks")}
          value={exceptions}
          detail={t("summary.riskAlerts")}
          icon={AlertTriangle}
          tone={exceptions ? "red" : "green"}
        />
        <OperationsMetricCard
          label={t("summary.payrollReview")}
          value={data.pendingPayroll}
          detail={t("summary.openPeriods")}
          icon={Banknote}
          tone="green"
        />
      </div>
      <Card className="rounded-[24px] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-brand-navy font-semibold">
              {t("summary.commandCenter")}
            </h2>
            <p className="text-muted text-sm">
              {t("summary.commandDescription")}
            </p>
          </div>
          <Link
            href="/dashboard/operations/attendance"
            className="text-primary text-sm font-semibold hover:underline"
          >
            {t("summary.openAttendance")}
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("sections.attendance"), value: present, icon: CalendarCheck },
            {
              label: t("sections.production"),
              value: data.production._sum.acceptedQuantity ?? "0",
              icon: PackageCheck,
            },
            {
              label: t("summary.labourHours"),
              value: Math.round((data.production._sum.labourMinutes ?? 0) / 60),
              icon: Clock3,
            },
            {
              label: t("summary.projects"),
              value: data.projects.length,
              icon: Building2,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-line/70 rounded-2xl border bg-slate-50/60 p-4"
            >
              <item.icon className="text-primary size-5" />
              <p className="text-muted mt-3 text-xs font-semibold">
                {item.label}
              </p>
              <p className="text-brand-navy mt-1 text-xl font-bold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

async function WorkerShiftSummary({ data }: { data: WorkerOperationsOverview }) {
  const t = await getTranslations("operations.worker")
  const shift = data.activeShift
  return (
    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="overflow-hidden rounded-[28px] shadow-sm">
        <div className="bg-brand-navy p-6 text-white">
          <p className="text-xs font-bold tracking-[0.14em] text-white/65 uppercase">
            {t("currentShift")}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {shift ? t("shiftInProgress") : t("readyToCheckIn")}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {shift?.checkedInAt
                  ? t("started", { time: formatDateTime(shift.checkedInAt) })
                  : t("checkInHint")}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              {shift ? t("active") : t("tokenRequired")}
            </span>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <ShiftSignal
            label={t("gpsEvidence")}
            value={shift ? t("shiftActive") : t("waiting")}
            tone="neutral"
          />
          <ShiftSignal
            label={t("syncStatus")}
            value={t("onlineRecords")}
            tone="neutral"
          />
          <ShiftSignal
            label={t("exceptions")}
            value={String(shift?.exceptionCodes.length ?? 0)}
            tone={shift?.exceptionCodes.length ? "risk" : "good"}
          />
        </div>
      </Card>
      <Card className="rounded-[28px] p-6 shadow-sm">
        <h2 className="text-brand-navy font-semibold">{t("myWork")}</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">{t("assignments")}</span>
            <strong>{data.assignments.length}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">{t("recentShifts")}</span>
            <strong>{data.recentShifts.length}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">{t("payrollStatements")}</span>
            <strong>{data.payroll.length}</strong>
          </div>
        </div>
      </Card>
    </section>
  )
}

async function ProjectControlMetrics({
  overview,
}: {
  overview: ProjectOperationsOverview
}) {
  const t = await getTranslations("operations.projectMetrics")
  const budget = BigInt(overview.project.budgetMinor ?? "0")
  const actual = BigInt(overview.metrics.actualMinor)
  const committed = BigInt(overview.metrics.committedMinor)
  const remaining = budget - actual - committed
  const pipeline = overview.pipeline.costs.reduce(
    (sum, item) => sum + BigInt(item._sum.amountMinor ?? "0"),
    BigInt(0),
  )
  const forecast = overview.forecast as {
    estimateAtCompletionMinor?: string
    expectedProfitMinor?: string
    marginBasisPoints?: number
  } | null
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard
        label={t("actualCost")}
        value={formatMoney(actual, overview.project.currency)}
        detail={t("ofBudget", {
          percentage: budget ? Number((actual * BigInt(100)) / budget) : 0,
        })}
        icon={Coins}
        tone="blue"
      />
      <OperationsMetricCard
        label={t("committed")}
        value={formatMoney(committed, overview.project.currency)}
        detail={t("pendingApproval", {
          amount: formatMoney(pipeline, overview.project.currency),
        })}
        icon={BriefcaseBusiness}
        tone="navy"
      />
      <OperationsMetricCard
        label={t("remaining")}
        value={formatMoney(remaining, overview.project.currency)}
        detail={t("remainingDescription")}
        icon={Calculator}
        tone={remaining < BigInt(0) ? "red" : "green"}
      />
      <OperationsMetricCard
        label={t("forecastMargin")}
        value={`${((forecast?.marginBasisPoints ?? 0) / 100).toFixed(1)}%`}
        detail={
          forecast
            ? formatMoney(
                forecast.expectedProfitMinor ?? "0",
                overview.project.currency,
              )
            : t("noApprovedForecast")
        }
        icon={TrendingUp}
        tone={(forecast?.marginBasisPoints ?? 0) < 0 ? "red" : "green"}
      />
    </div>
  )
}

async function ProjectSection({
  companyId,
  projectId,
  section,
  overview,
  rows,
  canManageEvidence,
}: {
  companyId: string
  projectId: string
  section: string
  overview: ProjectOperationsOverview
  rows: Array<Record<string, unknown>>
  canManageEvidence: boolean
}) {
  const t = await getTranslations("operations.projectMetrics")
  if (section === "profit-control" || section === "operations")
    return <ProfitControl overview={overview} />
  if (section === "alerts")
    return (
      <div className="grid gap-3">
        {overview.alerts.length ? (
          overview.alerts.map((alert: OperationsAlert) => (
            <OperationsAlertCard key={alert.id} {...alert} />
          ))
        ) : (
          <OperationsEmptyState title={t("noActiveAlerts")} />
        )}
      </div>
    )
  const approvalResource =
    section === "production"
      ? "production"
      : section === "costs"
        ? "costs"
        : section === "forecast"
          ? "forecasts"
          : section === "sal"
            ? "sal"
            : null
  const columns = await columnsFor(section)
  if (approvalResource)
    columns.push({
      key: "actions",
      label: t("actions"),
      render: (row) => (
        <OperationsApprovalActions
          companyId={companyId}
          projectId={projectId}
          resource={approvalResource}
          record={{
            id: String(row.id),
            status: String(row.status),
            version: Number(row.version),
          }}
        />
      ),
    })
  const evidenceType = evidenceTypeFor(section)
  if (evidenceType && canManageEvidence)
    columns.push({
      key: "evidence",
      label: t("evidence"),
      render: (row) => (
        <OperationsEvidenceUploader
          companyId={companyId}
          projectId={projectId}
          entityType={evidenceType}
          entityId={String(row.id)}
        />
      ),
    })
  return (
    <OperationsDataTable
      rows={rows}
      columns={columns}
      companyId={companyId}
      resource={`project:${projectId}:${section}`}
    />
  )
}

async function ProfitControl({
  overview,
}: {
  overview: ProjectOperationsOverview
}) {
  const t = await getTranslations("operations.projectMetrics")
  const budget = Number(overview.project.budgetMinor ?? 0)
  const actual = Number(overview.metrics.actualMinor)
  const committed = Number(overview.metrics.committedMinor)
  const used = budget ? ((actual + committed) / budget) * 100 : 0
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[24px] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-brand-navy font-semibold">
              {t("budgetConsumption")}
            </h3>
            <p className="text-muted text-sm">
              {t("budgetDescription")}
            </p>
          </div>
          <strong className="text-xl tabular-nums">{used.toFixed(1)}%</strong>
        </div>
        <Progress value={used} className="mt-5 h-3" />
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Value
            label={t("budget")}
            value={formatMoney(budget, overview.project.currency)}
          />
          <Value
            label={t("actual")}
            value={formatMoney(actual, overview.project.currency)}
          />
          <Value
            label={t("committed")}
            value={formatMoney(committed, overview.project.currency)}
          />
        </div>
      </Card>
      <Card className="rounded-[24px] p-6 shadow-sm">
        <h3 className="text-brand-navy font-semibold">{t("productivity")}</h3>
        <div className="mt-5 grid gap-4">
          <Value
            label={t("acceptedPerHour")}
            value={overview.metrics.productivityPerHour.toFixed(2)}
          />
          <Value
            label={t("labourHours")}
            value={overview.metrics.labourHours.toFixed(1)}
          />
          <Value
            label={t("reworkQuantity")}
            value={overview.metrics.reworkQuantity}
          />
        </div>
      </Card>
    </div>
  )
}

async function OperationalUsageTable({
  companyId,
  projectId,
  section,
  rows,
  canManageEvidence,
}: {
  companyId: string
  projectId: string
  section: "materials" | "equipment"
  rows: Array<Record<string, unknown>>
  canManageEvidence: boolean
}) {
  const t = await getTranslations("operations.tables")
  const resource =
    section === "materials" ? "materials/transactions" : "equipment-usage"
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-brand-navy text-lg font-semibold">
          {section === "materials" ? t("inventoryTransactions") : t("usageRecords")}
        </h2>
        <p className="text-muted text-sm">
          {t("validationFlow")}
        </p>
      </div>
      <OperationsDataTable
        rows={rows}
        companyId={companyId}
        resource={`project:${projectId}:${resource}`}
        columns={[
          {
            key: "occurredOn",
            label: t("columns.date"),
            render: (row) => formatDate(row.occurredOn),
          },
          {
            key: section === "materials" ? "transactionType" : "usageMinutes",
            label: section === "materials" ? "Type" : "Usage",
            render: (row) =>
              section === "materials" ? (
                <OperationsStatusBadge status={String(row.transactionType)} />
              ) : (
                `${(Number(row.usageMinutes) / 60).toFixed(1)} h`
              ),
          },
          {
            key: "status",
            label: t("columns.status"),
            render: (row) => (
              <OperationsStatusBadge status={String(row.status)} />
            ),
          },
          {
            key: "amountMinor",
            label: t("columns.cost"),
            render: (row) => formatMoney(row.amountMinor, row.currency),
          },
          {
            key: "actions",
            label: t("columns.actions"),
            className: "sticky end-0 bg-white text-end",
            render: (row) => (
              <OperationsApprovalActions
                companyId={companyId}
                projectId={projectId}
                resource={resource}
                record={{
                  id: String(row.id),
                  status: String(row.status),
                  version: Number(row.version),
                }}
              />
            ),
          },
          ...(canManageEvidence
            ? [
                {
                  key: "evidence",
                  label: t("columns.evidence"),
                  render: (row: Record<string, unknown>) => (
                    <OperationsEvidenceUploader
                      companyId={companyId}
                      projectId={projectId}
                      entityType={
                        section === "materials"
                          ? "material_transaction"
                          : "equipment_usage"
                      }
                      entityId={String(row.id)}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />
    </section>
  )
}

async function AttendanceTable({
  companyId,
  shifts,
  canManageEvidence,
}: {
  companyId: string
  shifts: OperationsShift[]
  canManageEvidence: boolean
}) {
  const t = await getTranslations("operations.tables")
  return (
    <OperationsDataTable
      rows={shifts as unknown as Array<Record<string, unknown>>}
      companyId={companyId}
      resource="attendance"
      columns={[
        {
          key: "workerId",
          label: t("columns.worker"),
          render: (row) => (
            <span className="font-mono text-xs">{shortId(row.workerId)}</span>
          ),
        },
        {
          key: "workDate",
          label: t("columns.workDate"),
          render: (row) => formatDate(row.workDate),
        },
        {
          key: "status",
          label: t("columns.status"),
          render: (row) => (
            <OperationsStatusBadge status={String(row.status)} />
          ),
        },
        {
          key: "workedMinutes",
          label: t("columns.worked"),
          render: (row) =>
            `${Math.round(Number(row.workedMinutes) / 6) / 10} h`,
        },
        {
          key: "overtimeMinutes",
          label: t("columns.overtime"),
          render: (row) => `${row.overtimeMinutes} min`,
        },
        {
          key: "exceptionCodes",
          label: t("columns.exceptions"),
          render: (row) =>
            Array.isArray(row.exceptionCodes) && row.exceptionCodes.length ? (
              <OperationsStatusBadge status={String(row.exceptionCodes[0])} />
            ) : (
              t("none")
            ),
        },
        ...(canManageEvidence
          ? [
              {
                key: "evidence",
                label: t("columns.evidence"),
                render: (row: Record<string, unknown>) => (
                  <OperationsEvidenceUploader
                    companyId={companyId}
                    entityType="attendance_shift"
                    entityId={String(row.id)}
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  )
}
function CompanyProjectLinks({
  data,
  section,
}: {
  data: WorkforceOperationsOverview
  section: string
}) {
  const projectSection = section === "forecasts" ? "forecast" : section
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.projects.length ? (
        data.projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}/${projectSection}`}
            className="group"
          >
            <Card className="group-hover:border-primary/40 h-full rounded-[22px] p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                  <HardHat className="size-5" />
                </span>
                <div>
                  <h3 className="text-brand-navy font-semibold">
                    {project.title}
                  </h3>
                  <p className="text-muted mt-1 text-sm">
                    Open project {labelize(section).toLowerCase()} records and
                    approvals.
                  </p>
                  <span className="text-primary mt-3 inline-block text-sm font-semibold">
                    Track {labelize(section)} →
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))
      ) : (
        <OperationsEmptyState
          title="No operational projects"
          description="Create a project before recording field operations."
        />
      )}
    </div>
  )
}
function ShiftSignal({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "good" | "risk" | "neutral"
}) {
  return (
    <div className="border-line/70 rounded-2xl border p-4">
      <span
        className={`mb-3 block size-2 rounded-full ${tone === "good" ? "bg-emerald-500" : tone === "risk" ? "bg-red-500" : "bg-slate-300"}`}
      />
      <p className="text-muted text-xs font-semibold">{label}</p>
      <p className="text-brand-navy mt-1 font-bold">{value}</p>
    </div>
  )
}
function Value({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-muted text-xs font-semibold">{label}</p>
      <p className="text-brand-navy mt-1 font-bold tabular-nums">{value}</p>
    </div>
  )
}

async function columnsFor(section: string) {
  const t = await getTranslations("operations.tables")
  if (section === "sites")
    return [
      {
        key: "name",
        label: t("columns.site"),
        render: (row: Record<string, unknown>) => (
          <div>
            <p className="text-brand-navy font-semibold">{String(row.name)}</p>
            <p className="text-muted text-xs">{String(row.code)}</p>
          </div>
        ),
      },
      { key: "timezone", label: t("columns.timezone") },
      { key: "address", label: t("columns.address") },
      {
        key: "geofenceRadiusMeters",
        label: t("columns.geofence"),
        render: (row: Record<string, unknown>) =>
          `${row.geofenceRadiusMeters} m`,
      },
      {
        key: "active",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "tasks")
    return [
      {
        key: "title",
        label: t("columns.task"),
        render: (row: Record<string, unknown>) => (
          <span className="text-brand-navy font-semibold">
            {String(row.title)}
          </span>
        ),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "priority", label: t("columns.priority") },
      { key: "plannedQuantity", label: t("columns.plannedQuantity") },
      {
        key: "plannedMinutes",
        label: t("columns.plannedHours"),
        render: (row: Record<string, unknown>) =>
          row.plannedMinutes
            ? `${(Number(row.plannedMinutes) / 60).toFixed(1)} h`
            : "—",
      },
      {
        key: "dueOn",
        label: t("columns.due"),
        render: (row: Record<string, unknown>) => formatDate(row.dueOn),
      },
    ]
  if (section === "production")
    return [
      {
        key: "workDate",
        label: t("columns.date"),
        render: (row: Record<string, unknown>) => formatDate(row.workDate),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "completedQuantity", label: t("columns.completed") },
      { key: "acceptedQuantity", label: t("columns.accepted") },
      {
        key: "labourMinutes",
        label: t("columns.labour"),
        render: (row: Record<string, unknown>) =>
          `${(Number(row.labourMinutes) / 60).toFixed(1)} h`,
      },
      { key: "reworkQuantity", label: t("columns.rework") },
    ]
  if (section === "labour")
    return [
      {
        key: "workerId",
        label: t("columns.worker"),
        render: (row: Record<string, unknown>) => shortId(row.workerId),
      },
      {
        key: "effectiveFrom",
        label: t("columns.effective"),
        render: (row: Record<string, unknown>) => formatDate(row.effectiveFrom),
      },
      {
        key: "regularRateMinorPerHour",
        label: t("columns.regularRate"),
        render: (row: Record<string, unknown>) =>
          row.masked
            ? t("restricted")
            : formatMoney(row.regularRateMinorPerHour, row.currency),
      },
      {
        key: "overtimeRateMinorPerHour",
        label: t("columns.overtimeRate"),
        render: (row: Record<string, unknown>) =>
          row.masked
            ? t("restricted")
            : formatMoney(row.overtimeRateMinorPerHour, row.currency),
      },
    ]
  if (section === "materials")
    return [
      { key: "code", label: t("columns.code") },
      { key: "name", label: t("columns.material") },
      { key: "unit", label: t("columns.unit") },
      {
        key: "stock",
        label: t("columns.onHand"),
        render: (row: Record<string, unknown>) =>
          Array.isArray(row.stock)
            ? row.stock
                .reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      (item as { onHandQuantity?: unknown }).onHandQuantity ??
                        0,
                    ),
                  0,
                )
                .toFixed(2)
            : "0",
      },
      {
        key: "active",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "equipment")
    return [
      { key: "name", label: t("columns.equipment") },
      {
        key: "ownership",
        label: t("columns.ownership"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.ownership)} />
        ),
      },
      {
        key: "rateMinor",
        label: t("columns.rate"),
        render: (row: Record<string, unknown>) =>
          `${formatMoney(row.rateMinor, row.currency)} / ${String(row.rateUnit).toLowerCase()}`,
      },
      {
        key: "active",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "costs")
    return [
      {
        key: "occurredOn",
        label: t("columns.date"),
        render: (row: Record<string, unknown>) => formatDate(row.occurredOn),
      },
      {
        key: "category",
        label: t("columns.category"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.category)} />
        ),
      },
      { key: "description", label: t("columns.description") },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      {
        key: "committed",
        label: t("columns.costType"),
        render: (row: Record<string, unknown>) =>
          row.committed ? t("committed") : t("actual"),
      },
      {
        key: "amountMinor",
        label: t("columns.amount"),
        render: (row: Record<string, unknown>) =>
          formatMoney(row.amountMinor, row.currency),
      },
    ]
  if (section === "forecast")
    return [
      { key: "versionNo", label: t("columns.version") },
      {
        key: "asOfDate",
        label: t("columns.asOf"),
        render: (row: Record<string, unknown>) => formatDate(row.asOfDate),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      {
        key: "estimateAtCompletionMinor",
        label: "EAC",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.estimateAtCompletionMinor, row.currency),
      },
      {
        key: "expectedProfitMinor",
        label: t("columns.profit"),
        render: (row: Record<string, unknown>) =>
          formatMoney(row.expectedProfitMinor, row.currency),
      },
      {
        key: "marginBasisPoints",
        label: t("columns.margin"),
        render: (row: Record<string, unknown>) =>
          `${(Number(row.marginBasisPoints) / 100).toFixed(1)}%`,
      },
    ]
  if (section === "sal")
    return [
      { key: "sequence", label: "SAL" },
      {
        key: "periodStart",
        label: t("columns.period"),
        render: (row: Record<string, unknown>) =>
          `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`,
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      {
        key: "grossMinor",
        label: t("columns.gross"),
        render: (row: Record<string, unknown>) =>
          formatMoney(row.grossMinor, row.currency),
      },
      {
        key: "retentionMinor",
        label: t("columns.retention"),
        render: (row: Record<string, unknown>) =>
          formatMoney(row.retentionMinor, row.currency),
      },
      {
        key: "approvedMinor",
        label: t("columns.approved"),
        render: (row: Record<string, unknown>) =>
          formatMoney(row.approvedMinor, row.currency),
      },
    ]
  if (section === "daily-reports")
    return [
      {
        key: "reportDate",
        label: t("columns.date"),
        render: (row: Record<string, unknown>) => formatDate(row.reportDate),
      },
      {
        key: "status",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "summary", label: t("columns.summary") },
      {
        key: "updatedAt",
        label: t("columns.updated"),
        render: (row: Record<string, unknown>) => formatDateTime(row.updatedAt),
      },
    ]
  if (section === "compliance")
    return [
      { key: "title", label: t("columns.requirement") },
      { key: "credentialType", label: t("columns.credential") },
      {
        key: "required",
        label: t("columns.required"),
        render: (row: Record<string, unknown>) => (row.required ? t("yes") : t("no")),
      },
      {
        key: "expiresOn",
        label: t("columns.expires"),
        render: (row: Record<string, unknown>) => formatDate(row.expiresOn),
      },
      {
        key: "active",
        label: t("columns.status"),
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  return [
    { key: "title", label: labelize(section) },
    {
      key: "status",
      label: t("columns.status"),
      render: (row: Record<string, unknown>) =>
        row.status ? (
          <OperationsStatusBadge status={String(row.status)} />
        ) : (
          "—"
        ),
    },
  ]
}

function resourceFor(section: string) {
  if (["operations", "profit-control", "alerts"].includes(section)) return null
  if (section === "forecast") return "forecasts"
  if (section === "labour") return "labour/rates"
  if (section === "equipment") return "equipment-usage/resources"
  return section
}
function importTypeFor(section: string) {
  const mapping = {
    tasks: "tasks",
    production: "production",
    costs: "costs",
    materials: "materials",
    equipment: "equipment_usage",
    labour: "labour_rates",
  } as const
  return mapping[section as keyof typeof mapping]
}
function evidenceTypeFor(section: string) {
  const mapping = {
    tasks: "task",
    production: "production_entry",
    costs: "project_cost",
    forecast: "forecast",
    sal: "sal",
    "daily-reports": "daily_report",
  } as const
  return mapping[section as keyof typeof mapping]
}
function canImportSection(section: string, permissions: string[]) {
  const permission =
    section === "tasks"
      ? "workforce.tasks.manage"
      : section === "production"
        ? "workforce.production.manage"
        : section === "costs"
          ? "workforce.costs.manage"
          : section === "materials"
            ? "workforce.materials.manage"
            : section === "equipment"
              ? "workforce.equipment_usage.manage"
              : "workforce.labour_rates.manage"
  return permissions.includes(permission)
}
function count(
  items: Array<{ status: string; _count: { _all: number } }>,
  status: string,
) {
  return items.find((item) => item.status === status)?._count._all ?? 0
}
function countAlerts(
  items: Array<{ severity: string; _count: { _all: number } }>,
  severity: string,
) {
  return items.find((item) => item.severity === severity)?._count._all ?? 0
}
function formatMoney(value: unknown, currency: unknown = "EUR") {
  const amount = Number(value ?? 0) / 100
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: String(currency || "EUR"),
    maximumFractionDigits: 0,
  }).format(amount)
}
function formatDate(value: unknown) {
  if (!value) return "—"
  const date = new Date(String(value))
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
}
function formatDateTime(value: unknown) {
  if (!value) return "—"
  const date = new Date(String(value))
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
}
function shortId(value: unknown) {
  const text = String(value ?? "")
  return text.length > 12 ? `${text.slice(0, 8)}…` : text
}
