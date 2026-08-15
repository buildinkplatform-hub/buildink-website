import type { ReactNode } from "react"
import { Plus } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { BreadcrumbItem } from "@/components/ui/breadcrumb"
import { RetryButton } from "@/features/dashboard/components/marketplace-create"
import { BidLevelingTable } from "@/features/dashboard/components/bid-board-forms"
import { DocumentLink } from "@/features/dashboard/components/document-link"
import { MemberInviteForm } from "@/features/dashboard/components/member-invite-form"
import { MemberActions } from "@/features/dashboard/components/member-actions"
import { TenderCollaboration } from "@/features/dashboard/components/tender-collaboration"
import { EquipmentEnquiries } from "@/features/dashboard/components/equipment-enquiries"
import { EntityEditForm } from "@/features/dashboard/components/portal-entity-editors"
import { EquipmentForm } from "@/features/dashboard/components/equipment-form"
import { OpportunityForm } from "@/features/dashboard/components/opportunity-form"
import { ProjectForm } from "@/features/dashboard/components/project-form"
import { TenderForm } from "@/features/dashboard/components/tender-form"
import { ProjectLifecycleActions } from "@/features/dashboard/components/project-lifecycle-actions"
import { ProjectAdvancedFilters } from "@/features/dashboard/components/project-advanced-filters"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { VerificationSubmitClient } from "@/features/dashboard/components/verification-submit-client"
import { PortalDataTable } from "@/features/dashboard/components/portal-data-table"
import type { PortalTableColumn } from "@/features/dashboard/components/portal-data-table"
import { PortalFormDialog } from "@/features/dashboard/components/portal-form-dialog"
import { PermissionDeniedState } from "@/features/dashboard/components/permission-guard"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import {
  hasAnyPortalPermission,
  opportunityCreatePermissions,
  opportunityKinds,
  permittedOpportunityKinds,
  resolveEffectivePermissions,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"
import { CatalogueCreateForm } from "@/features/dashboard/components/portal-publish-forms"
import {
  getPortalBootstrap,
  getPortalProject,
  getPortalOpportunity,
  getPortalTender,
  getPortalEquipment,
  getPortalCatalogue,
  getPortalVerification,
  getPortalVerificationStatus,
  getTenderCollaboration,
  listPortalBidLeveling,
  listPortalCatalogue,
  listPortalEquipment,
  listPortalEquipmentEnquiries,
  listPortalMembers,
  listPortalOpportunities,
  listPortalProjects,
  listPortalTenders,
  listPortalTaxonomy,
  getWorkspacePermissions,
  type PortalVerificationOverview,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"
import type { PortalPageAction } from "@/features/dashboard/config/portal-routes"
import {
  portalCreatePath,
  portalDetailPath,
  portalEditPath,
  portalListPath,
} from "@/features/dashboard/config/portal-routes"
import { Link } from "@/i18n/navigation"

export type PortalQuery = {
  page: number
  kind?: string
  q?: string
  status?: string
  sort: "newest" | "title"
  scope: "owned" | "discover"
  categoryId?: string
  cityId?: string
  tagId?: string
  deadlineFrom?: string
  deadlineTo?: string
  action: PortalPageAction
  id?: string
}

type Translator = Awaited<ReturnType<typeof getTranslations>>

function formatPortalDate(value?: string | null, locale = "en") {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

function formatPortalMoney(
  minor?: string | null,
  currency?: string | null,
  locale = "en",
) {
  if (!minor) return "-"
  const amount = Number(minor) / 100
  if (!Number.isFinite(amount)) return "-"
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(amount)
}

function taxonomyName(
  items: Array<{ id: string; name?: string; label?: string; slug?: string; translations?: unknown }>,
  id: string | null | undefined,
  locale = "en",
) {
  if (!id) return "-"
  const item = items.find((entry) => entry.id === id)
  if (!item) return "-"
  if (item.name) return item.name
  if (item.label) return item.label
  if (item.translations && typeof item.translations === "object") {
    const translations = item.translations as Record<string, unknown>
    const translated = translations[locale] ?? translations.en
    if (typeof translated === "string") return translated
    if (translated && typeof translated === "object" && "name" in translated) {
      return String((translated as { name: unknown }).name)
    }
  }
  return item.slug ?? id
}

function portalActionsColumn(
  detailLabel: string,
): PortalTableColumn {
  return {
    id: "actions",
    header: "Actions",
    cellClassName: "w-[1%] whitespace-nowrap",
    render: (row) => (
      <div className="flex flex-wrap items-center gap-2">
        {row.detailHref ? (
          <Button asChild size="sm" variant="secondary">
            <Link href={row.detailHref}>{detailLabel}</Link>
          </Button>
        ) : null}
        {row.actions}
      </div>
    ),
  }
}

function scopePillClass(active: boolean) {
  return active
    ? "bg-primary text-white shadow-sm"
    : "border border-line bg-white text-brand-navy hover:bg-accent"
}

function tableLabels(t: Translator) {
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

const projectStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
  "ARCHIVED",
]
const opportunityStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "OPEN",
  "PAUSED",
  "CLOSED",
  "AWARDED",
  "FILLED",
  "CANCELLED",
  "ARCHIVED",
]
const tenderStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "OPEN",
  "CLOSED",
  "EVALUATION",
  "PENDING_AWARD_APPROVAL",
  "AWARDED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
]
const memberStatuses = ["ACTIVE", "INVITED", "PENDING", "SUSPENDED"]
const equipmentStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "SUSPENDED",
  "ARCHIVED",
]

function serverTableState(
  query: PortalQuery,
  pageInfo: {
    page: number
    pageSize: number
    total: number
    hasNextPage: boolean
  },
  statusOptions?: string[],
  sortOptions?: Array<"newest" | "title">,
) {
  return {
    query: query.q,
    status: query.status,
    sort: query.sort,
    statusOptions,
    sortOptions,
    pageInfo,
  }
}

/**
 * Members act under workspace permissions; personal accounts own their records
 * directly, so the equivalent create/edit rights are implied for them.
 */
/**
 * Personal (no-workspace) owners manage their own records end to end, so they
 * get the full project lifecycle set. Workspace members keep server-granted
 * permissions only.
 */
const projectPermissions: readonly CompanyPermission[] = [
  "projects.view",
  "projects.create",
  "projects.edit",
  "projects.publish",
  "projects.archive",
]
const tenderPermissions: readonly CompanyPermission[] = [
  "tenders.view",
  "tenders.create",
  "tenders.edit",
  "tenders.publish",
]
const equipmentPermissions: readonly CompanyPermission[] = [
  "equipment_requests.manage",
]

