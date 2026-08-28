import { moduleRouteMap } from "@/features/public/config/public-site.config"
import type { PublicModule } from "@/features/public/types/public.types"
import type { PortalSavedItem } from "@/features/dashboard/data/portal-client"

export type SavedEntityType =
  | "COMPANY"
  | "PROFILE"
  | "PROJECT"
  | "TENDER"
  | "EQUIPMENT"
  | "OPPORTUNITY"
  | "OFFER"

export function entityTypeForModule(
  module: PublicModule,
): SavedEntityType | null {
  switch (module) {
    case "companies":
      return "COMPANY"
    case "project-owners":
    case "subcontractors":
    case "service-providers":
    case "workers":
      return "PROFILE"
    case "projects":
      return "PROJECT"
    case "tenders":
      return "TENDER"
    case "equipment":
      return "EQUIPMENT"
    case "opportunities":
      return "OPPORTUNITY"
    default: {
      const exhaustive: never = module
      return exhaustive
    }
  }
}

export function savedItemHref(item: PortalSavedItem) {
  const slug =
    typeof item.metadata?.slug === "string" ? item.metadata.slug : item.entityId
  const savedModule =
    typeof item.metadata?.module === "string"
      ? (item.metadata.module as PublicModule)
      : undefined

  switch (item.entityType) {
    case "COMPANY":
      return `${moduleRouteMap.companies}/${slug}`
    case "PROFILE":
      if (savedModule === "project-owners") {
        return `${moduleRouteMap["project-owners"]}/${slug}`
      }
      if (savedModule === "subcontractors") {
        return `${moduleRouteMap.subcontractors}/${slug}`
      }
      if (savedModule === "service-providers") {
        return `${moduleRouteMap["service-providers"]}/${slug}`
      }
      return `${moduleRouteMap.workers}/${slug}`
    case "PROJECT":
      return `${moduleRouteMap.projects}/${slug}`
    case "TENDER":
      return `${moduleRouteMap.tenders}/${slug}`
    case "EQUIPMENT":
      return `${moduleRouteMap.equipment}/${slug}`
    case "OPPORTUNITY":
      return `${moduleRouteMap.opportunities}/${slug}`
    case "OFFER":
      return `/dashboard/offers/${item.entityId}`
    default:
      return undefined
  }
}

export function savedEntityLabelKey(entityType: string) {
  switch (entityType) {
    case "COMPANY":
      return "dashboard.savedItem.types.company"
    case "PROFILE":
      return "dashboard.savedItem.types.profile"
    case "PROJECT":
      return "dashboard.savedItem.types.project"
    case "TENDER":
      return "dashboard.savedItem.types.tender"
    case "EQUIPMENT":
      return "dashboard.savedItem.types.equipment"
    case "OPPORTUNITY":
      return "dashboard.savedItem.types.opportunity"
    case "OFFER":
      return "dashboard.savedItem.types.offer"
    default:
      return "dashboard.savedItem.types.item"
  }
}
