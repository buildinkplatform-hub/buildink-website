import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { resolveConfiguredPublicOrigin } from "@/lib/url/public-origin"

const directoryPaths = [
  "/companies",
  "/project-owners",
  "/subcontractors",
  "/service-providers",
  "/workers",
  "/equipment",
  "/projects",
  "/tenders",
  "/opportunities",
  "/about",
  "/contact",
  "/how-it-works",
  "/verification",
  "/help",
  "/faq",
  "/blog",
  "/privacy",
  "/terms",
  "/cookies",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = resolveConfiguredPublicOrigin()
  return routing.locales.flatMap((locale) =>
    directoryPaths.map((path) => ({
      url: `${origin}/${locale}${path}`,
      changeFrequency: "daily",
      priority: path === "/companies" ? 0.9 : 0.8,
    })),
  )
}
