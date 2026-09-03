import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { ApplicationsModulePage } from "@/features/dashboard/components/applications-module-page"
import { CatalogueMutationPage } from "@/features/dashboard/components/catalogue-mutation-page"
import {
  EngagementsModulePage,
  MessagesModulePage,
  NotificationsModulePage,
  OffersModulePage,
  ProfileModulePage,
  SavedItemsModulePage,
} from "@/features/dashboard/components/portal-modules"
import { OfferCreatePage } from "@/features/dashboard/components/offer-create-page"
import { PortalTenderDetailPage } from "@/features/dashboard/components/portal-tender-detail-page"
import { PortalVerificationPage } from "@/features/dashboard/components/portal-verification-page"
import { ResilientWorkspaceModulePage } from "@/features/dashboard/components/portal-workspace-page"
import { PortalModuleLoadFallback } from "@/features/dashboard/components/portal-module-load-fallback"
import { OperationsEmptyState } from "@/features/dashboard/components/operations-ui"
import {
  SettingsModulePage,
  SupportModulePage,
} from "@/features/dashboard/components/portal-settings-pages"
import { WorkforceModulePage } from "@/features/dashboard/components/portal-workforce-modules"
import {
  OperationsPage,
  ProjectOperationsPage,
} from "@/features/dashboard/components/portal-operations-pages"
import {
  CatalogueModulePage,
  EquipmentModulePage,
  MembersModulePage,
  OpportunitiesModulePage,
  ProjectsModulePage,
  TendersModulePage,
} from "@/features/dashboard/components/portal-directory-modules"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  legacyWorkforceOperationsSubpages,
  portalDetailPath,
  portalListPath,
  resolvePortalRoute,
} from "@/features/dashboard/config/portal-routes"
import {
  getPortalBootstrap,
  getPortalOpportunity,
  getPortalTender,
} from "@/features/dashboard/data/portal-client"
import { isTenderOwnedByPortalActor } from "@/features/dashboard/lib/tender-ownership"
import { getRequiredPortalSession } from "@/lib/auth/session"
import { BackendApiError } from "@/lib/backend/api"
import { redirect } from "@/i18n/navigation"
import type { Locale, PrimaryAccountType } from "@/shared/types/platform"

export const instant = false

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function defaultScope(
  segment: string,
  accountType?: PrimaryAccountType | null,
): "owned" | "discover" {
  if (
    segment === "opportunities" &&
    (accountType === "WORKER" ||
      accountType === "SUBCONTRACTOR" ||
      accountType === "SERVICE_PROVIDER")
  ) {
    return "discover"
  }
  if (
    segment === "tenders" &&
    (accountType === "SUBCONTRACTOR" || accountType === "SERVICE_PROVIDER")
  ) {
    return "discover"
  }
  return "owned"
}

