import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"

import {
  ApplicationsModulePage,
  EngagementsModulePage,
  MessagesModulePage,
  NotificationsModulePage,
  OffersModulePage,
  ProfileModulePage,
  SavedItemsModulePage,
  WorkspaceModulePage,
} from "@/features/dashboard/components/portal-modules"
import {
  SettingsModulePage,
  SupportModulePage,
} from "@/features/dashboard/components/portal-settings-pages"
import { WorkforceModulePage } from "@/features/dashboard/components/portal-workforce-modules"
import {
  CatalogueModulePage,
  EquipmentModulePage,
  MembersModulePage,
  OpportunitiesModulePage,
  ProjectsModulePage,
  TendersModulePage,
  VerificationModulePage,
} from "@/features/dashboard/components/portal-directory-modules"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  portalDetailPath,
  resolvePortalRoute,
} from "@/features/dashboard/config/portal-routes"
import { getRequiredPortalSession } from "@/lib/auth/session"
import { redirect } from "@/i18n/navigation"

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PortalModuleRoute({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getRequiredPortalSession()
  if (!session) return null
  const { segments } = await params
  const resolved = resolvePortalRoute(
    session.modules,
    segments,
    session.primaryAccountType,
  )
  if (!resolved) notFound()
  const queryParams = await searchParams
  const queryId = first(queryParams.id)
  if (resolved.action === "list" && queryId) {
    redirect({
      href: portalDetailPath(resolved.definition.segment, queryId),
      locale: await getLocale(),
    })
  }
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
    scope: (first(queryParams.scope) === "discover" ? "discover" : "owned") as
      "owned" | "discover",
    action: resolved.action,
    id: resolved.recordId,
  }
  switch (resolved.definition.segment) {
    case "profile":
      return <ProfileModulePage />
    case "settings":
      return <SettingsModulePage />
    case "notifications":
      return <NotificationsModulePage />
    case "saved":
      return <SavedItemsModulePage />
    case "workspace":
      return <WorkspaceModulePage />
    case "offers":
      return <OffersModulePage query={query} />
    case "applications":
      return <ApplicationsModulePage query={query} />
    case "workforce":
      return <WorkforceModulePage />
    case "engagements":
      return <EngagementsModulePage query={query} />
    case "messages":
      return <MessagesModulePage query={query} />
    case "projects":
      return <ProjectsModulePage query={query} />
    case "opportunities":
      return <OpportunitiesModulePage query={query} />
    case "tenders":
      return <TendersModulePage query={query} />
    case "members":
      return <MembersModulePage query={query} />
    case "catalogue":
      return <CatalogueModulePage query={query} />
    case "equipment":
      return <EquipmentModulePage query={query} />
    case "verification":
      return <VerificationModulePage />
    case "support":
      return <SupportModulePage query={query} />
    default:
      notFound()
  }
}
