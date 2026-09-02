import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CompanyClaimList } from "@/features/dashboard/components/company-claim-list"
import { CompanyCreateForm } from "@/features/dashboard/components/company-create-form"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import { WorkspaceProfileEditor } from "@/features/dashboard/components/workspace-profile-editor"
import {
  getPortalBootstrap,
  getPortalDashboardMetrics,
  getWorkspaceOverview,
  getWorkspaceProfile,
  listPortalCompanyClaims,
  listPortalTaxonomy,
} from "@/features/dashboard/data/portal-client"
import { getActiveWorkspace } from "@/features/dashboard/lib/active-workspace"

function humanize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase())
}

export async function ResilientWorkspaceModulePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const workspace = getActiveWorkspace(bootstrap?.workspaces)

  // Workspace rendering must not be all-or-nothing. The old Promise.all rejected
  // the complete page when one optional taxonomy/metric/claim endpoint failed,
  // which surfaced as the generic portal error reported by QA. Keep the primary
  // workspace usable and degrade optional panels independently.
  const [overview, profile, dashboard, claims, categories, tags, regions] =
    await Promise.all([
      workspace
        ? getWorkspaceOverview(workspace.companyId).catch(() => null)
        : Promise.resolve(null),
      workspace
        ? getWorkspaceProfile(workspace.companyId).catch(() => null)
        : Promise.resolve(null),
      workspace
        ? getPortalDashboardMetrics().catch(() => null)
        : Promise.resolve(null),
      listPortalCompanyClaims().catch(() => ({ items: [] })),
      listPortalTaxonomy("categories").catch(() => ({ items: [] })),
      listPortalTaxonomy("tags").catch(() => ({ items: [] })),
      listPortalTaxonomy("regions").catch(() => ({ items: [] })),
    ])

  const permissions = bootstrap?.entitlements.permissions ?? []
  const workspaceMetricKeys = [
    "activeProjects",
    "draftProjects",
    "projectsPendingReview",
    "openTenders",
    "closingSoonTenders",
    "submittedOffers",
    "shortlistedOffers",
    "wonOffers",
    "receivedEnquiries",
    "teamMembers",
    "pendingInvitations",
    "expiringDocuments",
    "unreadMessages",
    "openSupportTickets",
  ] as const

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.workspace")}
        description={t("dashboard.descriptions.workspace")}
      />

      {overview ? (
        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase">
                  {t("dashboard.nav.workspace")}
                </p>
                <h2 className="text-foreground mt-1.5 truncate text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                  {overview.workspace.name}
                </h2>
                {overview.workspace.role ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {humanize(overview.workspace.role)}
                  </p>
                ) : null}
              </div>
              {overview.workspace.status ? (
                <StatusBadge status={overview.workspace.status} />
              ) : null}
            </CardContent>
          </Card>

          {dashboard ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {workspaceMetricKeys
                .filter((key) => dashboard.metrics[key] !== undefined)
                .map((key) => (
                  <Card
                    key={key}
                    className="hover:border-primary/15 transition-colors"
                  >
                    <CardContent className="pt-5 sm:pt-5">
                      <p className="text-muted-foreground text-xs font-medium">
                        {t(`dashboard.metric.${key}`)}
                      </p>
                      <p className="text-foreground mt-1.5 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
                        {dashboard.metrics[key] ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : null}

          {profile && workspace && permissions.includes("company.edit") ? (
            <Card>
              <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
                <CardTitle>{t("dashboard.nav.workspace")}</CardTitle>
                <CardDescription>
                  {t("dashboard.descriptions.workspace")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 sm:pt-6">
                <WorkspaceProfileEditor
                  companyId={workspace.companyId}
                  profile={profile}
                  permissions={permissions}
                  taxonomy={{
                    categories: categories.items,
                    tags: tags.items,
                    regions: regions.items,
                  }}
                />
              </CardContent>
            </Card>
          ) : null}

          {claims.items.length ? (
            <Card>
              <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
                <CardTitle>{t("dashboard.nav.workspace")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 sm:pt-6">
                <CompanyClaimList items={claims.items} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Card>
            <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
              <CardTitle>{t("dashboard.companyForm.create")}</CardTitle>
              <CardDescription>
                {t("dashboard.companyForm.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 sm:pt-6">
              <CompanyCreateForm categories={categories.items} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
              <CardTitle>{t("dashboard.nav.workspace")}</CardTitle>
              <CardDescription>{t("dashboard.noWorkspace")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 sm:pt-6">
              <CompanyClaimList items={claims.items} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
