import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { PortalFormDialog } from "@/features/dashboard/components/portal-form-dialog"
import {
  ApplicationStageActions,
  ApplicationDecisionActions,
  ApplicationWithdrawAction,
} from "@/features/dashboard/components/marketplace-actions"
import { MessagesModuleClient } from "@/features/dashboard/components/messages-module-client"
import {
  ApplicationCreateForm,
  RetryButton,
} from "@/features/dashboard/components/marketplace-create"
import { ProfilePageClient } from "@/features/dashboard/components/profile-page-client"
import { WorkspaceProfileEditor } from "@/features/dashboard/components/workspace-profile-editor"
import { SavedSearchForm } from "@/features/dashboard/components/saved-search-form"
import { SavedSearchList } from "@/features/dashboard/components/saved-search-list"
import { SavedItemList } from "@/features/dashboard/components/saved-item-list"
import { CompanyCreateForm } from "@/features/dashboard/components/company-create-form"
import { CompanyClaimList } from "@/features/dashboard/components/company-claim-list"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { WorkerProfileRecords } from "@/features/dashboard/components/worker-profile-records"
import {
  getPortalBootstrap,
  getPortalApplication,
  getPortalDashboardMetrics,
  listPortalCompanyClaims,
  getPortalProfile,
  type PortalBootstrapProfile,
  getPortalConversation,
  getPortalPersona,
  getPortalProfileCollections,
  getPortalVisibility,
  getWorkspaceOverview,
  getWorkspaceApplication,
  getWorkspaceProfile,
  getPortalWorkforceOverview,
  listApplicationTargets,
  listPortalApplications,
  listPortalConversations,
  listPortalDocuments,
  listPortalEngagements,
  listPortalSavedItems,
  listPortalSavedSearches,
  listWorkspaceApplications,
  listPortalTaxonomy,
} from "@/features/dashboard/data/portal-client"
import {
  getActiveCompanyId,
  getActiveWorkspace,
} from "@/features/dashboard/lib/active-workspace"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import { portalListPath } from "@/features/dashboard/config/portal-routes"
import { PortalNotificationsPage } from "@/features/dashboard/notifications/notifications-page"
import { Link } from "@/i18n/navigation"
import { OffersBoard } from "@/features/dashboard/components/offers-board"

type Translator = Awaited<ReturnType<typeof getTranslations>>

