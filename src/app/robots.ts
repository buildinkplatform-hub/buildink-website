import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
