import { createServerClient } from "@supabase/ssr"
import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"

import { routing } from "@/i18n/routing"

const handleI18n = createMiddleware(routing)
const localePath = /^\/(it|en|ar)(?:\/|$)/
const cacheSensitivePath =
  /^\/(?:(?:it|en|ar)\/)?(?:$|login|register|forgot-password|reset-password|verify-email|account-restricted|auth(?:\/|$)|onboarding(?:\/|$)|dashboard(?:\/|$))/

function setPrivateNoStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  )
  response.headers.set("Netlify-CDN-Cache-Control", "no-store")
  response.headers.set("CDN-Cache-Control", "no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  return response
}

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )
  const { data } = await supabase.auth.getClaims()
  const authenticated = Boolean(data?.claims)
  if (cacheSensitivePath.test(request.nextUrl.pathname))
    setPrivateNoStore(response)
  const match = request.nextUrl.pathname.match(localePath)
  if (!match) return response
  const locale = match[1]
  const relativePath = request.nextUrl.pathname.slice(locale.length + 1) || "/"
  const dynamicAuthPath =
    relativePath === "/" ||
    relativePath === "/login" ||
    relativePath === "/register" ||
    relativePath.startsWith("/onboarding/") ||
    relativePath.startsWith("/dashboard")

  if (dynamicAuthPath) {
    setPrivateNoStore(response)
  }

  if (
    (relativePath.startsWith("/dashboard") ||
      relativePath.startsWith("/onboarding/")) &&
    !authenticated
  ) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    )
    return setPrivateNoStore(NextResponse.redirect(loginUrl))
  }
  if (
    (relativePath === "/login" || relativePath === "/register") &&
    authenticated
  ) {
    return setPrivateNoStore(
      NextResponse.redirect(
        new URL(`/${locale}/onboarding/profile-type`, request.url),
      ),
    )
  }
  return response
}

export const config = { matcher: "/((?!api|_next|_vercel|offline|.*\\..*).*)" }
