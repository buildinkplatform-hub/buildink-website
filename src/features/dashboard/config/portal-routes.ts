import type {
  ProfileType,
  PortalRouteDefinition,
} from "@/shared/types/platform"

const all: ProfileType[] = [
  "individual",
  "worker",
  "contractor",
  "supplier_contact",
  "service_provider",
]
const professional: ProfileType[] = [
  "contractor",
  "supplier_contact",
  "service_provider",
]

export const portalRoutes: PortalRouteDefinition[] = [
  {
    segment: "profile",
    labelKey: "dashboard.nav.profile",
    descriptionKey: "dashboard.descriptions.profile",
    profileTypes: all,
    state: "coming-soon",
  },
  {
    segment: "documents",
    labelKey: "dashboard.nav.documents",
    descriptionKey: "dashboard.descriptions.documents",
    profileTypes: all,
    state: "coming-soon",
  },
  {
    segment: "proposals",
    labelKey: "dashboard.nav.proposals",
    descriptionKey: "dashboard.descriptions.proposals",
    profileTypes: ["contractor", "service_provider"],
    state: "coming-soon",
  },
  {
    segment: "tenders",
    labelKey: "dashboard.nav.tenders",
    descriptionKey: "dashboard.descriptions.tenders",
    profileTypes: ["contractor", "service_provider"],
    state: "coming-soon",
  },
  {
    segment: "catalog",
    labelKey: "dashboard.nav.catalog",
    descriptionKey: "dashboard.descriptions.catalog",
    profileTypes: ["supplier_contact"],
    state: "coming-soon",
  },
  {
    segment: "requests",
    labelKey: "dashboard.nav.requests",
    descriptionKey: "dashboard.descriptions.requests",
    profileTypes: ["supplier_contact"],
    state: "coming-soon",
  },
  {
    segment: "saved",
    labelKey: "dashboard.nav.saved",
    descriptionKey: "dashboard.descriptions.saved",
    profileTypes: all,
    state: "coming-soon",
  },
  {
    segment: "availability",
    labelKey: "dashboard.nav.availability",
    descriptionKey: "dashboard.descriptions.availability",
    profileTypes: ["worker", "contractor", "service_provider"],
    state: "coming-soon",
  },
  {
    segment: "subscription",
    labelKey: "dashboard.nav.subscription",
    descriptionKey: "dashboard.descriptions.subscription",
    profileTypes: professional,
    state: "coming-soon",
  },
  {
    segment: "notifications",
    labelKey: "dashboard.nav.notifications",
    descriptionKey: "dashboard.descriptions.notifications",
    profileTypes: all,
    state: "coming-soon",
  },
  {
    segment: "settings",
    labelKey: "dashboard.nav.settings",
    descriptionKey: "dashboard.descriptions.settings",
    profileTypes: all,
    state: "coming-soon",
  },
]

export function getPortalRoutes(profileType: ProfileType) {
  return portalRoutes.filter((route) =>
    route.profileTypes.includes(profileType),
  )
}

export function getPortalRoute(profileType: ProfileType, segments: string[]) {
  if (segments.length !== 1) return null
  return (
    getPortalRoutes(profileType).find(
      (route) => route.segment === segments[0],
    ) ?? null
  )
}