export default async function PortalModuleRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; segments: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getRequiredPortalSession()
  if (!session) return null
  const bootstrap = await getPortalBootstrap()
  const { locale, segments } = await params
  const queryParams = await searchParams
  if (
    segments[0] === "workforce" &&
    legacyWorkforceOperationsSubpages.has(segments[1] ?? "")
  ) {
    const section =
      segments[1] === "exceptions" ? "attendance/exceptions" : segments[1]
    const targetParams = new URLSearchParams()
    for (const [key, value] of Object.entries(queryParams)) {
      for (const item of Array.isArray(value) ? value : value ? [value] : []) {
        targetParams.append(key, item)
      }
    }
    const suffix = targetParams.size ? `?${targetParams.toString()}` : ""
    redirect({
      href: `/dashboard/operations/${section}${suffix}`,
      locale,
    })
  }
  const accountType =
    bootstrap?.profile.primaryAccountType ?? session.primaryAccountType
  const portalModules = new Set(
    bootstrap?.entitlements.modules ?? session.modules,
  )
  const resolved = resolvePortalRoute(
    bootstrap?.entitlements.modules ?? session.modules,
    segments,
    accountType,
  )
  if (!resolved) notFound()
  const queryId = first(queryParams.id)
  if (resolved.action === "list" && queryId) {
    redirect({
      href: portalDetailPath(resolved.definition.segment, queryId),
      locale,
    })
  }
  const offerBuyerMode =
    accountType === "PROJECT_OWNER" || portalModules.has("projects")
  if (
    resolved.definition.segment === "offers" &&
    resolved.action === "create" &&
    offerBuyerMode
  ) {
    redirect({ href: portalListPath("offers"), locale })
  }

  if (
    resolved.definition.segment === "applications" &&
    resolved.action === "create" &&
    accountType !== "WORKER"
  ) {
    redirect({ href: portalListPath("applications"), locale })
  }

  const workerOpportunityDiscoveryOnly = accountType === "WORKER"
  if (
    resolved.definition.segment === "opportunities" &&
    resolved.action === "create" &&
    workerOpportunityDiscoveryOnly
  ) {
    redirect({ href: portalListPath("opportunities"), locale })
  }

  const serviceProviderTenderDiscoveryOnly =
    accountType === "SERVICE_PROVIDER" && !bootstrap?.activeWorkspace
  if (
    resolved.definition.segment === "tenders" &&
    resolved.action === "create" &&
    serviceProviderTenderDiscoveryOnly
  ) {
    redirect({ href: portalListPath("tenders"), locale })
  }

  if (
    resolved.definition.segment === "opportunities" &&
    resolved.action === "edit" &&
    resolved.recordId
  ) {
    const opportunity = await getPortalOpportunity(resolved.recordId).catch(
      () => null,
    )
    const ownsOpportunity = Boolean(
      bootstrap &&
      opportunity &&
      (opportunity.ownerProfileId === bootstrap.profile.id ||
        (opportunity.companyId != null &&
          bootstrap.workspaces.some(
            (workspace) => workspace.companyId === opportunity.companyId,
          ))),
    )
    if (!ownsOpportunity) notFound()
  }

  // Ownership is only needed to authorize the edit route. Detail pages enforce
  // their own action boundaries and should not pay for a duplicate tender read
  // before their real detail request starts.
  if (
    resolved.definition.segment === "tenders" &&
    resolved.action === "edit" &&
    resolved.recordId
  ) {
    const tender = await getPortalTender(resolved.recordId).catch(() => null)
    const ownsTender = Boolean(
      bootstrap &&
      isTenderOwnedByPortalActor(
        tender,
        bootstrap.profile.id,
        bootstrap.workspaces.map((workspace) => workspace.companyId),
      ),
    )
    if (!ownsTender) notFound()
  }

  const requestedScope = first(queryParams.scope)
  const query: PortalQuery = {
    page: Number(first(queryParams.page) ?? 1) || 1,
    kind: first(queryParams.kind),
    q: first(queryParams.q),
    status: first(queryParams.status),
    categoryId: first(queryParams.categoryId),
    cityId: first(queryParams.cityId),
    tagId: first(queryParams.tagId),
    deadlineFrom: first(queryParams.deadlineFrom),
    deadlineTo: first(queryParams.deadlineTo),
    sort: first(queryParams.sort) === "title" ? "title" : "newest",
    scope:
      requestedScope === "discover" || requestedScope === "owned"
        ? requestedScope
        : defaultScope(resolved.definition.segment, accountType),
    action: resolved.action,
    id: resolved.recordId,
  }
  try {
    switch (resolved.definition.segment) {
      case "profile":
        return await ProfileModulePage({ initialTab: first(queryParams.tab) })
      case "settings":
        return await SettingsModulePage()
      case "notifications":
        return await NotificationsModulePage()
      case "saved":
        return await SavedItemsModulePage()
      case "workspace":
        return await ResilientWorkspaceModulePage()
      case "offers":
        return query.action === "create"
          ? await OfferCreatePage({
              bootstrap,
              tenderId: first(queryParams.tender),
              tenderTitle: first(queryParams.tenderTitle),
              tenderCurrency: first(queryParams.tenderCurrency),
              initialTarget: first(queryParams.target),
            })
          : await OffersModulePage({ query })
      case "applications":
        return await ApplicationsModulePage({ query })
      case "workforce":
        return await WorkforceModulePage({})
      case "operations":
        return await OperationsPage({
          section:
            resolved.action === "subpage" ? resolved.subpage! : "overview",
        })
      case "engagements":
        return await EngagementsModulePage({ query })
      case "messages":
        return await MessagesModulePage({ query })
      case "projects":
        return resolved.action === "subpage" && resolved.recordId
          ? await ProjectOperationsPage({
              projectId: resolved.recordId,
              section: resolved.subpage!,
            })
          : await ProjectsModulePage({ query })
      case "opportunities": {
        const content = await OpportunitiesModulePage({ query })
        return workerOpportunityDiscoveryOnly
          ? hideCreateAction(content, "opportunities")
          : content
      }
      case "tenders": {
        if (resolved.action === "detail" && resolved.recordId) {
          return await PortalTenderDetailPage({
            id: resolved.recordId,
            page: query.page,
          })
        }
        const content = await TendersModulePage({ query })
        if (serviceProviderTenderDiscoveryOnly) {
          return hideCreateAction(content, "tenders")
        }
        return content
      }
      case "members":
        return await MembersModulePage({ query })
      case "catalogue":
        return query.action === "create" || query.action === "edit"
          ? await CatalogueMutationPage({ query, bootstrap })
          : await CatalogueModulePage({ query })
      case "equipment":
        return await EquipmentModulePage({ query })
      case "verification":
        return await PortalVerificationPage()
      case "support":
        return await SupportModulePage({ query })
      default:
        notFound()
    }
  } catch (error) {
    console.error("Portal module route failed", {
      segment: resolved.definition.segment,
      error,
    })
    if (error instanceof BackendApiError && error.status === 403) {
      return (
        <OperationsEmptyState
          title="Access restricted"
          description="Your active workspace role does not have permission to view this data. Switch to an authorized workspace or ask a workspace administrator for access."
        />
      )
    }
    return (
      <PortalModuleLoadFallback
        href={`/dashboard/${resolved.definition.segment}`}
      />
    )
  }
}
function hideCreateAction(
  content: ReactNode,
  segment: "opportunities" | "tenders",
) {
  const className =
    segment === "opportunities"
      ? "[&_a[href$='/dashboard/opportunities/create']]:hidden"
      : "[&_a[href$='/dashboard/tenders/create']]:hidden"

  return <div className={className}>{content}</div>
}
