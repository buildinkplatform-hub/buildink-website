import { notFound } from "next/navigation"

import {
  ApplicationsModulePage,
  EngagementsModulePage,
  MessagesModulePage,
  NotificationsModulePage,
  OffersModulePage,
  ProfileModulePage,
  SavedItemsModulePage,
} from "@/features/dashboard/components/portal-modules"
import { ResilientWorkspaceModulePage } from "@/features/dashboard/components/portal-workspace-page"
import { PortalModuleLoadFallback } from "@/features/dashboard/components/portal-module-load-fallback"
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
  VerificationModulePage,
} from "@/features/dashboard/components/portal-directory-modules"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  portalDetailPath,
  legacyWorkforceOperationsSubpages,
  resolvePortalRoute,
} from "@/features/dashboard/config/portal-routes"
import { getPortalBootstrap } from "@/features/dashboard/data/portal-client"
import { getRequiredPortalSession } from "@/lib/auth/session"
import { redirect } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

export const instant = false

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
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
  const resolved = resolvePortalRoute(
    bootstrap?.entitlements.modules ?? session.modules,
    segments,
    bootstrap?.profile.primaryAccountType ?? session.primaryAccountType,
  )
  if (!resolved) notFound()
  const queryId = first(queryParams.id)
  if (resolved.action === "list" && queryId) {
    redirect({
      href: portalDetailPath(resolved.definition.segment, queryId),
      locale,
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
        return await OffersModulePage({ query })
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
      case "opportunities":
        return await OpportunitiesModulePage({ query })
      case "tenders":
        return await TendersModulePage({ query })
      case "members":
        return await MembersModulePage({ query })
      case "catalogue":
        return await CatalogueModulePage({ query })
      case "equipment":
        return await EquipmentModulePage({ query })
      case "verification":
        return await VerificationModulePage()
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
    return (
      <PortalModuleLoadFallback
        href={`/dashboard/${resolved.definition.segment}`}
      />
    )
  }
}
