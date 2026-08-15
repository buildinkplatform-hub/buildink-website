import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { resolveConfiguredPublicOrigin } from "@/lib/url/public-origin"

const directoryPaths = [
  "/companies",
  "/profiles",
  "/suppliers",
  "/equipment",
  "/projects",
  "/tenders",
  "/opportunities/companies",
  "/opportunities/workers",
  "/search",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = resolveConfiguredPublicOrigin()
  return routing.locales.flatMap((locale) =>
    directoryPaths.map((path) => ({
      url: `${origin}/${locale}${path}`,
      changeFrequency: "daily",
      priority: path === "/search" ? 0.6 : 0.8,
    })),
  )
}
