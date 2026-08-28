import type { ComponentProps, ReactNode } from "react"
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
import { OpportunityLifecycleActions } from "@/features/dashboard/components/opportunity-lifecycle-actions"
import { OpportunityListFilters } from "@/features/dashboard/components/opportunity-list-filters"
import { ProjectForm } from "@/features/dashboard/components/project-form"
import { TenderForm } from "@/features/dashboard/components/tender-form"
import { TenderLifecycleActions } from "@/features/dashboard/components/tender-lifecycle-actions"
import { ProjectLifecycleActions } from "@/features/dashboard/components/project-lifecycle-actions"
import { PortalProjectsList } from "@/features/dashboard/components/portal-projects-list"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import { VerificationSubmitClient } from "@/features/dashboard/components/verification-submit-client"
import { VerificationDocumentsTable } from "@/features/dashboard/components/verification-documents-table"
import type { PortalTableColumn } from "@/features/dashboard/components/portal-data-table"
import { PortalServerTable } from "@/features/dashboard/components/portal-server-table"
import type { PortalServerTableLabels } from "@/features/dashboard/components/portal-server-table"
import { PortalFormDialog } from "@/features/dashboard/components/portal-form-dialog"
import { PermissionDeniedState } from "@/features/dashboard/components/permission-guard"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import {
  hasAnyPortalPermission,
  opportunityCreatePermissions,
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
  type PortalMember,
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
  items: Array<{
    id: string
    name?: string
    label?: string
    slug?: string
    translations?: unknown
  }>,
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

function portalActionsColumn(detailLabel: string): PortalTableColumn {
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

function isOpportunityOwned(
  opportunity: { companyId?: string | null; ownerProfileId?: string | null },
  bootstrap: Awaited<ReturnType<typeof getPortalBootstrap>>,
) {
  if (!bootstrap) return false
  return (
    opportunity.ownerProfileId === bootstrap.profile.id ||
    Boolean(
      opportunity.companyId &&
      bootstrap.workspaces.some(
        (workspace) => workspace.companyId === opportunity.companyId,
      ),
    )
  )
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
        <PortalProjectsList
          categories={categories.items}
          cities={cities.items}
          empty={t("dashboard.projectsEmpty")}
          labels={{
            stats: {
              active: t("dashboard.projects.stats.active"),
              published: t("dashboard.projects.stats.published"),
              inProgress: t("dashboard.projects.stats.inProgress"),
              portfolioValue: t("dashboard.projects.stats.portfolioValue"),
            },
            toolbar: {
              search: t("dashboard.table.search"),
              allStatuses: t("dashboard.table.allStatuses"),
              allCategories: t("dashboard.projects.allCategories"),
              allLocations: t("dashboard.projects.allLocations"),
              allTags: t("dashboard.projects.allTags"),
              deadlineFrom: t("dashboard.projects.deadlineFrom"),
              deadlineTo: t("dashboard.projects.deadlineTo"),
              sortNewest: t("dashboard.table.newest"),
              sortTitle: t("dashboard.table.titleAsc"),
              clearAll: t("dashboard.projects.toolbar.clearAll"),
              export: t("dashboard.projects.toolbar.export"),
            },
            table: {
              project: t("dashboard.projects.table.project"),
              owner: t("dashboard.projects.table.owner"),
              status: t("dashboard.table.status"),
              location: t("dashboard.fields.city"),
              budget: t("dashboard.fields.budget"),
              deadline: t("dashboard.fields.deadline"),
              packages: t("dashboard.fields.packages"),
              actions: t("dashboard.table.actions"),
              details: t("dashboard.table.details"),
              edit: t("dashboard.edit.open"),
              actionsFor: t("dashboard.projects.table.actionsFor", {
                title: "{title}",
              }),
              confirmTitle: t("dashboard.projects.table.confirmTitle", {
                action: "{action}",
              }),
              confirmDescription: t(
                "dashboard.projects.table.confirmDescription",
                { title: "{title}", from: "{from}", to: "{to}" },
              ),
              reasonLabel: t("dashboard.projects.table.reasonLabel"),
              reasonPlaceholder: t(
                "dashboard.projects.table.reasonPlaceholder",
              ),
              cancel: t("common.cancel"),
              processing: t("dashboard.projects.table.processing"),
              statuses: {
                DRAFT: t("dashboard.projects.lifecycle.DRAFT"),
                PENDING_REVIEW: t(
                  "dashboard.projects.lifecycle.PENDING_REVIEW",
                ),
                PUBLISHED: t("dashboard.projects.lifecycle.PUBLISHED"),
                IN_PROGRESS: t("dashboard.projects.lifecycle.IN_PROGRESS"),
                COMPLETED: t("dashboard.projects.lifecycle.COMPLETED"),
                ON_HOLD: t("dashboard.projects.lifecycle.ON_HOLD"),
                CANCELLED: t("dashboard.projects.lifecycle.CANCELLED"),
                ARCHIVED: t("dashboard.projects.lifecycle.ARCHIVED"),
              },
              previous: t("dashboard.table.previous"),
              next: t("dashboard.table.next"),
              totalRecords: t("dashboard.projects.table.totalRecords", {
                count: result.pageInfo.total,
              }),
            },
          }}
          locale={locale}
          pageInfo={result.pageInfo}
          permissions={effectivePermissions(bootstrap, projectPermissions)}
          projects={result.items}
          tags={tags.items}
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
        <PortalServerTable
          empty={t("dashboard.opportunitiesEmpty")}
          labels={serverTableLabels(t, result.pageInfo.total)}
          basePath="/dashboard/opportunities"
          queryParams={{
            scope: query.scope === "discover" ? query.scope : undefined,
            kind: query.kind,
          }}
          server={serverTableState(query, result.pageInfo, opportunityStatuses)}
          filters={
            <OpportunityListFilters
              allTypesLabel={t("dashboard.opportunity.allTypes")}
              kind={query.kind}
              kinds={[
                "SUBCONTRACT_WORK",
                "PROFESSIONAL_SERVICE",
                "MATERIAL_SUPPLY",
                "EQUIPMENT_REQUEST",
                "WORKFORCE_REQUEST",
              ].map((value) => ({
                value,
                label: t(`dashboard.kinds.${value}`),
              }))}
              ownedLabel={t("dashboard.scope.owned")}
              scope={query.scope}
              discoverLabel={t("dashboard.scope.discover")}
            />
          }
          columns={[
            {
              id: "opportunity",
              header: t("dashboard.fields.title"),
              className: "min-w-[280px]",
              render: (row) => (
                <div className="space-y-1">
                  <Link
                    href={String(row.detailHref)}
                    className="text-brand-navy font-semibold hover:underline"
                  >
                    {row.title}
                  </Link>
                  <p className="text-muted text-xs">
                    {(row.reference as string | null) || "-"}
                  </p>
                </div>
              ),
            },
            {
              id: "status",
              header: t("dashboard.table.status"),
              render: (row) => (
                <StatusBadge
                  status={String(row.statusLabel ?? "DRAFT")}
                  label={String(row.statusLabelText ?? row.statusLabel ?? "-")}
                />
              ),
            },
            {
              id: "kind",
              header: t("dashboard.publish.kind"),
              render: (row) => String(row.kindLabel ?? "-"),
            },
            {
              id: "budget",
              header: t("dashboard.fields.budget"),
              render: (row) => String(row.budget ?? "-"),
            },
            {
              id: "deadline",
              header: t("dashboard.publish.deadline"),
              render: (row) => String(row.deadline ?? "-"),
            },
            {
              id: "responses",
              header: t("dashboard.nav.offers"),
              render: (row) => String(row.responses ?? "0"),
            },
            {
              id: "actions",
              header: t("dashboard.table.actions"),
              cellClassName: "w-[1%] whitespace-nowrap",
              render: (row) => (
                <OpportunityLifecycleActions
                  {...(row.lifecycle as ComponentProps<
                    typeof OpportunityLifecycleActions
                  >)}
                />
              ),
            },
          ]}
          rows={result.items.map((item) => ({
            id: item.id,
            title: item.title,
            reference: item.reference,
            statusLabel: item.statusV1 ?? item.publicationStatus,
            statusLabelText: (
              item.statusV1 ??
              item.publicationStatus ??
              "-"
            ).replaceAll("_", " "),
            kindLabel: item.kind ? t(`dashboard.kinds.${item.kind}`) : "-",
            budget:
              item.budgetMinMinor || item.budgetMaxMinor
                ? `${formatPortalMoney(item.budgetMinMinor, item.currency, locale)}${item.budgetMaxMinor ? ` - ${formatPortalMoney(item.budgetMaxMinor, item.currency, locale)}` : ""}`
                : "-",
            deadline: formatPortalDate(item.deadlineAt, locale),
            responses: item.offerCount + item.applicationCount,
            statuses: [item.kind, item.statusV1 ?? item.publicationStatus],
            detailHref: portalDetailPath("opportunities", item.id),
            lifecycle: {
              id: item.id,
              status: item.statusV1 ?? item.publicationStatus,
              title: item.title,
              version: item.version,
              canEdit:
                query.scope === "owned" &&
                permittedOpportunityKinds(granted).includes(item.kind as never),
            },
          }))}
          mobileCard={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={String(row.detailHref)}
                    className="text-brand-navy block truncate font-semibold hover:underline"
                  >
                    {row.title}
                  </Link>
                  <p className="text-muted mt-1 text-xs">
                    {String(row.reference ?? "-")}
                  </p>
                </div>
                <StatusBadge
                  status={String(row.statusLabel ?? "DRAFT")}
                  label={String(row.statusLabelText ?? "-")}
                />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted">{t("dashboard.publish.kind")}</dt>
                  <dd className="text-brand-navy mt-0.5 font-medium">
                    {String(row.kindLabel ?? "-")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t("dashboard.fields.budget")}</dt>
                  <dd className="text-brand-navy mt-0.5 font-medium">
                    {String(row.budget ?? "-")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">
                    {t("dashboard.publish.deadline")}
                  </dt>
                  <dd className="text-brand-navy mt-0.5 font-medium">
                    {String(row.deadline ?? "-")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t("dashboard.nav.offers")}</dt>
                  <dd className="text-brand-navy mt-0.5 font-medium">
                    {String(row.responses ?? "0")}
                  </dd>
                </div>
              </dl>
              <OpportunityLifecycleActions
                {...(row.lifecycle as ComponentProps<
                  typeof OpportunityLifecycleActions
                >)}
              />
            </div>
          )}
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
    Boolean(detail && isOpportunityOwned(detail, bootstrap)) &&
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
          />
          <OpportunityDetailSections
            detail={detail}
            locale={await getLocale()}
            t={t}
          />
          <OpportunityLifecycleActions
            id={detail.id}
            title={detail.title}
            status={detail.statusV1 ?? detail.publicationStatus}
            version={detail.version}
            canEdit={canEdit}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

function OpportunityDetailSections({
  detail,
  locale,
  t,
}: {
  detail: Awaited<ReturnType<typeof getPortalOpportunity>>
  locale: string
  t: Translator
}) {
  const rows: Array<[string, string]> = [
    [t("dashboard.fields.description"), detail.description ?? "-"],
    [
      t("dashboard.publish.deadline"),
      formatPortalDate(detail.deadlineAt, locale),
    ],
  ]
  if (detail.kind !== "WORKFORCE_REQUEST") {
    rows.push([
      t("dashboard.fields.budget"),
      detail.budgetMinMinor || detail.budgetMaxMinor
        ? `${formatPortalMoney(detail.budgetMinMinor, detail.currency, locale)}${detail.budgetMaxMinor ? ` - ${formatPortalMoney(detail.budgetMaxMinor, detail.currency, locale)}` : ""}`
        : "-",
    ])
  }
  if (detail.kind === "WORKFORCE_REQUEST") {
    rows.push(
      [
        t("dashboard.publish.workersNeeded"),
        String(detail.workersNeeded ?? "-"),
      ],
      [
        t("dashboard.fields.employmentType"),
        String(detail.employmentType ?? "-").replaceAll("_", " "),
      ],
      [
        t("dashboard.fields.workArrangement"),
        String(detail.workArrangement ?? "-").replaceAll("_", " "),
      ],
    )
  }
  if (detail.kind === "MATERIAL_SUPPLY") {
    rows.push(
      [
        t("dashboard.publish.quantity"),
        `${detail.quantity ?? "-"} ${detail.unit ?? ""}`.trim(),
      ],
      [
        t("dashboard.publish.specifications"),
        specDetail(detail.materialSpecifications),
      ],
    )
  }
  if (detail.kind === "EQUIPMENT_REQUEST") {
    rows.push(
      [
        t("dashboard.create.duration"),
        detail.durationDays ? `${detail.durationDays}` : "-",
      ],
      [
        t("dashboard.publish.specifications"),
        specDetail(detail.equipmentSpecifications),
      ],
    )
  }
  if (
    ["SUBCONTRACT_WORK", "PROFESSIONAL_SERVICE"].includes(detail.kind ?? "")
  ) {
    rows.push([
      t("dashboard.create.duration"),
      detail.durationDays ? `${detail.durationDays}` : "-",
    ])
  }
  return (
    <Card className="rounded-[28px] p-5 sm:p-6">
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
              {label}
            </dt>
            <dd className="text-brand-navy mt-1 text-sm whitespace-pre-wrap">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {detail.attachments?.length ? (
        <div className="border-line mt-6 border-t pt-5">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
            {t("dashboard.create.uploadAttachments")}
          </p>
          <ul className="text-brand-navy mt-2 space-y-1 text-sm">
            {detail.attachments.map((attachment) => (
              <li key={attachment.id}>{attachment.name}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  )
}

function specDetail(value: unknown) {
  if (typeof value === "string") return value || "-"
  if (value && typeof value === "object" && "notes" in value) {
    const notes = (value as { notes?: unknown }).notes
    return typeof notes === "string" && notes ? notes : "-"
  }
  return "-"
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
        <PortalServerTable
          empty={t("dashboard.tendersEmpty")}
          labels={serverTableLabels(t, result.pageInfo.total)}
          basePath="/dashboard/tenders"
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
                  <p className="text-brand-navy font-semibold">{row.title}</p>
                  <p className="text-muted text-xs">
                    {(row.reference as string | null) || "-"}
                  </p>
                </div>
              ),
            },
            {
              id: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  status={String(row.statusLabel ?? "DRAFT")}
                  label={String(row.statusLabelText ?? row.statusLabel ?? "-")}
                />
              ),
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
              render: (row) => (
                <span className="tabular-nums">{String(row.lots ?? "0")}</span>
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
        isProjectOwner={
          bootstrap.profile.primaryAccountType === "PROJECT_OWNER"
        }
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
          (workspace) => workspace.companyId === detail.organizationCompanyId,
        ))),
  )
  const canEdit =
    Boolean(detail?.version) &&
    hasAnyPortalPermission(effectivePermissions(bootstrap, tenderPermissions), [
      "tenders.edit",
    ])
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
          {canManage && detail.version ? (
            <TenderLifecycleActions
              id={detail.id}
              version={detail.version}
              status={detail.status}
            />
          ) : null}
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
          {detail.media?.length ? (
            <section className="space-y-2">
              <h2 className="text-brand-navy font-semibold">Documents</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {detail.media.map((item) => (
                  <Card key={item.assetId} className="p-3">
                    <DocumentLink assetId={item.assetId} label={item.name} />
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
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
  const locale = await getLocale()
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const [result, permissions] = await Promise.all([
    companyId
      ? listPortalMembers(companyId, {
          page: query.page,
          q: query.q,
          status: query.status,
          sort: query.sort,
        }).catch(() => null)
      : Promise.resolve(null),
    companyId
      ? getWorkspacePermissions(companyId).catch(() => null)
      : Promise.resolve(null),
  ])
  const canInvite = Boolean(permissions?.permissions.includes("team.invite"))
  const canEdit = Boolean(permissions?.permissions.includes("team.role.manage"))
  const canRemove = Boolean(permissions?.permissions.includes("team.remove"))
  const emptyResult = {
    items: [] as PortalMember[],
    pageInfo: { page: 1, pageSize: 10, total: 0, hasNextPage: false },
  }
  const resolved = companyId ? (result ?? null) : emptyResult
  const detail = query.id
    ? resolved?.items.find((item) => item.id === query.id)
    : undefined
  const items = resolved?.items ?? []
  const counts = {
    ACTIVE: items.filter((item) => item.status === "ACTIVE").length,
    INVITED: items.filter((item) => item.status === "INVITED").length,
    PENDING: items.filter((item) => item.status === "PENDING").length,
    SUSPENDED: items.filter((item) => item.status === "SUSPENDED").length,
  }
  return (
    <DirectoryFrame
      title={t("dashboard.nav.members")}
      description={t("dashboard.descriptions.members")}
      error={companyId ? !result : false}
      retry={t("dashboard.retry")}
      empty={!companyId ? t("dashboard.noWorkspace") : undefined}
      actions={
        companyId && !query.id && canInvite ? (
          <PortalFormDialog
            triggerLabel={t("dashboard.inviteMemberSend")}
            title={t("dashboard.inviteMember")}
            description={t("dashboard.descriptions.members")}
          >
            <MemberInviteForm companyId={companyId} />
          </PortalFormDialog>
        ) : null
      }
    >
      {detail ? (
        <MemberDetailPanel
          member={detail}
          permissions={permissions?.permissions ?? []}
          locale={locale}
          companyId={companyId ?? null}
          canEdit={canEdit}
          canRemove={canRemove}
          backLabel={t("common.back")}
          labels={{
            membershipDetails: t("dashboard.members.membershipDetails"),
            rolePermissions: t("dashboard.members.rolePermissions"),
            noPermissions: t("dashboard.members.noPermissions"),
            externalInvitation: t("dashboard.members.externalInvitation"),
            primaryWorkspaceMember: t(
              "dashboard.members.primaryWorkspaceMember",
            ),
            workspaceMember: t("dashboard.members.workspaceMember"),
            role: t("dashboard.members.role"),
            status: t("dashboard.members.status"),
            email: t("dashboard.members.email"),
            jobTitle: t("dashboard.members.jobTitle"),
            department: t("dashboard.members.department"),
            invited: t("dashboard.members.invitedOn"),
            joined: t("dashboard.members.joined"),
            lastActive: t("dashboard.members.lastActive"),
            updated: t("dashboard.members.updated"),
            invitedBy: t("dashboard.members.invitedBy"),
          }}
        />
      ) : resolved ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                ["ACTIVE", t("dashboard.members.active")],
                ["INVITED", t("dashboard.members.invited")],
                ["PENDING", t("dashboard.members.pending")],
                ["SUSPENDED", t("dashboard.members.suspended")],
              ] as const
            ).map(([status, label]) => (
              <div
                key={status}
                className="border-line/70 rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
              >
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  {label}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-brand-navy text-2xl font-bold tabular-nums">
                    {counts[status]}
                  </p>
                  <StatusBadge
                    status={status}
                    label={status.replaceAll("_", " ")}
                  />
                </div>
              </div>
            ))}
          </div>
          <PortalServerTable
            empty={t("dashboard.membersEmpty")}
            emptyDescription={t("dashboard.members.emptyDescription")}
            labels={serverTableLabels(t, resolved.pageInfo.total)}
            basePath="/dashboard/members"
            server={serverTableState(query, resolved.pageInfo, memberStatuses)}
            columns={[
              {
                id: "member",
                header: t("dashboard.members.member"),
                className: "min-w-[260px]",
                render: (row) => (
                  <div className="flex min-w-0 items-start gap-3">
                    <MemberAvatar name={String(row.title ?? "")} />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-brand-navy truncate font-semibold">
                        {row.title}
                      </p>
                      <p className="text-muted truncate text-xs">
                        {String(row.email ?? "-")}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                id: "emailStatus",
                header: t("dashboard.members.email"),
                className: "min-w-[170px]",
                render: (row) => (
                  <div className="min-w-0">
                    <p className="text-brand-navy truncate text-sm">
                      {String(row.email ?? "-")}
                    </p>
                    <p className="text-muted mt-1 text-xs">
                      {String(row.emailState ?? "-")}
                    </p>
                  </div>
                ),
              },
              {
                id: "role",
                header: t("dashboard.members.companyRole"),
                render: (row) => String(row.roleLabel ?? "-"),
              },
              {
                id: "jobTitle",
                header: t("dashboard.members.jobTitle"),
                render: (row) => String(row.jobTitle ?? "-"),
              },
              {
                id: "status",
                header: t("dashboard.members.status"),
                render: (row) => (
                  <StatusBadge
                    status={String(row.statusLabel ?? "PENDING")}
                    label={String(
                      row.statusLabelText ?? row.statusLabel ?? "-",
                    )}
                  />
                ),
              },
              {
                id: "joined",
                header: t("dashboard.members.joinedInvited"),
                render: (row) => String(row.joined ?? "-"),
              },
              {
                id: "actions",
                header: t("dashboard.table.actions"),
                cellClassName: "w-[1%] whitespace-nowrap",
                render: (row) => row.actions,
              },
            ]}
            mobileCard={(row) => (
              <div className="flex items-start gap-3">
                <MemberAvatar name={String(row.title ?? "")} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-brand-navy truncate font-semibold">
                    {row.title}
                  </p>
                  <p className="text-muted truncate text-xs">
                    {String(row.email ?? "-")}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <StatusBadge
                      status={String(row.statusLabel)}
                      label={String(row.statusLabelText)}
                    />
                    <span className="text-muted border-line rounded-full border px-2 py-0.5 text-xs">
                      {String(row.roleLabel)}
                    </span>
                  </div>
                </div>
                {row.actions}
              </div>
            )}
            rows={items.map((item) => {
              const displayName =
                item.displayName ??
                item.invitationEmail ??
                item.email ??
                item.role
              return {
                id: item.id,
                title: displayName,
                email: item.email ?? item.invitationEmail,
                emailState:
                  item.status === "INVITED"
                    ? t("dashboard.members.invited")
                    : t("dashboard.members.joined"),
                roleLabel: item.role.replaceAll("_", " "),
                jobTitle:
                  [item.title, item.department].filter(Boolean).join(" - ") ||
                  "-",
                statusLabel: item.status,
                statusLabelText: item.status.replaceAll("_", " "),
                joined: item.joinedAt
                  ? formatPortalDate(item.joinedAt, locale)
                  : item.invitedAt
                    ? formatPortalDate(item.invitedAt, locale)
                    : "-",
                statuses: [item.role, item.status],
                detailHref: `/dashboard/members/${item.id}`,
                actions:
                  companyId && (canInvite || canEdit || canRemove) ? (
                    <MemberActions
                      companyId={companyId}
                      membershipId={item.id}
                      detailHref={`/dashboard/members/${item.id}`}
                      name={displayName}
                      role={item.role}
                      status={item.status}
                      title={item.title}
                      department={item.department}
                      version={item.version}
                      canEdit={canEdit}
                      canResend={canInvite}
                      canRemove={canRemove}
                    />
                  ) : undefined,
              }
            })}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

function initialsOf(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return "?"
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="bg-primary/10 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
    >
      {initialsOf(name)}
    </span>
  )
}

function serverTableLabels(
  t: Translator,
  total?: number,
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
    totalRecords:
      total === undefined
        ? undefined
        : t("dashboard.projects.table.totalRecords", { count: total }),
    rows: t("dashboard.table.showing"),
  }
}

function MemberDetailPanel({
  member,
  permissions,
  locale,
  companyId,
  canEdit,
  canRemove,
  backLabel,
  labels,
}: {
  member: PortalMember
  permissions: string[]
  locale: string
  companyId: string | null
  canEdit: boolean
  canRemove: boolean
  backLabel: string
  labels: {
    membershipDetails: string
    rolePermissions: string
    noPermissions: string
    externalInvitation: string
    primaryWorkspaceMember: string
    workspaceMember: string
    role: string
    status: string
    email: string
    jobTitle: string
    department: string
    invited: string
    joined: string
    lastActive: string
    updated: string
    invitedBy: string
  }
}) {
  const name =
    member.displayName ?? member.invitationEmail ?? member.email ?? member.role
  const facts = [
    [labels.role, member.role.replaceAll("_", " ")],
    [labels.status, member.status.replaceAll("_", " ")],
    [labels.email, member.email ?? member.invitationEmail ?? "-"],
    [labels.jobTitle, member.title ?? "-"],
    [labels.department, member.department ?? "-"],
    [labels.invited, formatPortalDate(member.invitedAt, locale)],
    [labels.joined, formatPortalDate(member.joinedAt, locale)],
    [labels.lastActive, formatPortalDate(member.lastAccessedAt, locale)],
    [labels.updated, formatPortalDate(member.updatedAt, locale)],
    [labels.invitedBy, member.invitedByName ?? "-"],
  ]
  return (
    <div className="space-y-5">
      <div className="border-line/70 flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex min-w-0 items-start gap-4">
          <MemberAvatar name={name} />
          <div className="min-w-0 space-y-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/members">{backLabel}</Link>
            </Button>
            <div>
              <h2 className="text-brand-navy truncate text-xl font-bold">
                {name}
              </h2>
              <p className="text-muted text-sm">
                {member.externalInvite
                  ? labels.externalInvitation
                  : member.isPrimary
                    ? labels.primaryWorkspaceMember
                    : labels.workspaceMember}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={member.status}
                label={member.status.replaceAll("_", " ")}
              />
              <span className="text-muted border-line rounded-full border px-2.5 py-1 text-xs font-semibold">
                {member.role.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </div>
        {companyId ? (
          <MemberActions
            companyId={companyId}
            membershipId={member.id}
            name={name}
            role={member.role}
            status={member.status}
            title={member.title}
            department={member.department}
            version={member.version}
            canEdit={canEdit}
            canRemove={canRemove}
          />
        ) : null}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.45fr)]">
        <div className="border-line/70 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-brand-navy text-sm font-bold">
            {labels.membershipDetails}
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-muted text-xs font-semibold uppercase">
                  {label}
                </dt>
                <dd className="text-brand-navy mt-1 text-sm font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="border-line/70 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-brand-navy text-sm font-bold">
            {labels.rolePermissions}
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {permissions.length ? (
              permissions.map((permission) => (
                <span
                  key={permission}
                  className="text-muted border-line rounded-full border px-2.5 py-1 text-xs"
                >
                  {permission}
                </span>
              ))
            ) : (
              <p className="text-muted text-sm">{labels.noPermissions}</p>
            )}
          </div>
        </div>
      </div>
    </div>
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
        <PortalServerTable
          empty={t("dashboard.catalogueEmpty")}
          labels={serverTableLabels(t, result.pageInfo.total)}
          basePath="/dashboard/catalogue"
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
                  <p className="text-brand-navy font-semibold">{row.title}</p>
                  <p className="text-muted line-clamp-2 text-xs">
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
            categoryLabel: taxonomyName(
              categories.items,
              item.categoryId,
              locale,
            ),
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
  const detail = companyId
    ? await getPortalCatalogue(companyId, id).catch(() => null)
    : null
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
        <PortalServerTable
          empty={t("dashboard.equipmentEmpty")}
          labels={serverTableLabels(t, result.pageInfo.total)}
          basePath="/dashboard/equipment"
          server={serverTableState(query, result.pageInfo, equipmentStatuses)}
          columns={[
            {
              id: "equipment",
              header: "Equipment",
              className: "min-w-[260px]",
              render: (row) => (
                <div className="space-y-1">
                  <p className="text-brand-navy font-semibold">{row.title}</p>
                  <p className="text-muted text-xs">
                    {String(row.modelLabel ?? "-")}
                  </p>
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
              render: (row) => (
                <StatusBadge
                  status={String(row.statusLabel ?? "DRAFT")}
                  label={String(row.statusLabelText ?? row.statusLabel ?? "-")}
                />
              ),
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
            modelLabel:
              [item.brand, item.model].filter(Boolean).join(" - ") ||
              item.serialNumber ||
              "-",
            listingTypeLabel: item.listingType.replaceAll("_", " "),
            statusLabel: item.status,
            statusLabelText: item.status.replaceAll("_", " "),
            conditionLabel: item.condition?.replaceAll("_", " ") ?? "-",
            pricing: item.dailyRateMinor
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
  const locale = await getLocale()
  const [overview, status] = await Promise.all([
    getPortalVerification().catch(() => null),
    getPortalVerificationStatus().catch(() => null),
  ])
  const latestDecision = status?.submission?.decisions[0]
  const statusValue =
    status?.submission?.status ??
    status?.verificationStatus ??
    overview?.submission?.status ??
    overview?.verificationStatus ??
    "NOT_SUBMITTED"
  const requiredCount =
    overview?.requirements.filter((item) => item.required).length ?? 0
  const fulfilledRequiredCount =
    overview?.requirements.filter((item) => item.required && item.uploaded)
      .length ?? 0
  const blockedReasons = verificationBlockedReasons({
    documentCount: status?.documents.length ?? 0,
    hasPolicy: Boolean(overview?.requirements.length || overview?.submission),
    inReview: ["SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(statusValue),
    missingRequired: overview?.missingRequired.length ?? 0,
    statusValue,
    t,
    terminal: ["VERIFIED", "APPROVED", "REJECTED", "EXPIRED"].includes(
      statusValue,
    ),
  })
  return (
    <DirectoryFrame
      title={t("dashboard.nav.verification")}
      description={t("dashboard.descriptions.verification")}
      error={!overview && !status}
      retry={t("dashboard.retry")}
    >
      {status ? (
        <div className="space-y-6">
          <VerificationStatusHero
            accountType={overview?.primaryAccountType}
            body={verificationStatusBody(statusValue, blockedReasons, t)}
            latestDecision={latestDecision?.decision}
            status={statusValue}
            submittedAt={
              status.submission?.submittedAt ??
              overview?.submission?.submittedAt
            }
            title={verificationStatusTitle(statusValue, t)}
          />
          <VerificationProgressGrid
            fulfilledRequiredCount={fulfilledRequiredCount}
            latestDecision={latestDecision}
            locale={locale}
            overview={overview}
            requiredCount={requiredCount}
            status={status}
          />
          <VerificationNextAction
            blockedReasons={blockedReasons}
            issueCount={status.openIssues.length}
            status={statusValue}
          />
          {overview ? <VerificationOverview overview={overview} /> : null}
          <Card className="hidden p-5">
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
          {false && status?.submission?.checklist.length ? (
            <Card className="space-y-3 p-5">
              <h2 className="text-brand-navy font-semibold">
                {t("dashboard.verification.checklist")}
              </h2>
              {status?.submission?.checklist.map((item) => (
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
            disabledReasons={blockedReasons}
            documentIds={status.documents.map((item) => item.id)}
            fulfilledRequiredCount={fulfilledRequiredCount}
            issueCount={status.openIssues.length}
            requiredCount={requiredCount}
          />
          <VerificationDocumentsTable
            documents={status.documents}
            empty={t("dashboard.documentsEmpty")}
            labels={tableLabels(t)}
            locale={locale}
          />
        </div>
      ) : null}
    </DirectoryFrame>
  )
}

type PortalVerificationStatusResult = Awaited<
  ReturnType<typeof getPortalVerificationStatus>
>

function verificationBlockedReasons({
  documentCount,
  hasPolicy,
  inReview,
  missingRequired,
  statusValue,
  t,
  terminal,
}: {
  documentCount: number
  hasPolicy: boolean
  inReview: boolean
  missingRequired: number
  statusValue: string
  t: Translator
  terminal: boolean
}) {
  const reasons: string[] = []
  if (!hasPolicy) reasons.push(t("dashboard.verification.blocked.noPolicy"))
  if (!documentCount) {
    reasons.push(t("dashboard.verification.blocked.noDocuments"))
  }
  if (missingRequired) {
    reasons.push(
      t("dashboard.verification.blocked.missingRequired", {
        count: missingRequired,
      }),
    )
  }
  if (inReview) reasons.push(t("dashboard.verification.blocked.inReview"))
  if (terminal && statusValue !== "REJECTED" && statusValue !== "EXPIRED") {
    reasons.push(t("dashboard.verification.blocked.terminal"))
  }
  return reasons
}

function verificationStatusTitle(status: string, t: Translator) {
  const key = status.toUpperCase()
  if (["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(key)) {
    return t("dashboard.verification.statusTitles.PENDING")
  }
  if (key === "CHANGES_REQUESTED") {
    return t("dashboard.verification.statusTitles.CHANGES_REQUESTED")
  }
  if (["VERIFIED", "APPROVED"].includes(key)) {
    return t("dashboard.verification.statusTitles.VERIFIED")
  }
  if (key === "REJECTED") {
    return t("dashboard.verification.statusTitles.REJECTED")
  }
  if (key === "EXPIRED") return t("dashboard.verification.statusTitles.EXPIRED")
  return t("dashboard.verification.statusTitles.NOT_SUBMITTED")
}

function verificationStatusBody(
  status: string,
  blockedReasons: string[],
  t: Translator,
) {
  const key = status.toUpperCase()
  if (["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(key)) {
    return t("dashboard.verification.statusBodies.PENDING")
  }
  if (key === "CHANGES_REQUESTED") {
    return t("dashboard.verification.statusBodies.CHANGES_REQUESTED")
  }
  if (["VERIFIED", "APPROVED"].includes(key)) {
    return t("dashboard.verification.statusBodies.VERIFIED")
  }
  if (key === "REJECTED")
    return t("dashboard.verification.statusBodies.REJECTED")
  if (key === "EXPIRED") return t("dashboard.verification.statusBodies.EXPIRED")
  return blockedReasons.length
    ? t("dashboard.verification.statusBodies.BLOCKED")
    : t("dashboard.verification.statusBodies.READY")
}

function VerificationStatusHero({
  accountType,
  body,
  latestDecision,
  status,
  submittedAt,
  title,
}: {
  accountType?: string | null
  body: string
  latestDecision?: string
  status: string
  submittedAt?: string | null
  title: string
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-[linear-gradient(135deg,#071A33,#0D4E66)] p-5 text-white shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={status} label={status.replaceAll("_", " ")} />
            {accountType ? (
              <StatusBadge
                status="ACTIVE"
                label={accountType.replaceAll("_", " ")}
              />
            ) : null}
          </div>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
            {body}
          </p>
        </div>
        <div className="min-w-[180px] rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
          <p className="text-white/65">Latest activity</p>
          <p className="mt-1 font-semibold">
            {(latestDecision ?? status).replaceAll("_", " ")}
          </p>
          {submittedAt ? (
            <p className="mt-2 text-xs text-white/65">
              {formatPortalDate(submittedAt)}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

async function VerificationProgressGrid({
  fulfilledRequiredCount,
  latestDecision,
  locale,
  overview,
  requiredCount,
  status,
}: {
  fulfilledRequiredCount: number
  latestDecision?: NonNullable<
    PortalVerificationStatusResult["submission"]
  >["decisions"][number]
  locale: string
  overview: PortalVerificationOverview | null
  requiredCount: number
  status: PortalVerificationStatusResult
}) {
  const t = await getTranslations()
  const openRequest = overview?.requests[0]
  const cards = [
    {
      label: t("dashboard.trust.accountType"),
      value: (overview?.primaryAccountType ?? "-").replaceAll("_", " "),
    },
    {
      label: t("dashboard.verification.progress.policy"),
      value:
        overview?.submission?.policyName ??
        (overview?.requirements.length
          ? t("dashboard.verification.progress.activePolicy")
          : "-"),
    },
    {
      label: t("dashboard.verification.progress.required"),
      value: `${fulfilledRequiredCount}/${requiredCount}`,
    },
    {
      detail: openRequest?.dueAt
        ? `${t("dashboard.trust.due")} ${formatPortalDate(
            openRequest.dueAt,
            locale,
          )}`
        : undefined,
      label: t("dashboard.verification.progress.review"),
      value: openRequest
        ? slaLabel(openRequest.slaState, t)
        : (status.submission?.status ?? status.verificationStatus).replaceAll(
            "_",
            " ",
          ),
    },
    {
      label: t("dashboard.verification.progress.cycle"),
      value: status.submission ? String(status.submission.cycle) : "-",
    },
    {
      label: t("dashboard.verification.progress.latestDecision"),
      value: latestDecision?.decision.replaceAll("_", " ") ?? "-",
    },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((item) => (
        <Card key={item.label} className="rounded-[22px] p-4">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
            {item.label}
          </p>
          <p className="text-brand-navy mt-2 text-xl font-bold">{item.value}</p>
          {item.detail ? (
            <p className="text-muted mt-1 text-xs">{item.detail}</p>
          ) : null}
        </Card>
      ))}
    </div>
  )
}

async function VerificationNextAction({
  blockedReasons,
  issueCount,
  status,
}: {
  blockedReasons: string[]
  issueCount: number
  status: string
}) {
  const t = await getTranslations()
  const key = status.toUpperCase()
  const action = ["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(key)
    ? t("dashboard.verification.next.wait")
    : issueCount
      ? t("dashboard.verification.next.resolveIssues")
      : blockedReasons.length
        ? t("dashboard.verification.next.upload")
        : ["VERIFIED", "APPROVED"].includes(key)
          ? t("dashboard.verification.next.verified")
          : t("dashboard.verification.next.submit")
  return (
    <Card className="border-primary/15 bg-light-blue/70 rounded-[24px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-bold tracking-wide uppercase">
            {t("dashboard.verification.next.title")}
          </p>
          <p className="text-brand-navy mt-2 text-lg font-semibold">{action}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/profile?tab=documents">
              {t("dashboard.verification.manageDocuments")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/support">{t("dashboard.nav.support")}</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

async function VerificationOverview({
  overview,
}: {
  overview: PortalVerificationOverview
}) {
  const t = await getTranslations()
  return (
    <div className="border-line/70 space-y-5 rounded-[26px] border bg-white/85 p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)]">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border-line/70 rounded-2xl border bg-slate-50/70 p-4">
          <p className="text-muted text-xs">{t("dashboard.trust.status")}</p>
          <p className="text-brand-navy mt-1 font-semibold">
            {overview.verificationStatus.replaceAll("_", " ")}
          </p>
        </div>
        <div className="border-line/70 rounded-2xl border bg-slate-50/70 p-4">
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
      <div className="space-y-3">
        <p className="text-brand-navy text-sm font-semibold">
          {t("dashboard.trust.requirements")}
        </p>
        {overview.requirements.map((item) => (
          <div
            key={item.documentType}
            className="border-line/70 hover:border-primary/25 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-50/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                {item.documentType.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="text-brand-navy truncate text-sm font-semibold">
                  {item.documentType.replaceAll("_", " ")}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {item.expiryRequired
                    ? t("dashboard.trust.expiryRequired")
                    : t("dashboard.verification.optional")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <DirectoryStatus
                value={
                  item.uploaded
                    ? t("dashboard.trust.uploaded")
                    : t("dashboard.trust.missing")
                }
              />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <p className="text-brand-navy text-sm font-semibold">
          {t("dashboard.trust.openReviews")}
        </p>
        {overview.requests.length ? (
          overview.requests.map((item) => (
            <div
              key={item.id}
              className="border-line/70 hover:border-success/25 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-50/60"
            >
              <div className="min-w-0">
                <p className="text-brand-navy truncate text-sm font-semibold">
                  {item.subjectType.replaceAll("_", " ")}
                </p>
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

function VerificationSubmitPanel({
  disabledReasons = [],
  documentIds,
  fulfilledRequiredCount = 0,
  issueCount = 0,
  requiredCount = 0,
}: {
  disabledReasons?: string[]
  documentIds: string[]
  fulfilledRequiredCount?: number
  issueCount?: number
  requiredCount?: number
}) {
  return (
    <Card className="rounded-[24px] p-5">
      <VerificationSubmitClient
        disabledReasons={disabledReasons}
        documentIds={documentIds}
        fulfilledRequiredCount={fulfilledRequiredCount}
        issueCount={issueCount}
        requiredCount={requiredCount}
      />
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
      {framed ? <Card className="space-y-4 p-6 sm:p-7">{body}</Card> : body}
    </div>
  )
}
