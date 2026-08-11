import type { MetadataRoute } from "next"

import { resolveConfiguredPublicOrigin } from "@/lib/url/public-origin"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveConfiguredPublicOrigin()
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/it/login",
        "/en/login",
        "/ar/login",
        "/it/register",
        "/en/register",
        "/ar/register",
        "/*/onboarding/",
        "/*/dashboard/",
      ],
    },
    host: siteUrl,
  }
}
