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
          title="My workforce operations"
          description="Track active shifts, assignments, attendance history, and operational pay."
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
        title="Select a company workspace"
        description="Workforce operations are scoped to the active company."
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
            label: "Period start",
            render: (row) => formatDate(row.startsOn),
          },
          {
            key: "endsOn",
            label: "Period end",
            render: (row) => formatDate(row.endsOn),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <OperationsStatusBadge status={String(row.status)} />
            ),
          },
          {
            key: "grossMinor",
            label: "Gross",
            render: (row) => formatMoney(row.grossMinor, row.currency),
          },
          {
            key: "netMinor",
            label: "Operational net",
            render: (row) => formatMoney(row.netMinor, row.currency),
          },
          {
            key: "actions",
            label: "Actions",
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

function WorkforceSummary({ data }: { data: WorkforceOperationsOverview }) {
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
          label="On site today"
          value={present}
          detail="Open and recorded shifts"
          icon={UsersRound}
          tone="blue"
        />
        <OperationsMetricCard
          label="Active tasks"
          value={activeTasks}
          detail={`${count(data.tasks, "BLOCKED")} blocked`}
          icon={ListChecks}
          tone={count(data.tasks, "BLOCKED") ? "amber" : "navy"}
        />
        <OperationsMetricCard
          label="Operational risks"
          value={exceptions}
          detail="Critical and warning alerts"
          icon={AlertTriangle}
          tone={exceptions ? "red" : "green"}
        />
        <OperationsMetricCard
          label="Payroll review"
          value={data.pendingPayroll}
          detail="Open operational periods"
          icon={Banknote}
          tone="green"
        />
      </div>
      <Card className="rounded-[24px] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-brand-navy font-semibold">
              Operational command center
            </h2>
            <p className="text-muted text-sm">
              Move from attendance evidence to project profitability without
              disconnected records.
            </p>
          </div>
          <Link
            href="/dashboard/operations/attendance"
            className="text-primary text-sm font-semibold hover:underline"
          >
            Open attendance
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Attendance", value: present, icon: CalendarCheck },
            {
              label: "Production",
              value: data.production._sum.acceptedQuantity ?? "0",
              icon: PackageCheck,
            },
            {
              label: "Labour hours",
              value: Math.round((data.production._sum.labourMinutes ?? 0) / 60),
              icon: Clock3,
            },
            { label: "Projects", value: data.projects.length, icon: Building2 },
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

function WorkerShiftSummary({ data }: { data: WorkerOperationsOverview }) {
  const shift = data.activeShift
  return (
    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="overflow-hidden rounded-[28px] shadow-sm">
        <div className="bg-brand-navy p-6 text-white">
          <p className="text-xs font-bold tracking-[0.14em] text-white/65 uppercase">
            Current shift
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {shift ? "Shift in progress" : "Ready to check in"}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {shift?.checkedInAt
                  ? `Started ${formatDateTime(shift.checkedInAt)}`
                  : "Scan the site QR or use the site PIN."}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              {shift ? "Active" : "Site token required"}
            </span>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <ShiftSignal
            label="GPS evidence"
            value={shift ? "Shift active" : "Waiting"}
            tone="neutral"
          />
          <ShiftSignal
            label="Sync status"
            value="Online records"
            tone="neutral"
          />
          <ShiftSignal
            label="Exceptions"
            value={String(shift?.exceptionCodes.length ?? 0)}
            tone={shift?.exceptionCodes.length ? "risk" : "good"}
          />
        </div>
      </Card>
      <Card className="rounded-[28px] p-6 shadow-sm">
        <h2 className="text-brand-navy font-semibold">My work</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">Assignments</span>
            <strong>{data.assignments.length}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">Recent shifts</span>
            <strong>{data.recentShifts.length}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">Payroll statements</span>
            <strong>{data.payroll.length}</strong>
          </div>
        </div>
      </Card>
    </section>
  )
}

function ProjectControlMetrics({
  overview,
}: {
  overview: ProjectOperationsOverview
}) {
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
        label="Actual cost"
        value={formatMoney(actual, overview.project.currency)}
        detail={`${budget ? Number((actual * BigInt(100)) / budget) : 0}% of budget`}
        icon={Coins}
        tone="blue"
      />
      <OperationsMetricCard
        label="Committed"
        value={formatMoney(committed, overview.project.currency)}
        detail={`${formatMoney(pipeline, overview.project.currency)} pending approval`}
        icon={BriefcaseBusiness}
        tone="navy"
      />
      <OperationsMetricCard
        label="Remaining"
        value={formatMoney(remaining, overview.project.currency)}
        detail="Budget less approved actual and committed"
        icon={Calculator}
        tone={remaining < BigInt(0) ? "red" : "green"}
      />
      <OperationsMetricCard
        label="Forecast margin"
        value={`${((forecast?.marginBasisPoints ?? 0) / 100).toFixed(1)}%`}
        detail={
          forecast
            ? formatMoney(
                forecast.expectedProfitMinor ?? "0",
                overview.project.currency,
              )
            : "No approved forecast"
        }
        icon={TrendingUp}
        tone={(forecast?.marginBasisPoints ?? 0) < 0 ? "red" : "green"}
      />
    </div>
  )
}

function ProjectSection({
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
          <OperationsEmptyState title="No active project alerts" />
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
  const columns = columnsFor(section)
  if (approvalResource)
    columns.push({
      key: "actions",
      label: "Actions",
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
      label: "Evidence",
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

function ProfitControl({ overview }: { overview: ProjectOperationsOverview }) {
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
              Budget consumption
            </h3>
            <p className="text-muted text-sm">
              Actual plus committed cost against baseline
            </p>
          </div>
          <strong className="text-xl tabular-nums">{used.toFixed(1)}%</strong>
        </div>
        <Progress value={used} className="mt-5 h-3" />
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Value
            label="Budget"
            value={formatMoney(budget, overview.project.currency)}
          />
          <Value
            label="Actual"
            value={formatMoney(actual, overview.project.currency)}
          />
          <Value
            label="Committed"
            value={formatMoney(committed, overview.project.currency)}
          />
        </div>
      </Card>
      <Card className="rounded-[24px] p-6 shadow-sm">
        <h3 className="text-brand-navy font-semibold">Productivity</h3>
        <div className="mt-5 grid gap-4">
          <Value
            label="Accepted units / labour hour"
            value={overview.metrics.productivityPerHour.toFixed(2)}
          />
          <Value
            label="Labour hours"
            value={overview.metrics.labourHours.toFixed(1)}
          />
          <Value
            label="Rework quantity"
            value={overview.metrics.reworkQuantity}
          />
        </div>
      </Card>
    </div>
  )
}

function OperationalUsageTable({
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
  const resource =
    section === "materials" ? "materials/transactions" : "equipment-usage"
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-brand-navy text-lg font-semibold">
          {section === "materials" ? "Inventory transactions" : "Usage records"}
        </h2>
        <p className="text-muted text-sm">
          Project Manager validation is followed by Finance ledger posting.
        </p>
      </div>
      <OperationsDataTable
        rows={rows}
        companyId={companyId}
        resource={`project:${projectId}:${resource}`}
        columns={[
          {
            key: "occurredOn",
            label: "Date",
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
            label: "Status",
            render: (row) => (
              <OperationsStatusBadge status={String(row.status)} />
            ),
          },
          {
            key: "amountMinor",
            label: "Cost",
            render: (row) => formatMoney(row.amountMinor, row.currency),
          },
          {
            key: "actions",
            label: "Actions",
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
                  label: "Evidence",
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

function AttendanceTable({
  companyId,
  shifts,
  canManageEvidence,
}: {
  companyId: string
  shifts: OperationsShift[]
  canManageEvidence: boolean
}) {
  return (
    <OperationsDataTable
      rows={shifts as unknown as Array<Record<string, unknown>>}
      companyId={companyId}
      resource="attendance"
      columns={[
        {
          key: "workerId",
          label: "Worker",
          render: (row) => (
            <span className="font-mono text-xs">{shortId(row.workerId)}</span>
          ),
        },
        {
          key: "workDate",
          label: "Work date",
          render: (row) => formatDate(row.workDate),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <OperationsStatusBadge status={String(row.status)} />
          ),
        },
        {
          key: "workedMinutes",
          label: "Worked",
          render: (row) =>
            `${Math.round(Number(row.workedMinutes) / 6) / 10} h`,
        },
        {
          key: "overtimeMinutes",
          label: "Overtime",
          render: (row) => `${row.overtimeMinutes} min`,
        },
        {
          key: "exceptionCodes",
          label: "Exceptions",
          render: (row) =>
            Array.isArray(row.exceptionCodes) && row.exceptionCodes.length ? (
              <OperationsStatusBadge status={String(row.exceptionCodes[0])} />
            ) : (
              "None"
            ),
        },
        ...(canManageEvidence
          ? [
              {
                key: "evidence",
                label: "Evidence",
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

function columnsFor(section: string) {
  if (section === "sites")
    return [
      {
        key: "name",
        label: "Site",
        render: (row: Record<string, unknown>) => (
          <div>
            <p className="text-brand-navy font-semibold">{String(row.name)}</p>
            <p className="text-muted text-xs">{String(row.code)}</p>
          </div>
        ),
      },
      { key: "timezone", label: "Timezone" },
      { key: "address", label: "Address" },
      {
        key: "geofenceRadiusMeters",
        label: "Geofence",
        render: (row: Record<string, unknown>) =>
          `${row.geofenceRadiusMeters} m`,
      },
      {
        key: "active",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "tasks")
    return [
      {
        key: "title",
        label: "Task",
        render: (row: Record<string, unknown>) => (
          <span className="text-brand-navy font-semibold">
            {String(row.title)}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "priority", label: "Priority" },
      { key: "plannedQuantity", label: "Planned quantity" },
      {
        key: "plannedMinutes",
        label: "Planned hours",
        render: (row: Record<string, unknown>) =>
          row.plannedMinutes
            ? `${(Number(row.plannedMinutes) / 60).toFixed(1)} h`
            : "—",
      },
      {
        key: "dueOn",
        label: "Due",
        render: (row: Record<string, unknown>) => formatDate(row.dueOn),
      },
    ]
  if (section === "production")
    return [
      {
        key: "workDate",
        label: "Date",
        render: (row: Record<string, unknown>) => formatDate(row.workDate),
      },
      {
        key: "status",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "completedQuantity", label: "Completed" },
      { key: "acceptedQuantity", label: "Accepted" },
      {
        key: "labourMinutes",
        label: "Labour",
        render: (row: Record<string, unknown>) =>
          `${(Number(row.labourMinutes) / 60).toFixed(1)} h`,
      },
      { key: "reworkQuantity", label: "Rework" },
    ]
  if (section === "labour")
    return [
      {
        key: "workerId",
        label: "Worker",
        render: (row: Record<string, unknown>) => shortId(row.workerId),
      },
      {
        key: "effectiveFrom",
        label: "Effective",
        render: (row: Record<string, unknown>) => formatDate(row.effectiveFrom),
      },
      {
        key: "regularRateMinorPerHour",
        label: "Regular rate",
        render: (row: Record<string, unknown>) =>
          row.masked
            ? "Restricted"
            : formatMoney(row.regularRateMinorPerHour, row.currency),
      },
      {
        key: "overtimeRateMinorPerHour",
        label: "Overtime rate",
        render: (row: Record<string, unknown>) =>
          row.masked
            ? "Restricted"
            : formatMoney(row.overtimeRateMinorPerHour, row.currency),
      },
    ]
  if (section === "materials")
    return [
      { key: "code", label: "Code" },
      { key: "name", label: "Material" },
      { key: "unit", label: "Unit" },
      {
        key: "stock",
        label: "On hand",
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
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "equipment")
    return [
      { key: "name", label: "Equipment" },
      {
        key: "ownership",
        label: "Ownership",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.ownership)} />
        ),
      },
      {
        key: "rateMinor",
        label: "Rate",
        render: (row: Record<string, unknown>) =>
          `${formatMoney(row.rateMinor, row.currency)} / ${String(row.rateUnit).toLowerCase()}`,
      },
      {
        key: "active",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  if (section === "costs")
    return [
      {
        key: "occurredOn",
        label: "Date",
        render: (row: Record<string, unknown>) => formatDate(row.occurredOn),
      },
      {
        key: "category",
        label: "Category",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.category)} />
        ),
      },
      { key: "description", label: "Description" },
      {
        key: "status",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      {
        key: "committed",
        label: "Cost type",
        render: (row: Record<string, unknown>) =>
          row.committed ? "Committed" : "Actual",
      },
      {
        key: "amountMinor",
        label: "Amount",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.amountMinor, row.currency),
      },
    ]
  if (section === "forecast")
    return [
      { key: "versionNo", label: "Version" },
      {
        key: "asOfDate",
        label: "As of",
        render: (row: Record<string, unknown>) => formatDate(row.asOfDate),
      },
      {
        key: "status",
        label: "Status",
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
        label: "Profit",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.expectedProfitMinor, row.currency),
      },
      {
        key: "marginBasisPoints",
        label: "Margin",
        render: (row: Record<string, unknown>) =>
          `${(Number(row.marginBasisPoints) / 100).toFixed(1)}%`,
      },
    ]
  if (section === "sal")
    return [
      { key: "sequence", label: "SAL" },
      {
        key: "periodStart",
        label: "Period",
        render: (row: Record<string, unknown>) =>
          `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`,
      },
      {
        key: "status",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      {
        key: "grossMinor",
        label: "Gross",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.grossMinor, row.currency),
      },
      {
        key: "retentionMinor",
        label: "Retention",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.retentionMinor, row.currency),
      },
      {
        key: "approvedMinor",
        label: "Approved",
        render: (row: Record<string, unknown>) =>
          formatMoney(row.approvedMinor, row.currency),
      },
    ]
  if (section === "daily-reports")
    return [
      {
        key: "reportDate",
        label: "Date",
        render: (row: Record<string, unknown>) => formatDate(row.reportDate),
      },
      {
        key: "status",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={String(row.status)} />
        ),
      },
      { key: "summary", label: "Summary" },
      {
        key: "updatedAt",
        label: "Updated",
        render: (row: Record<string, unknown>) => formatDateTime(row.updatedAt),
      },
    ]
  if (section === "compliance")
    return [
      { key: "title", label: "Requirement" },
      { key: "credentialType", label: "Credential" },
      {
        key: "required",
        label: "Required",
        render: (row: Record<string, unknown>) => (row.required ? "Yes" : "No"),
      },
      {
        key: "expiresOn",
        label: "Expires",
        render: (row: Record<string, unknown>) => formatDate(row.expiresOn),
      },
      {
        key: "active",
        label: "Status",
        render: (row: Record<string, unknown>) => (
          <OperationsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ]
  return [
    { key: "title", label: labelize(section) },
    {
      key: "status",
      label: "Status",
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
