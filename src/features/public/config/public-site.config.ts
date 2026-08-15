import type { Locale } from "@/shared/types/platform"
import type { PublicModule } from "@/features/public/types/public.types"

export interface PublicNavItem {
  href: string
  labelKey: string
}

export interface PublicNavGroup {
  key: string
  labelKey: string
  items: PublicNavItem[]
}

export const publicNavGroups: PublicNavGroup[] = [
  {
    key: "browse",
    labelKey: "nav.groups.browse",
    items: [
      { href: "/search", labelKey: "nav.items.search" },
      { href: "/companies", labelKey: "nav.items.companies" },
      { href: "/profiles", labelKey: "nav.items.profiles" },
      { href: "/workers", labelKey: "nav.items.workers" },
      { href: "/subcontractors", labelKey: "nav.items.subcontractors" },
      { href: "/service-providers", labelKey: "nav.items.serviceProviders" },
      { href: "/suppliers", labelKey: "nav.items.suppliers" },
      { href: "/equipment", labelKey: "nav.items.equipment" },
    ],
  },
  {
    key: "opportunities",
    labelKey: "nav.groups.opportunities",
    items: [
      { href: "/projects", labelKey: "nav.items.projects" },
      { href: "/tenders", labelKey: "nav.items.tenders" },
      {
        href: "/opportunities/companies",
        labelKey: "nav.items.companyRequests",
      },
      {
        href: "/opportunities/workers",
        labelKey: "nav.items.workerRequests",
      },
      {
        href: "/opportunities/services",
        labelKey: "nav.items.serviceRequests",
      },
    ],
  },
  {
    key: "marketplace",
    labelKey: "nav.groups.marketplace",
    items: [
      { href: "/companies", labelKey: "nav.items.companies" },
      { href: "/trades", labelKey: "nav.items.trades" },
      {
        href: "/service-providers",
        labelKey: "nav.items.specializedServices",
      },
      { href: "/suppliers", labelKey: "nav.items.suppliers" },
      { href: "/equipment", labelKey: "nav.items.equipment" },
      { href: "/verification", labelKey: "nav.items.safetyCertifications" },
    ],
  },
  {
    key: "resources",
    labelKey: "nav.groups.resources",
    items: [
      { href: "/how-it-works", labelKey: "nav.items.howItWorks" },
      { href: "/verification", labelKey: "nav.items.verification" },
      { href: "/faq", labelKey: "nav.items.faq" },
      { href: "/help", labelKey: "nav.items.help" },
      { href: "/blog", labelKey: "nav.items.blog" },
      { href: "/about", labelKey: "nav.items.about" },
      { href: "/contact", labelKey: "nav.items.contact" },
    ],
  },
]

export const footerColumns = [
  {
    key: "platform",
    labelKey: "footer.platform",
    items: [
      { href: "/tenders", labelKey: "nav.items.tenders" },
      { href: "/companies", labelKey: "nav.items.companies" },
      { href: "/workers", labelKey: "nav.items.workers" },
      { href: "/subcontractors", labelKey: "nav.items.subcontractors" },
      { href: "/equipment", labelKey: "nav.items.equipment" },
      { href: "/projects", labelKey: "nav.items.projects" },
    ],
  },
  {
    key: "resources",
    labelKey: "footer.resources",
    items: [
      { href: "/how-it-works", labelKey: "nav.items.howItWorks" },
      { href: "/verification", labelKey: "nav.items.verification" },
      { href: "/faq", labelKey: "nav.items.faq" },
      { href: "/blog", labelKey: "nav.items.blog" },
      { href: "/help", labelKey: "nav.items.help" },
    ],
  },
  {
    key: "company",
    labelKey: "footer.company",
    items: [
      { href: "/about", labelKey: "nav.items.about" },
      { href: "/contact", labelKey: "nav.items.contact" },
    ],
  },
  {
    key: "legal",
    labelKey: "footer.legal",
    items: [
      { href: "/privacy", labelKey: "nav.items.privacy" },
      { href: "/terms", labelKey: "nav.items.terms" },
      { href: "/cookies", labelKey: "nav.items.cookies" },
    ],
  },
] as const

export const moduleRouteMap: Record<PublicModule, string> = {
  companies: "/companies",
  profiles: "/profiles",
  suppliers: "/suppliers",
  equipment: "/equipment",
  projects: "/projects",
  tenders: "/tenders",
  "opportunities-companies": "/opportunities/companies",
  "opportunities-workers": "/opportunities/workers",
}

export function localizedHref(locale: Locale, href: string) {
  return `/${locale}${href}`.replace(/\/+/g, "/")
}
