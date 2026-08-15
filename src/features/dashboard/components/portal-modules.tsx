import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { PortalFormDialog } from "@/features/dashboard/components/portal-form-dialog"
import {
  ApplicationStageActions,
  ApplicationDecisionActions,
  OfferDecisionActions,
  OfferWithdrawAction,
  ApplicationWithdrawAction,
} from "@/features/dashboard/components/marketplace-actions"
import { MessagesModuleClient } from "@/features/dashboard/components/messages-module-client"
import {
  ApplicationCreateForm,
  OfferCreateForm,
  RetryButton,
} from "@/features/dashboard/components/marketplace-create"
import { ProfileEditor } from "@/features/dashboard/components/profile-editor"
import { ProfileCollectionsEditor } from "@/features/dashboard/components/profile-collections-editor"
import {
  PersonaEditor,
  VisibilityEditor,
} from "@/features/dashboard/components/profile-protected"
import { WorkspaceProfileEditor } from "@/features/dashboard/components/workspace-profile-editor"
import { SavedSearchForm } from "@/features/dashboard/components/saved-search-form"
import { SavedSearchList } from "@/features/dashboard/components/saved-search-list"
import { SavedItemList } from "@/features/dashboard/components/saved-item-list"
import { CompanyCreateForm } from "@/features/dashboard/components/company-create-form"
import { CompanyClaimList } from "@/features/dashboard/components/company-claim-list"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { SaveItemButton } from "@/features/public/components/save-item-button"
import { WorkerProfileRecords } from "@/features/dashboard/components/worker-profile-records"
import {
  getPortalBootstrap,
  getPortalDashboardMetrics,
  listPortalCompanyClaims,
  getPortalProfile,
  type PortalBootstrapProfile,
  getPortalConversation,
  getPortalPersona,
  getPortalProfileCollections,
  getPortalVisibility,
  getWorkspaceOverview,
  getWorkspaceProfile,
  getPortalWorkforceOverview,
  listApplicationTargets,
  listOfferTargets,
  listPortalApplications,
  listPortalConversations,
  listPortalEngagements,
  listPortalOffers,
  listPortalOfferRevisions,
  listPortalSavedItems,
  listPortalSavedSearches,
  listWorkspaceApplications,
  listWorkspaceOffers,
  listPortalTaxonomy,
} from "@/features/dashboard/data/portal-client"
import {
  getActiveCompanyId,
  getActiveWorkspace,
} from "@/features/dashboard/lib/active-workspace"
import { EntityDetailFields } from "@/features/dashboard/components/entity-detail-fields"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  portalListPath,
} from "@/features/dashboard/config/portal-routes"
import { PortalNotificationsPage } from "@/features/dashboard/notifications/notifications-page"
import { Link } from "@/i18n/navigation"

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
    <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-[linear-gradient(135deg,#071A33,#0B2450)] p-6 text-white shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
            <p className="text-white/70 text-xs uppercase tracking-[0.18em]">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
        </div>
      ))}
      </div>
    </Card>
  )
}

