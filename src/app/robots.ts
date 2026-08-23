import type { MetadataRoute } from "next"

import { resolveConfiguredPublicOrigin } from "@/lib/url/public-origin"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveConfiguredPublicOrigin()
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/it/login",
          "/en/login",
          "/ar/login",
          "/it/register",
          "/en/register",
          "/ar/register",
          "/it/onboarding",
          "/en/onboarding",
          "/ar/onboarding",
          "/it/dashboard",
          "/en/dashboard",
          "/ar/dashboard",
          "/it/search",
          "/en/search",
          "/ar/search",
        ],
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
