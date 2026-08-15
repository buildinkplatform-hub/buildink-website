import type {
  PortalModule,
  PortalRouteDefinition,
  PrimaryAccountType,
} from "@/shared/types/platform"

export const portalRoutes: PortalRouteDefinition[] = [
  {
    segment: "profile",
    module: "profile",
    labelKey: "dashboard.nav.profile",
    descriptionKey: "dashboard.descriptions.profile",
    state: "active",
  },
  {
    segment: "verification",
    module: "verification",
    labelKey: "dashboard.nav.verification",
    descriptionKey: "dashboard.descriptions.verification",
    state: "active",
  },
  {
    segment: "workspace",
    module: "workspace",
    labelKey: "dashboard.nav.workspace",
    descriptionKey: "dashboard.descriptions.workspace",
    state: "active",
  },
  {
    segment: "members",
    module: "members",
    labelKey: "dashboard.nav.members",
    descriptionKey: "dashboard.descriptions.members",
    state: "active",
  },
  {
    segment: "projects",
    module: "projects",
    labelKey: "dashboard.nav.projects",
    descriptionKey: "dashboard.descriptions.projects",
    state: "active",
  },
  {
    segment: "opportunities",
    module: "opportunities",
    labelKey: "dashboard.nav.opportunities",
    descriptionKey: "dashboard.descriptions.opportunities",
    state: "active",
  },
  {
    segment: "offers",
    module: "offers",
    labelKey: "dashboard.nav.offers",
    descriptionKey: "dashboard.descriptions.offers",
    state: "active",
  },
  {
    segment: "applications",
    module: "applications",
    labelKey: "dashboard.nav.applications",
    descriptionKey: "dashboard.descriptions.applications",
    state: "active",
  },
  {
    segment: "tenders",
    module: "tenders",
    labelKey: "dashboard.nav.tenders",
    descriptionKey: "dashboard.descriptions.tenders",
    state: "active",
  },
  {
    segment: "workforce",
    module: "workforce",
    labelKey: "dashboard.nav.workforce",
    descriptionKey: "dashboard.descriptions.workforce",
    state: "active",
  },
  {
    segment: "catalogue",
    module: "catalogue",
    labelKey: "dashboard.nav.catalogue",
    descriptionKey: "dashboard.descriptions.catalogue",
    state: "active",
  },
  {
    segment: "equipment",
    module: "equipment",
    labelKey: "dashboard.nav.equipment",
    descriptionKey: "dashboard.descriptions.equipment",
    state: "active",
  },
  {
    segment: "engagements",
    module: "engagements",
    labelKey: "dashboard.nav.engagements",
    descriptionKey: "dashboard.descriptions.engagements",
    state: "active",
  },
  {
    segment: "messages",
    module: "messages",
    labelKey: "dashboard.nav.messages",
    descriptionKey: "dashboard.descriptions.messages",
    state: "active",
  },
  {
    segment: "saved",
    module: "saved",
    labelKey: "dashboard.nav.saved",
    descriptionKey: "dashboard.descriptions.saved",
    state: "active",
  },
  {
    segment: "notifications",
    module: "notifications",
    labelKey: "dashboard.nav.notifications",
    descriptionKey: "dashboard.descriptions.notifications",
    state: "active",
  },
  {
    segment: "settings",
    module: "settings",
    labelKey: "dashboard.nav.settings",
    descriptionKey: "dashboard.descriptions.settings",
    state: "active",
  },
  {
    segment: "support",
    module: "support",
    labelKey: "dashboard.nav.support",
    descriptionKey: "dashboard.descriptions.support",
    state: "active",
  },
]

export const PORTAL_RESERVED_SEGMENTS = ["create", "edit"] as const

export type PortalPageAction = "list" | "create" | "detail" | "edit"

type PortalRouteCapability = {
  detail?: boolean
  create?: boolean
  edit?: boolean
}

export const PORTAL_ROUTE_CAPABILITIES = {
  profile: {},
  verification: {},
  workspace: {},
  members: { detail: true },
  projects: { detail: true, create: true, edit: true },
  opportunities: { detail: true, create: true, edit: true },
  offers: { detail: true, create: true },
  applications: { detail: true, create: true },
  tenders: { detail: true, create: true, edit: true },
  workforce: {},
  catalogue: { detail: true, create: true, edit: true },
  equipment: { detail: true, create: true, edit: true },
  engagements: { detail: true },
  messages: { detail: true },
  saved: {},
  notifications: {},
  settings: {},
  support: { detail: true },
} as const

export type PortalRoutedSegment = keyof typeof PORTAL_ROUTE_CAPABILITIES

export type ResolvedPortalRoute = {
  definition: PortalRouteDefinition
  action: PortalPageAction
  recordId?: string
}

function routeCapability(segment: string): PortalRouteCapability {
  return PORTAL_ROUTE_CAPABILITIES[
    segment as PortalRoutedSegment
  ] satisfies PortalRouteCapability
}

export function portalListPath(segment: string) {
  return `/dashboard/${segment}`
}

export function portalCreatePath(segment: string) {
  return `/dashboard/${segment}/create`
}

export function portalDetailPath(segment: string, id: string) {
  return `/dashboard/${segment}/${id}`
}

export function portalEditPath(segment: string, id: string) {
  return `/dashboard/${segment}/${id}/edit`
}

export function getPortalRoutes(
  modules: PortalModule[],
  accountType?: PrimaryAccountType | null,
) {
  const allowed = new Set(modules)
  return portalRoutes
    .filter((route) => allowed.has(route.module))
    .map((route) => {
      if (route.module === "offers" && accountType === "SUBCONTRACTOR") {
        return {
          ...route,
          labelKey: "dashboard.nav.bidBoard",
          descriptionKey: "dashboard.descriptions.bidBoard",
        }
      }
      return route
    })
}

export function resolvePortalRoute(
  modules: PortalModule[],
  segments: string[],
  accountType?: PrimaryAccountType | null,
): ResolvedPortalRoute | null {
  if (segments.length < 1 || segments.length > 3) return null
  const definition = getPortalRoutes(modules, accountType).find(
    (route) => route.segment === segments[0],
  )
  if (!definition) return null

  const capability = routeCapability(definition.segment)

  if (segments.length === 1) {
    return { definition, action: "list" }
  }

  if (segments.length === 2) {
    if (segments[1] === "create") {
      return capability.create ? { definition, action: "create" } : null
    }
    if (PORTAL_RESERVED_SEGMENTS.includes(segments[1] as "create" | "edit")) {
      return null
    }
    return capability.detail
      ? { definition, action: "detail", recordId: segments[1] }
      : null
  }

  if (segments[2] === "edit" && segments[1] !== "create" && segments[1] !== "edit") {
    return capability.edit
      ? { definition, action: "edit", recordId: segments[1] }
      : null
  }
  return null
}

export function getPortalRoute(
  modules: PortalModule[],
  segments: string[],
  accountType?: PrimaryAccountType | null,
) {
  return resolvePortalRoute(modules, segments, accountType)?.definition ?? null
}