function effectivePermissions(
  bootstrap: Awaited<ReturnType<typeof getPortalBootstrap>>,
  personal: readonly CompanyPermission[],
) {
  return resolveEffectivePermissions({
    permissions: bootstrap?.entitlements.permissions ?? [],
    hasActiveWorkspace: Boolean(bootstrap?.activeWorkspace),
    personalPermissions: personal,
  })
}

export async function ProjectsModulePage({ query }: { query: PortalQuery }) {
  if (query.action === "create") return <ProjectsCreatePage />
  if (query.action === "edit" && query.id) {
    return <ProjectsEditPage id={query.id} />
  }
  if ((query.action === "detail" || query.id) && query.id) {
    return <ProjectsDetailPage query={query} />
  }
  return <ProjectsListPage query={query} />
}

async function ProjectsListPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const [result, categories, cities, tags] = await Promise.all([
    listPortalProjects({
      page: query.page,
      companyId,
      q: query.q,
      status: query.status,
      categoryId: query.categoryId,
      cityId: query.cityId,
      tagId: query.tagId,
      deadlineFrom: query.deadlineFrom,
      deadlineTo: query.deadlineTo,
      sort: query.sort,
    }).catch(() => null),
    listPortalTaxonomy("categories"),
    listPortalTaxonomy("cities"),
    listPortalTaxonomy("tags"),
  ])
  const canCreate = hasAnyPortalPermission(
    effectivePermissions(bootstrap, ["projects.create"]),
    ["projects.create"],
  )
  return (
    <DirectoryFrame
      title={t("dashboard.nav.projects")}
      description={t("dashboard.descriptions.projects")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        { label: t("dashboard.nav.projects") },
      ]}
      error={!result}
      retry={t("dashboard.retry")}
      actions={
        canCreate ? (
          <Button asChild>
            <Link href={portalCreatePath("projects")}>
              <Plus className="size-4" />
              {t("dashboard.publish.projectTitle")}
            </Link>
          </Button>
        ) : null
      }
    >
      {result ? (
        <PortalDataTable
          empty={t("dashboard.projectsEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, projectStatuses)}
          filters={
            <ProjectAdvancedFilters
              categories={categories.items}
              cities={cities.items}
              tags={tags.items}
              categoryId={query.categoryId}
              cityId={query.cityId}
              tagId={query.tagId}
              deadlineFrom={query.deadlineFrom}
              deadlineTo={query.deadlineTo}
              locale={locale}
              labels={{
                category: t("dashboard.publish.category"),
                tag: t("dashboard.publish.tags"),
                allCategories: t("dashboard.projects.allCategories"),
                allLocations: t("dashboard.projects.allLocations"),
                allTags: t("dashboard.projects.allTags"),
                deadlineFrom: t("dashboard.projects.deadlineFrom"),
                deadlineTo: t("dashboard.projects.deadlineTo"),
              }}
            />
          }
          columns={[
            {
              id: "project",
              header: "Project",
              className: "min-w-[280px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">
                    {(row.reference as string | null) || "-"}
                  </p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => <StatusBadge status={String(row.statusLabel ?? "DRAFT")} label={String(row.statusLabelText ?? row.statusLabel ?? "-")} />,
            },
            {
              id: "location",
              header: "Location",
              render: (row) => String(row.location ?? "-"),
            },
            {
              id: "budget",
              header: "Budget",
              render: (row) => String(row.budget ?? "-"),
            },
            {
              id: "deadline",
              header: "Proposal deadline",
              render: (row) => String(row.deadline ?? "-"),
            },
            {
              id: "packages",
              header: "Packages",
              render: (row) => (
                <span className="tabular-nums">{String(row.packages ?? "0")}</span>
              ),
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.title,
            reference: item.reference,
            statusLabel: item.status,
            statusLabelText: item.status.replaceAll("_", " "),
            location: taxonomyName(cities.items, item.cityId, locale),
            budget: formatPortalMoney(item.budgetMinor, item.currency, locale),
            deadline: formatPortalDate(item.deadlineAt, locale),
            packages: item.packageCount,
            statuses: [item.status, item.publicationStatus],
            detailHref: portalDetailPath("projects", item.id),
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

async function ProjectsCreatePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, ["projects.create"])
  if (!hasAnyPortalPermission(granted, ["projects.create"])) {
    return <PermissionDeniedState />
  }
  const [categories, tags] = await Promise.all([
    listPortalTaxonomy("categories"),
    listPortalTaxonomy("tags"),
  ])
  return (
    <DirectoryFrame
      title={t("dashboard.publish.projectTitle")}
      description={t("dashboard.descriptions.projects")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.projects"),
          href: portalListPath("projects"),
        },
        { label: t("dashboard.chrome.create") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <ProjectForm
        mode="create"
        categories={categories.items}
        tags={tags.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        profileId={bootstrap.profile.id}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
      />
    </DirectoryFrame>
  )
}

async function ProjectsEditPage({ id }: { id: string }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, projectPermissions)
  if (!hasAnyPortalPermission(granted, ["projects.edit"])) {
    return <PermissionDeniedState />
  }
  const [detail, categories, tags] = await Promise.all([
    getPortalProject(id),
    listPortalTaxonomy("categories"),
    listPortalTaxonomy("tags"),
  ])
  if (!detail) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.projectTitle")}
        description={t("dashboard.edit.notFound")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.projects"),
            href: portalListPath("projects"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        {null}
      </DirectoryFrame>
    )
  }
  return (
    <DirectoryFrame
      title={t("dashboard.edit.projectTitle")}
      description={t("dashboard.edit.projectDescription")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.projects"),
          href: portalListPath("projects"),
        },
        { label: detail.title, href: portalDetailPath("projects", detail.id) },
        { label: t("dashboard.chrome.edit") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <ProjectForm
        mode="edit"
        project={detail}
        categories={categories.items}
        tags={tags.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        profileId={bootstrap.profile.id}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
      />
    </DirectoryFrame>
  )
}

async function ProjectsDetailPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const detail = query.id ? await getPortalProject(query.id, query.page) : null
  const canEdit =
    Boolean(detail?.version) &&
    hasAnyPortalPermission(
      effectivePermissions(bootstrap, projectPermissions),
      ["projects.edit"],
    )
  return (
    <DirectoryFrame
      title={detail?.title ?? t("dashboard.nav.projects")}
      description={t("dashboard.descriptions.projects")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.projects"),
          href: portalListPath("projects"),
        },
        { label: detail?.title ?? t("dashboard.chrome.detail") },
      ]}
      retry={t("dashboard.retry")}
      error={!detail}
    >
      {detail ? (
        <div className="space-y-3">
          <DetailPanel
            title={detail.title}
            statuses={[detail.status, detail.publicationStatus]}
            backHref={portalListPath("projects")}
            backLabel={t("common.back")}
            actions={
              canEdit ? (
                <Button asChild variant="secondary">
                  <Link href={portalEditPath("projects", detail.id)}>
                    {t("dashboard.edit.open")}
                  </Link>
                </Button>
              ) : null
            }
          />
          <EntityDetailFields
            entity="project"
            data={detail as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
            locale={locale}
          />
          {detail.version ? (
            <ProjectLifecycleActions
              id={detail.id}
              version={detail.version}
              status={detail.status}
              permissions={effectivePermissions(bootstrap, projectPermissions)}
            />
          ) : null}
          {detail.packages.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.projects.packages")}
              </h2>
              {detail.packages.map((item) => (
                <Card key={item.id} className="p-3">
                  <p className="font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="text-muted mt-1 text-sm">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="text-muted mt-1 text-xs">
                    {[item.quantity, item.unit, item.budgetMinor, item.currency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Card>
              ))}
            </section>
          ) : null}
          {detail.criteria.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.projects.criteria")}
              </h2>
              {detail.criteria.map((item) => (
                <Card key={item.id} className="p-3">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-muted text-xs">
                    {item.kind} · {item.weight}% ·{" "}
                    {item.required
                      ? t("common.required")
                      : t("common.optional")}
                  </p>
                </Card>
              ))}
            </section>
          ) : null}
          {detail.media.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.projects.documents")}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {detail.media.map((item) => (
                  <Card key={item.assetId} className="p-3">
                    <DocumentLink assetId={item.assetId} label={item.name} />
                    <p className="text-muted mt-1 text-xs">
                      {item.usage} · {item.position + 1}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

export async function OpportunitiesModulePage({
  query,
}: {
  query: PortalQuery
}) {
  if (query.action === "create") return <OpportunitiesCreatePage />
  if (query.action === "edit" && query.id) {
    return <OpportunitiesEditPage id={query.id} />
  }
  if ((query.action === "detail" || query.id) && query.id) {
    return <OpportunitiesDetailPage query={query} />
  }
  return <OpportunitiesListPage query={query} />
}

async function OpportunitiesListPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const result = await listPortalOpportunities({
    page: query.page,
    kind: query.kind,
    scope: query.scope,
    q: query.q,
    status: query.status,
    sort: query.sort,
  }).catch(() => null)
  const granted = effectivePermissions(bootstrap, opportunityCreatePermissions)
  const canCreate = permittedOpportunityKinds(granted).length > 0
  const kindQuery = query.kind ? `&kind=${query.kind}` : ""
  return (
    <DirectoryFrame
      title={t("dashboard.nav.opportunities")}
      description={t("dashboard.descriptions.opportunities")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        { label: t("dashboard.nav.opportunities") },
      ]}
      error={!result}
      retry={t("dashboard.retry")}
      actions={
        canCreate ? (
          <Button asChild>
            <Link href={portalCreatePath("opportunities")}>
              <Plus className="size-4" />
              {t("dashboard.publish.opportunityTitle")}
            </Link>
          </Button>
        ) : null
      }
    >
      {result ? (
        <PortalDataTable
          empty={t("dashboard.opportunitiesEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, opportunityStatuses)}
          filters={
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/opportunities?scope=owned${kindQuery}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${scopePillClass(query.scope !== "discover")}`}
                >
                  {t("dashboard.scope.owned")}
                </Link>
                <Link
                  href={`/dashboard/opportunities?scope=discover${kindQuery}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${scopePillClass(query.scope === "discover")}`}
                >
                  {t("dashboard.scope.discover")}
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {opportunityKinds.map((kind) => (
                  <Link
                    key={kind}
                    href={`/dashboard/opportunities?kind=${kind}`}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      query.kind === kind
                        ? "bg-primary text-white shadow-sm"
                        : "border border-line bg-white text-brand-navy hover:bg-light-blue/70"
                    }`}
                  >
                    {t(`dashboard.kinds.${kind}`)}
                  </Link>
                ))}
              </div>
            </div>
          }
          columns={[
            {
              id: "opportunity",
              header: "Opportunity",
              className: "min-w-[280px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">
                    {(row.reference as string | null) || "-"}
                  </p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => <StatusBadge status={String(row.statusLabel ?? "DRAFT")} label={String(row.statusLabelText ?? row.statusLabel ?? "-")} />,
            },
            {
              id: "kind",
              header: "Type",
              render: (row) => String(row.kindLabel ?? "-"),
            },
            {
              id: "budget",
              header: "Budget",
              render: (row) => String(row.budget ?? "-"),
            },
            {
              id: "deadline",
              header: "Deadline",
              render: (row) => String(row.deadline ?? "-"),
            },
            {
              id: "responses",
              header: "Responses",
              render: (row) => String(row.responses ?? "0"),
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.title,
            reference: item.reference,
            statusLabel: item.statusV1 ?? item.publicationStatus,
            statusLabelText: (item.statusV1 ?? item.publicationStatus ?? "-").replaceAll("_", " "),
            kindLabel: item.kind ? t(`dashboard.kinds.${item.kind}`) : "-",
            budget:
              item.budgetMinMinor || item.budgetMaxMinor
                ? `${formatPortalMoney(item.budgetMinMinor, item.currency, locale)}${item.budgetMaxMinor ? ` - ${formatPortalMoney(item.budgetMaxMinor, item.currency, locale)}` : ""}`
                : "-",
            deadline: formatPortalDate(item.deadlineAt, locale),
            responses: item.offerCount + item.applicationCount,
            statuses: [item.kind, item.statusV1 ?? item.publicationStatus],
            detailHref: portalDetailPath("opportunities", item.id),
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

async function OpportunitiesCreatePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, opportunityCreatePermissions)
  const allowedKinds = permittedOpportunityKinds(granted)
  if (!allowedKinds.length) return <PermissionDeniedState />
  const [categories, professions] = await Promise.all([
    listPortalTaxonomy("categories"),
    listPortalTaxonomy("professions"),
  ])
  return (
    <DirectoryFrame
      title={t("dashboard.publish.opportunityTitle")}
      description={t("dashboard.descriptions.opportunities")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.opportunities"),
          href: portalListPath("opportunities"),
        },
        { label: t("dashboard.chrome.create") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <OpportunityForm
        mode="create"
        categories={categories.items}
        professions={professions.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
        allowedKinds={allowedKinds}
      />
    </DirectoryFrame>
  )
}

async function OpportunitiesEditPage({ id }: { id: string }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, opportunityCreatePermissions)
  const allowedKinds = permittedOpportunityKinds(granted)
  if (!allowedKinds.length) return <PermissionDeniedState />
  const [detail, categories, professions] = await Promise.all([
    getPortalOpportunity(id).catch(() => null),
    listPortalTaxonomy("categories"),
    listPortalTaxonomy("professions"),
  ])
  if (!detail) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.opportunityTitle")}
        description={t("dashboard.edit.notFound")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.opportunities"),
            href: portalListPath("opportunities"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        {null}
      </DirectoryFrame>
    )
  }
  return (
    <DirectoryFrame
      title={t("dashboard.edit.opportunityTitle")}
      description={t("dashboard.edit.opportunityDescription")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.opportunities"),
          href: portalListPath("opportunities"),
        },
        {
          label: detail.title,
          href: portalDetailPath("opportunities", detail.id),
        },
        { label: t("dashboard.chrome.edit") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <OpportunityForm
        mode="edit"
        opportunity={detail}
        categories={categories.items}
        professions={professions.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
        allowedKinds={allowedKinds}
      />
    </DirectoryFrame>
  )
}

async function OpportunitiesDetailPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const detail = query.id
    ? await getPortalOpportunity(query.id, query.page).catch(() => null)
    : null
  const granted = effectivePermissions(bootstrap, opportunityCreatePermissions)
  const canEdit =
    Boolean(detail?.version) &&
    permittedOpportunityKinds(granted).some(
      (kind) => !detail?.kind || kind === detail.kind,
    )
  return (
    <DirectoryFrame
      title={detail?.title ?? t("dashboard.nav.opportunities")}
      description={t("dashboard.descriptions.opportunities")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.opportunities"),
          href: portalListPath("opportunities"),
        },
        { label: detail?.title ?? t("dashboard.chrome.detail") },
      ]}
      retry={t("dashboard.retry")}
      error={!detail}
    >
      {detail ? (
        <div className="space-y-3">
          <DetailPanel
            title={detail.title}
            statuses={[
              detail.kind,
              detail.statusV1 ?? detail.publicationStatus,
            ]}
            backHref={portalListPath("opportunities")}
            backLabel={t("common.back")}
            actions={
              canEdit ? (
                <Button asChild variant="secondary">
                  <Link href={portalEditPath("opportunities", detail.id)}>
                    {t("dashboard.edit.open")}
                  </Link>
                </Button>
              ) : null
            }
          />
          <EntityDetailFields
            entity="opportunity"
            data={detail as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

export async function TendersModulePage({ query }: { query: PortalQuery }) {
  if (query.action === "create") return <TendersCreatePage />
  if (query.action === "edit" && query.id) {
    return <TendersEditPage id={query.id} />
  }
  if ((query.action === "detail" || query.id) && query.id) {
    return <TendersDetailPage query={query} />
  }
  return <TendersListPage query={query} />
}

async function TendersListPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const result = await listPortalTenders({
    page: query.page,
    scope: query.scope,
    q: query.q,
    status: query.status,
    sort: query.sort,
  }).catch(() => null)
  const canCreate = hasAnyPortalPermission(
    effectivePermissions(bootstrap, ["tenders.create"]),
    ["tenders.create"],
  )
  return (
    <DirectoryFrame
      title={t("dashboard.nav.tenders")}
      description={t("dashboard.descriptions.tenders")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        { label: t("dashboard.nav.tenders") },
      ]}
      error={!result}
      retry={t("dashboard.retry")}
      actions={
        canCreate ? (
          <Button asChild>
            <Link href={portalCreatePath("tenders")}>
              <Plus className="size-4" />
              {t("dashboard.publish.tenderTitle")}
            </Link>
          </Button>
        ) : null
      }
    >
      {result ? (
        <PortalDataTable
          empty={t("dashboard.tendersEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, tenderStatuses)}
          filters={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/tenders?scope=owned"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${scopePillClass(query.scope !== "discover")}`}
              >
                {t("dashboard.scope.owned")}
              </Link>
              <Link
                href="/dashboard/tenders?scope=discover"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${scopePillClass(query.scope === "discover")}`}
              >
                {t("dashboard.scope.discover")}
              </Link>
            </div>
          }
          columns={[
            {
              id: "tender",
              header: "Tender",
              className: "min-w-[280px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">
                    {(row.reference as string | null) || "-"}
                  </p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => <StatusBadge status={String(row.statusLabel ?? "DRAFT")} label={String(row.statusLabelText ?? row.statusLabel ?? "-")} />,
            },
            {
              id: "method",
              header: "Method",
              render: (row) => String(row.method ?? "-"),
            },
            {
              id: "value",
              header: "Estimated value",
              render: (row) => String(row.value ?? "-"),
            },
            {
              id: "deadline",
              header: "Submission deadline",
              render: (row) => String(row.deadline ?? "-"),
            },
            {
              id: "lots",
              header: "Lots",
              render: (row) => <span className="tabular-nums">{String(row.lots ?? "0")}</span>,
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.title,
            reference: item.reference,
            statusLabel: item.status,
            statusLabelText: item.status.replaceAll("_", " "),
            method: item.procurementMethod?.replaceAll("_", " ") ?? "-",
            value: formatPortalMoney(item.valueMinor, item.currency, locale),
            deadline: formatPortalDate(item.submissionDeadlineAt, locale),
            lots: item.lotCount,
            secondary: item.eligibleForOffer
              ? t("dashboard.create.submitOffer")
              : item.sourceUrl
                ? t("dashboard.tenders.external")
                : t("dashboard.tenders.externalBlocked"),
            statuses: [
              item.status,
              item.sourceKind,
              item.submissionChannel,
              item.visibility,
            ],
            detailHref: portalDetailPath("tenders", item.id),
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

async function TendersCreatePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, ["tenders.create"])
  if (!hasAnyPortalPermission(granted, ["tenders.create"])) {
    return <PermissionDeniedState />
  }
  const categories = await listPortalTaxonomy("categories")
  return (
    <DirectoryFrame
      title={t("dashboard.publish.tenderTitle")}
      description={t("dashboard.descriptions.tenders")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.tenders"),
          href: portalListPath("tenders"),
        },
        { label: t("dashboard.chrome.create") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <TenderForm
        mode="create"
        categories={categories.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
      />
    </DirectoryFrame>
  )
}

async function TendersEditPage({ id }: { id: string }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, tenderPermissions)
  if (!hasAnyPortalPermission(granted, ["tenders.edit"])) {
    return <PermissionDeniedState />
  }
  const [detail, categories] = await Promise.all([
    getPortalTender(id).catch(() => null),
    listPortalTaxonomy("categories"),
  ])
  if (!detail) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.tenderTitle")}
        description={t("dashboard.edit.notFound")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.tenders"),
            href: portalListPath("tenders"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        {null}
      </DirectoryFrame>
    )
  }
  return (
    <DirectoryFrame
      title={t("dashboard.edit.tenderTitle")}
      description={t("dashboard.edit.tenderDescription")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.tenders"),
          href: portalListPath("tenders"),
        },
        { label: detail.title, href: portalDetailPath("tenders", detail.id) },
        { label: t("dashboard.chrome.edit") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <TenderForm
        mode="edit"
        tender={detail}
        categories={categories.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
        isProjectOwner={bootstrap.profile.primaryAccountType === "PROJECT_OWNER"}
      />
    </DirectoryFrame>
  )
}

async function TendersDetailPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const detail = query.id
    ? await getPortalTender(query.id, query.page).catch(() => null)
    : null
  const collaboration = query.id
    ? await getTenderCollaboration(query.id).catch(() => null)
    : null
  const canManage = Boolean(
    detail &&
      bootstrap &&
      (detail.createdById === bootstrap.profile.id ||
        (detail.organizationCompanyId != null &&
          bootstrap.workspaces.some(
            (workspace) =>
              workspace.companyId === detail.organizationCompanyId,
          ))),
  )
  const canEdit =
    Boolean(detail?.version) &&
    hasAnyPortalPermission(
      effectivePermissions(bootstrap, tenderPermissions),
      ["tenders.edit"],
    )
  const levelingRows =
    detail && canManage ? await listPortalBidLeveling(detail.id) : { items: [] }
  const activeCompanyId = getActiveCompanyId(bootstrap?.workspaces)
  return (
    <DirectoryFrame
      title={detail?.title ?? t("dashboard.nav.tenders")}
      description={t("dashboard.descriptions.tenders")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.tenders"),
          href: portalListPath("tenders"),
        },
        { label: detail?.title ?? t("dashboard.chrome.detail") },
      ]}
      retry={t("dashboard.retry")}
      error={!detail}
    >
      {detail ? (
        <div className="space-y-3">
          <DetailPanel
            title={detail.title}
            statuses={[
              detail.sourceKind,
              detail.submissionChannel,
              detail.publicationStatus,
            ]}
            backHref={portalListPath("tenders")}
            backLabel={t("common.back")}
            actions={
              canEdit ? (
                <Button asChild variant="secondary">
                  <Link href={portalEditPath("tenders", detail.id)}>
                    {t("dashboard.edit.open")}
                  </Link>
                </Button>
              ) : null
            }
          />
          <EntityDetailFields
            entity="tender"
            data={detail as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
          />
          {detail.eligibleForOffer ? (
            <Link
              href="/dashboard/offers"
              className="text-primary text-sm font-semibold"
            >
              {t("dashboard.create.submitOffer")}
            </Link>
          ) : detail.sourceUrl ? (
            <a
              href={detail.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm font-semibold"
            >
              {t("dashboard.tenders.external")}
            </a>
          ) : (
            <p className="text-muted text-sm">
              {t("dashboard.tenders.externalBlocked")}
            </p>
          )}
          {detail.lots.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.fields.lots")}
              </h2>
              {detail.lots.map((lot) => (
                <Card key={lot.id} className="p-3">
                  <p className="font-semibold">{lot.title}</p>
                  {lot.description ? (
                    <p className="text-muted mt-1 text-sm">{lot.description}</p>
                  ) : null}
                  <p className="text-muted mt-1 text-xs">
                    {[lot.reference, lot.valueMinor, lot.currency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Card>
              ))}
            </section>
          ) : null}
          {detail.criteria.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.fields.criteria")}
              </h2>
              {detail.criteria.map((item) => (
                <Card key={item.id} className="p-3">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-muted text-xs">
                    {item.kind} · {item.weight}% ·{" "}
                    {item.required
                      ? t("common.required")
                      : t("common.optional")}
                  </p>
                </Card>
              ))}
            </section>
          ) : null}
          {canManage ? <BidLevelingTable rows={levelingRows.items} /> : null}
          {collaboration ? (
            <TenderCollaboration
              collaboration={collaboration}
              companyId={activeCompanyId}
            />
          ) : null}
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

export async function MembersModulePage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const result = companyId
    ? await listPortalMembers(companyId, {
        page: query.page,
        q: query.q,
        status: query.status,
        sort: query.sort,
      }).catch(() => null)
    : {
        items: [],
        pageInfo: { page: 1, pageSize: 10, total: 0, hasNextPage: false },
      }
  const detail = query.id
    ? result?.items.find((item) => item.id === query.id)
    : undefined
  const permissions = companyId
    ? await getWorkspacePermissions(companyId)
    : null
  return (
    <DirectoryFrame
      title={t("dashboard.nav.members")}
      description={t("dashboard.descriptions.members")}
      error={companyId ? !result : false}
      retry={t("dashboard.retry")}
      empty={!result?.items.length ? t("dashboard.membersEmpty") : undefined}
    >
      {companyId &&
      !query.id &&
      permissions?.permissions.includes("team.invite") ? (
        <PortalFormDialog
          triggerLabel={t("dashboard.inviteMemberSend")}
          title={t("dashboard.inviteMemberSend")}
          description={t("dashboard.descriptions.members")}
        >
          <MemberInviteForm companyId={companyId} />
        </PortalFormDialog>
      ) : null}
      {permissions?.permissions.length ? (
        <p className="text-muted mb-4 text-sm">
          {t("dashboard.members.permissions", {
            count: permissions.permissions.length,
          })}
        </p>
      ) : null}
      {detail ? (
        <DetailPanel
          title={detail.displayName ?? detail.invitationEmail ?? detail.role}
          statuses={[
            detail.role,
            detail.status,
            detail.title,
            detail.department,
          ].filter((value): value is string => Boolean(value))}
          backHref="/dashboard/members"
          backLabel={t("common.back")}
        />
      ) : result ? (
        <PortalDataTable
          empty={t("dashboard.membersEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, memberStatuses)}
          columns={[
            {
              id: "member",
              header: "Member",
              className: "min-w-[240px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">{String(row.email ?? "-")}</p>
                </div>
              ),
            },
            {
              id: "role",
              header: "Role",
              render: (row) => String(row.roleLabel ?? "-"),
            },
            {
              id: "jobTitle",
              header: "Job title",
              render: (row) => String(row.jobTitle ?? "-"),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => <StatusBadge status={String(row.statusLabel ?? "PENDING")} label={String(row.statusLabelText ?? row.statusLabel ?? "-")} />,
            },
            {
              id: "joined",
              header: "Joined",
              render: (row) => String(row.joined ?? "-"),
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.displayName ?? item.invitationEmail ?? item.role,
            email: item.invitationEmail,
            roleLabel: item.role.replaceAll("_", " "),
            jobTitle: [item.title, item.department].filter(Boolean).join(" - ") || "-",
            statusLabel: item.status,
            statusLabelText: item.status.replaceAll("_", " "),
            joined: item.joinedAt ? formatPortalDate(item.joinedAt) : "-",
            statuses: [item.role, item.status],
            detailHref: `/dashboard/members/${item.id}`,
            actions:
              companyId &&
              (permissions?.permissions.includes("team.role.manage") ||
                permissions?.permissions.includes("team.remove")) ? (
                <MemberActions
                  companyId={companyId}
                  membershipId={item.id}
                  name={item.displayName ?? item.invitationEmail ?? item.role}
                  role={item.role}
                  title={item.title}
                  department={item.department}
                  version={item.version}
                  canEdit={Boolean(
                    permissions?.permissions.includes("team.role.manage"),
                  )}
                  canRemove={Boolean(
                    permissions?.permissions.includes("team.remove"),
                  )}
                />
              ) : undefined,
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

export async function CatalogueModulePage({ query }: { query: PortalQuery }) {
  if (query.action === "create") return <CatalogueCreatePage />
  if (query.action === "edit" && query.id) {
    return <CatalogueEditPage id={query.id} />
  }
  if ((query.action === "detail" || query.id) && query.id) {
    return <CatalogueDetailPage query={query} />
  }
  return <CatalogueListPage query={query} />
}

async function CatalogueListPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const [result, categories] = await Promise.all([
    companyId
      ? listPortalCatalogue(companyId, {
          page: query.page,
          q: query.q,
          sort: query.sort,
        }).catch(() => null)
      : Promise.resolve({
          items: [],
          pageInfo: { page: 1, pageSize: 10, total: 0, hasNextPage: false },
        }),
    listPortalTaxonomy("categories"),
  ])
  return (
    <DirectoryFrame
      title={t("dashboard.nav.catalogue")}
      description={t("dashboard.descriptions.catalogue")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        { label: t("dashboard.nav.catalogue") },
      ]}
      error={companyId ? !result : false}
      retry={t("dashboard.retry")}
      empty={!result?.items.length ? t("dashboard.catalogueEmpty") : undefined}
      actions={
        companyId ? (
          <Button asChild>
            <Link href={portalCreatePath("catalogue")}>
              <Plus className="size-4" />
              {t("dashboard.publish.catalogueTitle")}
            </Link>
          </Button>
        ) : null
      }
    >
      {result ? (
        <PortalDataTable
          empty={t("dashboard.catalogueEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, undefined, [
            "title",
          ])}
          columns={[
            {
              id: "item",
              header: "Item",
              className: "min-w-[260px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="line-clamp-2 text-xs text-muted">
                    {String(row.description ?? "-")}
                  </p>
                </div>
              ),
            },
            {
              id: "type",
              header: "Type",
              render: (row) => String(row.offeringTypeLabel ?? "-"),
            },
            {
              id: "category",
              header: "Category",
              render: (row) => String(row.categoryLabel ?? "-"),
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            offeringTypeLabel: item.offeringType.replaceAll("_", " "),
            categoryLabel: taxonomyName(categories.items, item.categoryId, locale),
            statuses: [item.offeringType],
            detailHref: portalDetailPath("catalogue", item.id),
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

async function CatalogueCreatePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const categories = await listPortalTaxonomy("categories")
  return (
    <DirectoryFrame
      title={t("dashboard.publish.catalogueTitle")}
      description={t("dashboard.descriptions.catalogue")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.catalogue"),
          href: portalListPath("catalogue"),
        },
        { label: t("dashboard.chrome.create") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      {companyId ? (
        <CatalogueCreateForm
          companyId={companyId}
          categories={categories.items}
        />
      ) : (
        <PermissionDeniedState />
      )}
    </DirectoryFrame>
  )
}

async function CatalogueEditPage({ id }: { id: string }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const detail = companyId ? await getPortalCatalogue(companyId, id).catch(() => null) : null
  if (!companyId) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.catalogueTitle")}
        description={t("dashboard.descriptions.catalogue")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.catalogue"),
            href: portalListPath("catalogue"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        <PermissionDeniedState />
      </DirectoryFrame>
    )
  }
  if (!detail) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.catalogueTitle")}
        description={t("dashboard.edit.notFound")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.catalogue"),
            href: portalListPath("catalogue"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        {null}
      </DirectoryFrame>
    )
  }
  return (
    <DirectoryFrame
      title={t("dashboard.edit.catalogueTitle")}
      description={t("dashboard.descriptions.catalogue")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.catalogue"),
          href: portalListPath("catalogue"),
        },
        { label: detail.name, href: portalDetailPath("catalogue", detail.id) },
        { label: t("dashboard.chrome.edit") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <EntityEditForm
        entity="catalogue"
        id={detail.id}
        version={detail.version ?? 1}
        companyId={companyId}
        initial={{
          name: detail.name,
          description: detail.description ?? "",
        }}
      />
    </DirectoryFrame>
  )
}

async function CatalogueDetailPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const detail =
    companyId && query.id
      ? await getPortalCatalogue(companyId, query.id).catch(() => null)
      : null
  return (
    <DirectoryFrame
      title={detail?.name ?? t("dashboard.nav.catalogue")}
      description={t("dashboard.descriptions.catalogue")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.catalogue"),
          href: portalListPath("catalogue"),
        },
        { label: detail?.name ?? t("dashboard.chrome.detail") },
      ]}
      retry={t("dashboard.retry")}
      error={!detail}
    >
      {detail ? (
        <div className="space-y-3">
          <DetailPanel
            title={detail.name}
            statuses={[detail.offeringType]}
            backHref={portalListPath("catalogue")}
            backLabel={t("common.back")}
            actions={
              companyId && detail.version ? (
                <Button asChild variant="secondary">
                  <Link href={portalEditPath("catalogue", detail.id)}>
                    {t("dashboard.edit.open")}
                  </Link>
                </Button>
              ) : null
            }
          />
          <EntityDetailFields
            entity="catalogue"
            data={detail as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

export async function EquipmentModulePage({ query }: { query: PortalQuery }) {
  if (query.action === "create") return <EquipmentCreatePage />
  if (query.action === "edit" && query.id) {
    return <EquipmentEditPage id={query.id} />
  }
  if ((query.action === "detail" || query.id) && query.id) {
    return <EquipmentDetailPage query={query} />
  }
  return <EquipmentListPage query={query} />
}

async function EquipmentListPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const [result, submittedEnquiries, receivedEnquiries] = await Promise.all([
    listPortalEquipment({
      page: query.page,
      companyId,
      q: query.q,
      status: query.status,
      sort: query.sort,
    }).catch(() => null),
    listPortalEquipmentEnquiries(),
    companyId
      ? listPortalEquipmentEnquiries(companyId)
      : Promise.resolve({ items: [] }),
  ])
  const canCreate = hasAnyPortalPermission(
    effectivePermissions(bootstrap, equipmentPermissions),
    equipmentPermissions,
  )
  return (
    <DirectoryFrame
      title={t("dashboard.nav.equipment")}
      description={t("dashboard.descriptions.equipment")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        { label: t("dashboard.nav.equipment") },
      ]}
      error={!result}
      retry={t("dashboard.retry")}
      actions={
        canCreate ? (
          <Button asChild>
            <Link href={portalCreatePath("equipment")}>
              <Plus className="size-4" />
              {t("dashboard.publish.equipmentTitle")}
            </Link>
          </Button>
        ) : null
      }
    >
      <EquipmentEnquiries
        submitted={submittedEnquiries.items}
        received={receivedEnquiries.items}
        companyId={companyId}
      />
      {result ? (
        <PortalDataTable
          empty={t("dashboard.equipmentEmpty")}
          labels={tableLabels(t)}
          server={serverTableState(query, result.pageInfo, equipmentStatuses)}
          columns={[
            {
              id: "equipment",
              header: "Equipment",
              className: "min-w-[260px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-brand-navy">{row.title}</p>
                  <p className="text-xs text-muted">{String(row.modelLabel ?? "-")}</p>
                </div>
              ),
            },
            {
              id: "type",
              header: "Type",
              render: (row) => String(row.listingTypeLabel ?? "-"),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => <StatusBadge status={String(row.statusLabel ?? "DRAFT")} label={String(row.statusLabelText ?? row.statusLabel ?? "-")} />,
            },
            {
              id: "condition",
              header: "Condition",
              render: (row) => String(row.conditionLabel ?? "-"),
            },
            {
              id: "pricing",
              header: "Pricing",
              render: (row) => String(row.pricing ?? "-"),
            },
            portalActionsColumn(tableLabels(t).details),
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.name,
            modelLabel: [item.brand, item.model].filter(Boolean).join(" - ") || item.serialNumber || "-",
            listingTypeLabel: item.listingType.replaceAll("_", " "),
            statusLabel: item.status,
            statusLabelText: item.status.replaceAll("_", " "),
            conditionLabel: item.condition?.replaceAll("_", " ") ?? "-",
            pricing:
              item.dailyRateMinor
                ? formatPortalMoney(item.dailyRateMinor, item.currency, locale)
                : item.salePriceMinor
                  ? formatPortalMoney(item.salePriceMinor, item.currency, locale)
                  : "-",
            statuses: [item.listingType, item.status, item.publicationStatus],
            detailHref: portalDetailPath("equipment", item.id),
          }))}
        />
      ) : null}
    </DirectoryFrame>
  )
}

async function EquipmentCreatePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, equipmentPermissions)
  if (!hasAnyPortalPermission(granted, equipmentPermissions)) {
    return <PermissionDeniedState />
  }
  const categories = await listPortalTaxonomy("categories")
  return (
    <DirectoryFrame
      title={t("dashboard.publish.equipmentTitle")}
      description={t("dashboard.descriptions.equipment")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.equipment"),
          href: portalListPath("equipment"),
        },
        { label: t("dashboard.chrome.create") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <EquipmentForm
        mode="create"
        categories={categories.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
      />
    </DirectoryFrame>
  )
}

async function EquipmentEditPage({ id }: { id: string }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  if (!bootstrap) return null
  const granted = effectivePermissions(bootstrap, equipmentPermissions)
  if (!hasAnyPortalPermission(granted, equipmentPermissions)) {
    return <PermissionDeniedState />
  }
  const [detail, categories] = await Promise.all([
    getPortalEquipment(id).catch(() => null),
    listPortalTaxonomy("categories"),
  ])
  if (!detail) {
    return (
      <DirectoryFrame
        title={t("dashboard.edit.equipmentTitle")}
        description={t("dashboard.edit.notFound")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.equipment"),
            href: portalListPath("equipment"),
          },
        ]}
        retry={t("dashboard.retry")}
      >
        {null}
      </DirectoryFrame>
    )
  }
  return (
    <DirectoryFrame
      title={t("dashboard.edit.equipmentTitle")}
      description={t("dashboard.edit.equipmentDescription")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.equipment"),
          href: portalListPath("equipment"),
        },
        {
          label: detail.name,
          href: portalDetailPath("equipment", detail.id),
        },
        { label: t("dashboard.chrome.edit") },
      ]}
      retry={t("dashboard.retry")}
      framed={false}
    >
      <EquipmentForm
        mode="edit"
        equipment={detail}
        categories={categories.items}
        companyId={getActiveCompanyId(bootstrap.workspaces)}
      />
    </DirectoryFrame>
  )
}

async function EquipmentDetailPage({ query }: { query: PortalQuery }) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const detail = query.id
    ? await getPortalEquipment(query.id).catch(() => null)
    : null
  const canEdit =
    Boolean(detail?.version) &&
    hasAnyPortalPermission(
      effectivePermissions(bootstrap, equipmentPermissions),
      equipmentPermissions,
    )
  return (
    <DirectoryFrame
      title={detail?.name ?? t("dashboard.nav.equipment")}
      description={t("dashboard.descriptions.equipment")}
      breadcrumbs={[
        { label: t("common.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.nav.equipment"),
          href: portalListPath("equipment"),
        },
        { label: detail?.name ?? t("dashboard.chrome.detail") },
      ]}
      retry={t("dashboard.retry")}
      error={!detail}
    >
      {detail ? (
        <div className="space-y-3">
          <DetailPanel
            title={detail.name}
            statuses={[
              detail.listingType,
              detail.status,
              detail.publicationStatus,
            ]}
            backHref={portalListPath("equipment")}
            backLabel={t("common.back")}
            actions={
              canEdit ? (
                <Button asChild variant="secondary">
                  <Link href={portalEditPath("equipment", detail.id)}>
                    {t("dashboard.edit.open")}
                  </Link>
                </Button>
              ) : null
            }
          />
          <EntityDetailFields
            entity="equipment"
            data={detail as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

export async function VerificationModulePage() {
  const t = await getTranslations()
  const [overview, status] = await Promise.all([
    getPortalVerification(),
    getPortalVerificationStatus(),
  ])
  return (
    <DirectoryFrame
      title={t("dashboard.nav.verification")}
      description={t("dashboard.descriptions.verification")}
      error={!overview && !status}
      retry={t("dashboard.retry")}
    >
      {overview ? <VerificationOverview overview={overview} /> : null}
      {status ? (
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-brand-navy text-lg font-semibold">
              {t("dashboard.verification.status")}: {status.verificationStatus}
            </p>
            {status.submission ? (
              <p className="text-muted mt-2 text-sm">
                {t("dashboard.verification.submission")}:{" "}
                {status.submission.status}
              </p>
            ) : null}
          </Card>
          {status.submission?.checklist.length ? (
            <Card className="space-y-3 p-5">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.verification.checklist")}
              </h2>
              {status.submission.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.label}</span>
                  <span>{item.fulfilled ? "✓" : "—"}</span>
                </div>
              ))}
            </Card>
          ) : null}
          {status.openIssues.length ? (
            <Card className="space-y-3 border-amber-200 bg-amber-50/70 p-5">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.verification.openIssues")}
              </h2>
              {status.openIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border bg-white p-3 text-sm"
                >
                  <p className="font-semibold">{issue.title}</p>
                  {issue.description ? (
                    <p className="text-muted mt-1">{issue.description}</p>
                  ) : null}
                </div>
              ))}
            </Card>
          ) : null}
          {status.submission?.decisions.length ? (
            <Card className="space-y-3 p-5">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.verification.decisions")}
              </h2>
              {status.submission.decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-xl border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {decision.decision.replaceAll("_", " ")}
                    </span>
                    <span className="text-muted text-xs">
                      {new Date(decision.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted mt-1">
                    {t("dashboard.verification.reviewer")}: {decision.reviewer}
                  </p>
                  {decision.reason ? (
                    <p className="mt-2 text-slate-700">{decision.reason}</p>
                  ) : null}
                </div>
              ))}
            </Card>
          ) : null}
          <VerificationSubmitPanel
            documentIds={status.documents.map((item) => item.id)}
          />
          <PortalDataTable
            empty={t("dashboard.documentsEmpty")}
            labels={tableLabels(t)}
            rows={status.documents.map((item) => ({
              id: item.id,
              title: item.originalName,
              secondary: item.expiresAt
                ? `${t("dashboard.documents.expires")} ${item.expiresAt}`
                : undefined,
              statuses: [item.documentType ?? "", item.status],
              actions: (
                <DocumentLink assetId={item.id} label={item.originalName} />
              ),
            }))}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

async function VerificationOverview({
  overview,
}: {
  overview: PortalVerificationOverview
}) {
  const t = await getTranslations()
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <p className="text-muted text-xs">{t("dashboard.trust.status")}</p>
          <p className="text-brand-navy mt-1 font-semibold">
            {overview.verificationStatus.replaceAll("_", " ")}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-muted text-xs">
            {t("dashboard.trust.accountType")}
          </p>
          <p className="text-brand-navy mt-1 font-semibold">
            {(overview.primaryAccountType ?? "—").replaceAll("_", " ")}
          </p>
        </div>
      </div>
      {overview.submission ? (
        <p className="text-muted text-sm">
          {t("dashboard.trust.cycle", { cycle: overview.submission.cycle })} ·{" "}
          {overview.submission.policyName} ·{" "}
          {overview.submission.status.replaceAll("_", " ")}
        </p>
      ) : null}
      <div className="space-y-2">
        <p className="text-brand-navy text-sm font-semibold">
          {t("dashboard.trust.requirements")}
        </p>
        {overview.requirements.map((item) => (
          <div
            key={item.documentType}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
          >
            <DirectoryStatus value={item.documentType} />
            <div className="flex flex-wrap gap-2">
              <DirectoryStatus
                value={
                  item.uploaded
                    ? t("dashboard.trust.uploaded")
                    : t("dashboard.trust.missing")
                }
              />
              {item.expiryRequired ? (
                <DirectoryStatus value={t("dashboard.trust.expiryRequired")} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-brand-navy text-sm font-semibold">
          {t("dashboard.trust.openReviews")}
        </p>
        {overview.requests.length ? (
          overview.requests.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div>
                <DirectoryStatus value={item.subjectType} />
                <p className="text-muted mt-1 text-xs">
                  {t("dashboard.trust.due")} {item.dueAt ?? "—"} ·{" "}
                  {item.priority}
                </p>
              </div>
              <DirectoryStatus value={slaLabel(item.slaState, t)} />
            </div>
          ))
        ) : (
          <p className="text-muted text-sm">
            {t("dashboard.trust.noOpenReviews")}
          </p>
        )}
      </div>
    </div>
  )
}

function slaLabel(
  state: PortalVerificationOverview["requests"][number]["slaState"],
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  switch (state) {
    case "ON_TRACK":
      return t("dashboard.trust.sla.ON_TRACK")
    case "AT_RISK":
      return t("dashboard.trust.sla.AT_RISK")
    case "BREACHED":
      return t("dashboard.trust.sla.BREACHED")
    case "MET":
      return t("dashboard.trust.sla.MET")
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function DirectoryStatus({ value }: { value: string | null | undefined }) {
  if (!value) return null
  return (
    <span className="bg-light-blue text-brand-navy inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
      {value.replaceAll("_", " ")}
    </span>
  )
}

function VerificationSubmitPanel({ documentIds }: { documentIds: string[] }) {
  return (
    <Card className="p-5">
      <VerificationSubmitClient documentIds={documentIds} />
    </Card>
  )
}

function DetailPanel({
  title,
  statuses,
  backHref,
  backLabel,
  actions,
  children,
}: {
  title: string
  statuses: Array<string | null | undefined>
  backHref: string
  backLabel: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="text-primary inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold shadow-sm"
        >
          ← {backLabel}
        </Link>
        {actions}
      </div>
      <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-brand-navy text-2xl font-bold">{title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {statuses
            .filter((value): value is string => Boolean(value))
            .map((value) => (
              <StatusBadge
                key={value}
                status={value}
                label={value.replaceAll("_", " ")}
                className="min-h-7 px-2.5 text-[11px] tracking-wide uppercase"
              />
            ))}
        </div>
        {children ? <div className="mt-6 space-y-4">{children}</div> : null}
      </Card>
    </div>
  )
}

function DirectoryFrame({
  title,
  description,
  children,
  error,
  retry,
  empty,
  breadcrumbs,
  actions,
  framed = false,
}: {
  title: string
  description: string
  children: ReactNode
  error?: boolean
  retry: string
  empty?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  framed?: boolean
}) {
  const body = (
    <>
      {error ? <RetryButton label={retry} /> : null}
      {!error && empty ? <p className="text-muted">{empty}</p> : null}
      {!error ? children : null}
    </>
  )
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
        {framed ? (
          <Card className="space-y-4 p-6 sm:p-7">
            {body}
          </Card>
        ) : (
        body
      )}
    </div>
  )
}
