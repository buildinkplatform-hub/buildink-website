import { getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import { CompanyClaimList } from "@/features/dashboard/components/company-claim-list"
import { CompanyCreateForm } from "@/features/dashboard/components/company-create-form"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
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
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.workspace")}
        description={t("dashboard.descriptions.workspace")}
      />
      {overview ? (
        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
              {t("dashboard.nav.workspace")}
            </p>
            <h2 className="text-brand-navy mt-3 text-3xl font-bold">
              {overview.workspace.name}
            </h2>
            <p className="text-muted mt-2 text-sm leading-6">
              {[overview.workspace.role, overview.workspace.status]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Card>

          {dashboard ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {workspaceMetricKeys
                .filter((key) => dashboard.metrics[key] !== undefined)
                .map((key) => (
                  <Card
                    key={key}
                    className="rounded-[24px] border-slate-200/80 p-5 shadow-sm"
                  >
                    <p className="text-muted text-sm">
                      {t(`dashboard.metric.${key}`)}
                    </p>
                    <p className="text-brand-navy mt-2 text-2xl font-bold">
                      {dashboard.metrics[key] ?? 0}
                    </p>
                  </Card>
                ))}
            </div>
          ) : null}

          {profile && workspace && permissions.includes("company.edit") ? (
            <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
              <div className="mb-6">
                <h2 className="text-brand-navy text-xl font-semibold">
                  {t("dashboard.nav.workspace")}
                </h2>
                <p className="text-muted mt-2 text-sm leading-6">
                  {t("dashboard.descriptions.workspace")}
                </p>
              </div>
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
            </Card>
          ) : null}

          {claims.items.length ? (
            <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
              <div className="mb-6">
                <h2 className="text-brand-navy text-xl font-semibold">
                  {t("dashboard.nav.workspace")}
                </h2>
              </div>
              <CompanyClaimList items={claims.items} />
            </Card>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
            <div className="mb-6">
              <h2 className="text-brand-navy text-xl font-semibold">
                {t("dashboard.companyForm.create")}
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                {t("dashboard.companyForm.description")}
              </p>
            </div>
            <CompanyCreateForm categories={categories.items} />
          </Card>
          <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
            <div className="mb-6">
              <h2 className="text-brand-navy text-xl font-semibold">
                {t("dashboard.nav.workspace")}
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                {t("dashboard.noWorkspace")}
              </p>
            </div>
            <CompanyClaimList items={claims.items} />
          </Card>
        </div>
      )}
    </div>
  )
}