function tableLabels(t: Translator): PortalTableLabels {
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

async function ProfileStatusSummary({
  profile,
}: {
  profile: PortalBootstrapProfile
}) {
  const t = await getTranslations()
  const items = [
    {
      label: t("dashboard.profile.accountType"),
      value: (profile.primaryAccountType ?? "—").replaceAll("_", " "),
    },
    {
      label: t("dashboard.profile.onboardingStatus"),
      value: profile.onboardingStatus.replaceAll("_", " "),
    },
    {
      label: t("dashboard.profile.verificationStatus"),
      value: profile.verificationStatus.replaceAll("_", " "),
    },
    {
      label: t("dashboard.profile.publicationStatus"),
      value: profile.publicationStatus.replaceAll("_", " "),
    },
  ]
  return (
    <Card>
      <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 sm:pt-6 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-border/90 rounded-xl border bg-slate-50/60 p-4 dark:bg-white/[0.025]"
          >
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {item.label}
            </p>
            <p className="text-brand-navy mt-1.5 text-sm font-semibold break-words">
              {item.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export async function ProfileModulePage({
  initialTab,
}: {
  initialTab?: string
} = {}) {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const profile = bootstrap?.profile ?? (await getPortalProfile())
  return (
    <div className="w-full space-y-5">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.profile")}
        description={t("dashboard.descriptions.profile")}
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/settings">
                {t("dashboard.nav.settings")}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/verification">
                {t("dashboard.nav.verification")}
              </Link>
            </Button>
          </>
        }
      />
      {profile ? (
        <>
          <ProfileStatusSummary profile={profile} />
          <ProfileTabPanels profile={profile} initialTab={initialTab} />
        </>
      ) : (
        <EmptyStateCard
          message={t("dashboard.bootstrapUnavailable")}
          action={<RetryButton label={t("dashboard.retry")} />}
        />
      )}
    </div>
  )
}

async function ProfileTabPanels({
  profile,
  initialTab,
}: {
  profile: PortalBootstrapProfile
  initialTab?: string
}) {
  const [persona, visibility, collections, documents] = await Promise.all([
    getPortalPersona().catch(() => null),
    getPortalVisibility().catch(() => null),
    getPortalProfileCollections().catch(() => null),
    listPortalDocuments().catch(() => null),
  ])
  return (
    <ProfilePageClient
      profile={profile}
      persona={persona}
      visibility={visibility}
      collections={collections}
      documents={documents?.items ?? []}
      initialTab={initialTab}
    />
  )
}

export async function NotificationsModulePage() {
  return <PortalNotificationsPage />
}

export async function SavedItemsModulePage() {
  const t = await getTranslations()
  const [result, searches] = await Promise.all([
    listPortalSavedItems().catch(() => null),
    listPortalSavedSearches().catch(() => null),
  ])
  const loadFailed = !result || !searches
  return (
    <div className="w-full space-y-5">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.saved")}
        description={t("dashboard.descriptions.saved")}
      />
      {loadFailed ? (
        <EmptyStateCard
          message={t("dashboard.bootstrapUnavailable")}
          action={<RetryButton label={t("dashboard.retry")} />}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <SectionCard
            title={t("dashboard.savedSearch.shortlist")}
            description={t("dashboard.descriptions.saved")}
          >
            <SavedItemList items={result.items} />
          </SectionCard>
          <div className="space-y-5">
            <SectionCard
              title={t("dashboard.savedSearch.title")}
              description={t("dashboard.descriptions.saved")}
            >
              <SavedSearchList items={searches.items} />
            </SectionCard>
            <SectionCard
              title={t("dashboard.table.actions")}
              description={t("dashboard.savedSearch.title")}
            >
              <SavedSearchForm />
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  )
}

export async function WorkspaceModulePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const workspace = getActiveWorkspace(bootstrap?.workspaces)
  const [overview, profile, dashboard, claims, categories, tags, regions] =
    await Promise.all([
      workspace
        ? getWorkspaceOverview(workspace.companyId)
        : Promise.resolve(null),
      workspace
        ? getWorkspaceProfile(workspace.companyId)
        : Promise.resolve(null),
      workspace ? getPortalDashboardMetrics() : Promise.resolve(null),
      listPortalCompanyClaims(),
      listPortalTaxonomy("categories"),
      listPortalTaxonomy("tags"),
      listPortalTaxonomy("regions"),
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
    <div className="w-full space-y-5">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.workspace")}
        description={t("dashboard.descriptions.workspace")}
      />
      {overview ? (
        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-5 sm:pt-6">
              <div>
                <p className="text-primary text-[11px] font-bold tracking-[0.14em] uppercase">
                  {t("dashboard.nav.workspace")}
                </p>
                <h2 className="text-brand-navy mt-1.5 text-2xl font-bold tracking-[-0.025em]">
                  {overview.workspace.name}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {[overview.workspace.role, overview.workspace.status]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workspaceMetricKeys
              .filter((key) => dashboard?.metrics[key] !== undefined)
              .map((key) => (
                <Card key={key}>
                  <CardContent className="pt-5 sm:pt-5">
                    <p className="text-muted-foreground text-xs font-semibold">
                      {t(`dashboard.metric.${key}`)}
                    </p>
                    <p className="text-brand-navy mt-1.5 text-[1.65rem] leading-8 font-bold tracking-[-0.03em] tabular-nums">
                      {dashboard?.metrics[key] ?? 0}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
          {profile && permissions.includes("company.edit") ? (
            <SectionCard
              title={t("dashboard.nav.workspace")}
              description={t("dashboard.descriptions.workspace")}
            >
              <WorkspaceProfileEditor
                companyId={workspace!.companyId}
                profile={profile}
                permissions={permissions}
                taxonomy={{
                  categories: categories.items,
                  tags: tags.items,
                  regions: regions.items,
                }}
              />
            </SectionCard>
          ) : null}
          {claims.items.length ? (
            <SectionCard
              title={t("dashboard.nav.workspace")}
              description={t("dashboard.descriptions.workspace")}
            >
              <CompanyClaimList items={claims.items} />
            </SectionCard>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <SectionCard
            title={t("dashboard.companyForm.create")}
            description={t("dashboard.companyForm.description")}
          >
            <CompanyCreateForm categories={categories.items} />
          </SectionCard>
          <SectionCard
            title={t("dashboard.nav.workspace")}
            description={t("dashboard.noWorkspace")}
          >
            <p className="text-muted-foreground leading-6">
              {t("dashboard.noWorkspace")}
            </p>
            <CompanyClaimList items={claims.items} />
          </SectionCard>
        </div>
      )}
    </div>
  )
}

export async function AccountModulePage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const t = await getTranslations()
  return (
    <ModuleFrame title={title} description={description}>
      <EmptyStateCard message={t("dashboard.moduleReady")} />
    </ModuleFrame>
  )
}

export async function OffersModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  return (
    <OffersBoard
      query={query ?? (detailId ? { action: "detail", id: detailId } : {})}
    />
  )
}

export async function ApplicationsModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  const bootstrap = await getPortalBootstrap()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const isWorker = bootstrap?.profile.primaryAccountType === "WORKER"
  const selectedApplication = resolvedId
    ? isWorker || !companyId
      ? await getPortalApplication(resolvedId)
      : await getWorkspaceApplication(companyId, resolvedId)
    : undefined
  const [submitted, received, targets] = resolvedId
    ? [{ items: [] }, { items: [] }, { items: [] }]
    : await Promise.all([
        listPortalApplications("submitted"),
        companyId
          ? listWorkspaceApplications(companyId)
          : listPortalApplications("received"),
        listApplicationTargets(),
      ])
  const workforce =
    isWorker && !resolvedId ? await getPortalWorkforceOverview() : null
  const applicationItems = selectedApplication
    ? [selectedApplication]
    : [...received.items, ...submitted.items]
  if (query?.action === "create") {
    return (
      <div className="w-full space-y-5">
        <PortalPageHeader
          eyebrow={t("common.dashboard")}
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
        <SectionCard
          title={t("dashboard.create.applicationTitle")}
          description={t("dashboard.descriptions.applications")}
        >
          <ApplicationCreateForm targets={targets.items} />
        </SectionCard>
      </div>
    )
  }
  return (
    <ModuleFrame
      title={t("dashboard.nav.applications")}
      description={t("dashboard.descriptions.applications")}
    >
      <div className="space-y-4">
        {!resolvedId ? (
          <div className="flex justify-end">
            <PortalFormDialog
              triggerLabel={t("dashboard.create.applicationTitle")}
              title={t("dashboard.create.applicationTitle")}
              description={t("dashboard.descriptions.applications")}
            >
              <ApplicationCreateForm targets={targets.items} />
            </PortalFormDialog>
          </div>
        ) : null}
        {workforce && !resolvedId ? (
          <WorkerProfileRecords data={workforce} />
        ) : null}
        {selectedApplication ? (
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <EntityDetailFields
                entity="application"
                data={selectedApplication as unknown as Record<string, unknown>}
                labels={(key) =>
                  t(`dashboard.${key}` as "dashboard.fields.title")
                }
              />
            </CardContent>
          </Card>
        ) : null}
        <RecordList
          segment="applications"
          selectedId={resolvedId}
          labels={tableLabels(t)}
          empty={t("dashboard.applicationsEmpty")}
          items={applicationItems.map((item) => ({
            id: item.id,
            title: item.opportunityTitle || item.reference,
            meta: `${item.status} · ${item.inbox}`,
            conversationId: item.conversationId,
            contactUnlocked: item.contactUnlocked,
            detail: item.coverMessage ?? undefined,
            actions: (
              <>
                {companyId &&
                item.inbox === "received" &&
                ![
                  "HIRED",
                  "ACCEPTED",
                  "REJECTED",
                  "WITHDRAWN",
                  "EXPIRED",
                ].includes(item.status) ? (
                  <>
                    <ApplicationStageActions
                      companyId={companyId}
                      id={item.id}
                      version={item.version}
                      label={t("dashboard.workforce.updateStage")}
                    />
                    <ApplicationDecisionActions
                      companyId={companyId}
                      id={item.id}
                      version={item.version}
                      acceptLabel={t("dashboard.marketplace.accept")}
                      rejectLabel={t("dashboard.marketplace.reject")}
                    />
                  </>
                ) : null}
                {item.inbox === "submitted" &&
                ![
                  "WITHDRAWN",
                  "ACCEPTED",
                  "REJECTED",
                  "HIRED",
                  "EXPIRED",
                ].includes(item.status) ? (
                  <ApplicationWithdrawAction
                    id={item.id}
                    version={item.version}
                    label={t("dashboard.marketplace.withdraw")}
                  />
                ) : null}
              </>
            ),
          }))}
          messageLabel={t("dashboard.marketplace.message")}
          lockedLabel={t("dashboard.marketplace.contactLocked")}
        />
      </div>
    </ModuleFrame>
  )
}

export async function EngagementsModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  const result = await listPortalEngagements()
  const selectedEngagement = resolvedId
    ? result.items.find((item) => item.id === resolvedId)
    : undefined
  return (
    <ModuleFrame
      title={t("dashboard.nav.engagements")}
      description={t("dashboard.descriptions.engagements")}
    >
      <div className="space-y-4">
        {selectedEngagement ? (
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <EntityDetailFields
                entity="engagement"
                data={selectedEngagement as unknown as Record<string, unknown>}
                labels={(key) =>
                  t(`dashboard.${key}` as "dashboard.fields.title")
                }
              />
            </CardContent>
          </Card>
        ) : null}
        <RecordList
          segment="engagements"
          selectedId={resolvedId}
          labels={tableLabels(t)}
          empty={t("dashboard.engagementsEmpty")}
          items={result.items.map((item) => ({
            id: item.id,
            title: item.title || item.reference,
            meta: item.status,
            money: item.agreedPriceMinor,
            currency: item.currency,
            conversationId: item.conversationId,
            contactUnlocked: item.contactUnlocked,
            detail: item.parties
              .map((party) =>
                item.contactUnlocked
                  ? `${party.displayName ?? party.role}${party.email ? ` · ${party.email}` : ""}`
                  : (party.displayName ?? party.role),
              )
              .join(" · "),
          }))}
          messageLabel={t("dashboard.marketplace.message")}
          lockedLabel={t("dashboard.marketplace.contactLocked")}
        />
      </div>
    </ModuleFrame>
  )
}

export async function MessagesModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  const result = await listPortalConversations()
  const conversationId = resolvedId
  const conversation = conversationId
    ? await getPortalConversation(conversationId)
    : null
  return (
    <ModuleFrame
      title={t("dashboard.nav.messages")}
      description={t("dashboard.descriptions.messages")}
    >
      <MessagesModuleClient
        conversations={result.items}
        conversation={conversation}
        labels={tableLabels(t)}
        emptyLabel={t("dashboard.messagesEmpty")}
        messagesLabel={t("dashboard.nav.messages")}
        counterpartLabel={t("dashboard.marketplace.counterpart")}
        lockedLabel={t("dashboard.marketplace.contactLocked")}
        placeholder={t("dashboard.marketplace.messagePlaceholder")}
        sendLabel={t("dashboard.marketplace.send")}
        detailId={resolvedId}
      />
    </ModuleFrame>
  )
}

function RecordList({
  items,
  empty,
  messageLabel,
  lockedLabel,
  segment,
  labels,
  selectedId,
}: {
  items: Array<{
    id: string
    title: string
    meta: string
    money?: string | null
    currency?: string | null
    conversationId?: string | null
    contactUnlocked?: boolean
    detail?: string
    actions?: ReactNode
  }>
  empty: string
  messageLabel: string
  lockedLabel: string
  segment: string
  labels: PortalTableLabels
  selectedId?: string
}) {
  const selected = selectedId
    ? items.find((item) => item.id === selectedId)
    : undefined
  if (selected) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link href={`/dashboard/${segment}`}>← {labels.previous}</Link>
        </Button>
        <Card>
          <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
            <CardTitle>{selected.title}</CardTitle>
            <CardDescription>{selected.meta}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 sm:pt-6">
            {selected.money ? (
              <p className="text-brand-navy text-xl font-bold tabular-nums">
                {selected.money} {selected.currency}
              </p>
            ) : null}
            {selected.detail ? (
              <p className="text-muted-foreground text-sm leading-6">
                {selected.detail}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {selected.conversationId ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/dashboard/messages/${selected.conversationId}`}>
                    {messageLabel}
                  </Link>
                </Button>
              ) : null}
              {selected.actions}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <PortalDataTable
      empty={empty}
      labels={labels}
      rows={items.map((item) => ({
        id: item.id,
        title: item.title,
        secondary: item.money
          ? `${item.money} ${item.currency ?? ""}`
          : undefined,
        meta: [
          item.meta,
          item.detail,
          !item.contactUnlocked ? lockedLabel : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        statuses: item.meta.split(" · ").slice(0, 2),
        detailHref: `/dashboard/${segment}/${item.id}`,
        actions: (
          <>
            {item.conversationId ? (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/dashboard/messages/${item.conversationId}`}>
                  {messageLabel}
                </Link>
              </Button>
            ) : null}
            {item.actions}
          </>
        ),
      }))}
    />
  )
}

function ModuleFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="w-full space-y-5">
      <PortalPageHeader title={title} description={description} compact />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">{children}</CardContent>
    </Card>
  )
}

function EmptyStateCard({
  message,
  action,
}: {
  message: string
  action?: ReactNode
}) {
  return (
    <Card className="grid min-h-52 place-items-center border-dashed p-8 text-center shadow-none">
      <div className="max-w-md">
        <span className="border-primary/10 bg-primary/8 text-primary mx-auto grid size-11 place-items-center rounded-xl border">
          <Inbox className="size-5" aria-hidden="true" />
        </span>
        <p className="text-muted-foreground mt-4 text-sm leading-6">
          {message}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </Card>
  )
}
