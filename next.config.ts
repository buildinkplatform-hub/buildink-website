import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

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

const privateRoutes = [
  "/:locale(it|en|ar)/login",
  "/:locale(it|en|ar)/register",
  "/:locale(it|en|ar)/forgot-password",
  "/:locale(it|en|ar)/reset-password",
  "/:locale(it|en|ar)/verify-email",
  "/:locale(it|en|ar)/account-restricted",
  "/:locale(it|en|ar)/auth/:path*",
  "/:locale(it|en|ar)/onboarding/:path*",
  "/:locale(it|en|ar)/dashboard/:path*",
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: privateNoStoreHeaders,
      })),
    ]
  },
}

export default withNextIntl(nextConfig)
