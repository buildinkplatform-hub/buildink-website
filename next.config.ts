import type { NextConfig } from "next"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import createBundleAnalyzer from "@next/bundle-analyzer"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
const projectRoot = dirname(fileURLToPath(import.meta.url))

const privateNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, max-age=0, must-revalidate",
  },
  { key: "Netlify-CDN-Cache-Control", value: "no-store" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
]

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Download-Options", value: "noopen" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
]

const privateRoutes = [
  "/:locale(it|en|ar|ro|sq)/login",
  "/:locale(it|en|ar|ro|sq)/register",
  "/:locale(it|en|ar|ro|sq)/forgot-password",
  "/:locale(it|en|ar|ro|sq)/reset-password",
  "/:locale(it|en|ar|ro|sq)/verify-email",
  "/:locale(it|en|ar|ro|sq)/account-restricted",
  "/:locale(it|en|ar|ro|sq)/auth/:path*",
  "/:locale(it|en|ar|ro|sq)/onboarding/:path*",
  "/:locale(it|en|ar|ro|sq)/dashboard/:path*",
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  cacheLife: {
    publicStatic: {
      stale: 10 * 60,
      revalidate: 60 * 60,
      expire: 24 * 60 * 60,
    },
    publicMarketplace: {
      stale: 2 * 60,
      revalidate: 5 * 60,
      expire: 30 * 60,
    },
    publicFacets: {
      stale: 10 * 60,
      revalidate: 30 * 60,
      expire: 2 * 60 * 60,
    },
  },
  experimental: {
    optimizePackageImports: [
      "@tanstack/react-query",
      "lucide-react",
      "motion",
      "react-hook-form",
      "zod",
    ],
  },
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: privateNoStoreHeaders,
      })),
    ]
  },
  async redirects() {
    return [
      {
        source: "/:locale(it|en|ar|ro|sq)/profiles",
        destination: "/:locale/workers",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/profiles/:slug",
        destination: "/:locale/workers/:slug",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/trades",
        destination: "/:locale/companies",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/opportunities/companies",
        destination: "/:locale/opportunities",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/opportunities/workers",
        destination: "/:locale/opportunities",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/opportunities/services",
        destination: "/:locale/opportunities",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/opportunities/companies/:slug",
        destination: "/:locale/opportunities/:slug",
        permanent: true,
      },
      {
        source: "/:locale(it|en|ar|ro|sq)/opportunities/workers/:slug",
        destination: "/:locale/opportunities/:slug",
        permanent: true,
      },
    ]
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
