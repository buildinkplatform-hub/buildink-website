import { createServerClient } from "@supabase/ssr"
import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"

import { routing } from "@/i18n/routing"
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options"
import { locales } from "@/shared/types/platform"

const handleI18n = createMiddleware(routing)
const localeGroup = locales.join("|")
const localePath = new RegExp(`^/(${localeGroup})(?:/|$)`)
const cacheSensitivePath = new RegExp(
  `^/(?:(?:${localeGroup})/)?(?:$|login|register|forgot-password|reset-password|verify-email|account-restricted|auth(?:/|$)|onboarding(?:/|$)|dashboard(?:/|$))`,
)

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

function redirectPreservingCookies(url: URL, from: NextResponse) {
  const redirectResponse = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })
  return setPrivateNoStore(redirectResponse)
}

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: supabaseAuthCookieOptions(),
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
  const { data } = await supabase.auth.getUser()
  const authenticated = Boolean(data.user)
  if (cacheSensitivePath.test(request.nextUrl.pathname))
    setPrivateNoStore(response)

  if (response.status >= 300 && response.status < 400) {
    return setPrivateNoStore(response)
  }

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
    return redirectPreservingCookies(loginUrl, response)
  }
  return response
}

export const config = { matcher: "/((?!api|_next|_vercel|offline|.*\\..*).*)" }