export async function ProfileModulePage() {
  const t = await getTranslations()
  const bootstrap = await getPortalBootstrap()
  const profile = bootstrap?.profile ?? (await getPortalProfile())
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.profile")}
        description={t("dashboard.descriptions.profile")}
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/settings">{t("dashboard.nav.settings")}</Link>
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <SectionCard
                title={t("dashboard.nav.profile")}
                description={t("dashboard.descriptions.profile")}
              >
                <ProfileEditor profile={profile} />
              </SectionCard>
            </div>
            <div className="space-y-6">
              <SectionCard
                title={t("dashboard.profile.accountType")}
                description={t("dashboard.profile.verificationStatus")}
              >
                <PersonaAndVisibility version={profile.version} />
              </SectionCard>
            </div>
          </div>
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

async function PersonaAndVisibility({ version }: { version: number }) {
  const [persona, visibility, collections] = await Promise.all([
    getPortalPersona(),
    getPortalVisibility(),
    getPortalProfileCollections().catch(() => null),
  ])
  return (
    <>
      {persona ? (
        <PersonaEditor persona={persona} profileVersion={version} />
      ) : null}
      {collections ? (
        <ProfileCollectionsEditor collections={collections} />
      ) : null}
      {visibility ? <VisibilityEditor visibility={visibility} /> : null}
    </>
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
    <div className="w-full space-y-6">
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <SectionCard
            title={t("dashboard.savedSearch.shortlist")}
            description={t("dashboard.descriptions.saved")}
          >
            <SavedItemList items={result.items} />
          </SectionCard>
          <div className="space-y-6">
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
  const [
    overview,
    profile,
    dashboard,
    claims,
    categories,
    tags,
    regions,
  ] = await Promise.all([
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workspaceMetricKeys
              .filter((key) => dashboard?.metrics[key] !== undefined)
              .map((key) => (
                <Card
                  key={key}
                  className="rounded-[24px] border-slate-200/80 p-5 shadow-sm"
                >
                  <p className="text-muted text-sm">
                    {t(`dashboard.metric.${key}`)}
                  </p>
                  <p className="text-brand-navy mt-2 text-2xl font-bold">
                    {dashboard?.metrics[key] ?? 0}
                  </p>
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
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
            <p className="text-muted leading-7">{t("dashboard.noWorkspace")}</p>
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
      <p className="text-muted">{t("dashboard.moduleReady")}</p>
    </ModuleFrame>
  )
}

export async function OffersModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  const bootstrap = await getPortalBootstrap()
  const [submitted, opportunities, packages, lots] = await Promise.all([
    listPortalOffers("submitted"),
    listOfferTargets("opportunity"),
    listOfferTargets("package"),
    listOfferTargets("lot"),
  ])
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const received = companyId
    ? await listWorkspaceOffers(companyId)
    : await listPortalOffers("received")
  const revisions = resolvedId
    ? await listPortalOfferRevisions(resolvedId)
    : { items: [] }
  const selectedOffer = resolvedId
    ? [...received.items, ...submitted.items].find(
        (item) => item.id === resolvedId,
      )
    : undefined
  if (query?.action === "create") {
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          eyebrow={t("common.dashboard")}
          title={t("dashboard.create.offerTitle")}
          description={t("dashboard.descriptions.offers")}
          actions={
            <Button asChild variant="secondary" size="sm">
              <Link href={portalListPath("offers")}>{t("common.back")}</Link>
            </Button>
          }
        />
        <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
          <OfferCreateForm
            opportunities={opportunities.items}
            packages={packages.items}
            lots={lots.items}
            submitterCompanyId={companyId}
          />
        </Card>
      </div>
    )
  }
  return (
    <ModuleFrame
      title={t("dashboard.nav.offers")}
      description={t("dashboard.descriptions.offers")}
    >
      {!resolvedId ? (
        <PortalFormDialog
          triggerLabel={t("dashboard.create.offerTitle")}
          title={t("dashboard.create.offerTitle")}
          description={t("dashboard.descriptions.offers")}
        >
          <OfferCreateForm
            opportunities={opportunities.items}
            packages={packages.items}
            lots={lots.items}
            submitterCompanyId={companyId}
          />
        </PortalFormDialog>
      ) : null}
      {selectedOffer ? (
        <div className="space-y-4">
          <EntityDetailFields
            entity="offer"
            data={selectedOffer as unknown as Record<string, unknown>}
            labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
          />
          <SaveItemButton
            entityType="OFFER"
            entityId={selectedOffer.id}
            label={selectedOffer.title ?? selectedOffer.reference}
            isAuthenticated
            variant="dashboard"
          />
        </div>
      ) : null}
      {revisions.items.length ? (
        <Card className="p-4">
          <h3 className="text-brand-navy font-semibold">
            {t("dashboard.marketplace.revisions", {
              count: revisions.items.length,
            })}
          </h3>
          <ul className="text-muted mt-3 space-y-2 text-sm">
            {revisions.items.map((revision) => (
              <li key={revision.id}>
                #{revision.revisionNo} · {revision.status} ·{" "}
                {revision.totalPriceMinor ?? revision.proposedPriceMinor}{" "}
                {revision.currency}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <RecordList
        segment="offers"
        selectedId={resolvedId}
        labels={tableLabels(t)}
        empty={t("dashboard.offersEmpty")}
        items={[...received.items, ...submitted.items].map((item) => ({
          id: item.id,
          title: item.targetTitle || item.title || item.reference,
          meta: `${item.status} · ${item.inbox} · ${t("dashboard.marketplace.revisions", { count: item.revisionCount })}`,
          money: item.totalPriceMinor ?? item.proposedPriceMinor,
          currency: item.currency,
          conversationId: item.conversationId,
          contactUnlocked: item.contactUnlocked,
          actions: (
            <>
              {companyId &&
              item.inbox === "received" &&
              !["ACCEPTED", "REJECTED", "WITHDRAWN", "EXPIRED"].includes(
                item.status,
              ) ? (
                <OfferDecisionActions
                  companyId={companyId}
                  id={item.id}
                  version={item.version}
                  acceptLabel={t("dashboard.marketplace.accept")}
                  rejectLabel={t("dashboard.marketplace.reject")}
                  requestChangesLabel={t(
                    "dashboard.marketplace.requestChanges",
                  )}
                  shortlistLabel={t("dashboard.marketplace.shortlist")}
                />
              ) : null}
              {item.inbox === "submitted" &&
              !["WITHDRAWN", "ACCEPTED", "REJECTED", "EXPIRED"].includes(
                item.status,
              ) ? (
                <OfferWithdrawAction
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
    </ModuleFrame>
  )
}

export async function ApplicationsModulePage({
  query,
  detailId,
}: { detailId?: string; query?: PortalQuery } = {}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  const bootstrap = await getPortalBootstrap()
  const submitted = await listPortalApplications("submitted")
  const targets = await listApplicationTargets()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)
  const received = companyId
    ? await listWorkspaceApplications(companyId)
    : await listPortalApplications("received")
  const workforce =
    bootstrap?.profile.primaryAccountType === "WORKER"
      ? await getPortalWorkforceOverview()
      : null
  const selectedApplication = resolvedId
    ? [...received.items, ...submitted.items].find(
        (item) => item.id === resolvedId,
      )
    : undefined
  if (query?.action === "create") {
    return (
      <div className="w-full space-y-6">
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
        <Card className="rounded-[28px] border-slate-200/80 p-6 shadow-sm">
          <ApplicationCreateForm targets={targets.items} />
        </Card>
      </div>
    )
  }
  return (
    <ModuleFrame
      title={t("dashboard.nav.applications")}
      description={t("dashboard.descriptions.applications")}
    >
      {!resolvedId ? (
        <PortalFormDialog
          triggerLabel={t("dashboard.create.applicationTitle")}
          title={t("dashboard.create.applicationTitle")}
          description={t("dashboard.descriptions.applications")}
        >
          <ApplicationCreateForm targets={targets.items} />
        </PortalFormDialog>
      ) : null}
      {workforce && !resolvedId ? (
        <WorkerProfileRecords data={workforce} />
      ) : null}
      {selectedApplication ? (
        <EntityDetailFields
          entity="application"
          data={selectedApplication as unknown as Record<string, unknown>}
          labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
        />
      ) : null}
      <RecordList
        segment="applications"
        selectedId={resolvedId}
        labels={tableLabels(t)}
        empty={t("dashboard.applicationsEmpty")}
        items={[...received.items, ...submitted.items].map((item) => ({
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
      {selectedEngagement ? (
        <EntityDetailFields
          entity="engagement"
          data={selectedEngagement as unknown as Record<string, unknown>}
          labels={(key) => t(`dashboard.${key}` as "dashboard.fields.title")}
        />
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
        <Link
          href={`/dashboard/${segment}`}
          className="text-primary inline-flex text-sm font-semibold"
        >
          ← {labels.previous}
        </Link>
        <Card className="rounded-[28px] border-slate-200/80 p-5 shadow-sm sm:p-7">
          <h2 className="text-brand-navy text-2xl font-bold">
            {selected.title}
          </h2>
          <p className="text-muted mt-2">{selected.meta}</p>
          {selected.money ? (
            <p className="text-brand-navy mt-5 text-xl font-bold">
              {selected.money} {selected.currency}
            </p>
          ) : null}
          {selected.detail ? (
            <p className="text-muted mt-4 leading-7">{selected.detail}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {selected.conversationId ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/dashboard/messages/${selected.conversationId}`}>
                  {messageLabel}
                </Link>
              </Button>
            ) : null}
            {selected.actions}
          </div>
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
    <div className="w-full space-y-6">
      <PortalPageHeader title={title} description={description} compact />
      <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)]">
        {children}
      </Card>
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
    <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
      <div className="mb-6">
        <h2 className="text-brand-navy text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted mt-2 text-sm leading-6">{description}</p>
        ) : null}
      </div>
      {children}
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
    <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
      <p className="text-muted text-sm leading-6">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  )
}
