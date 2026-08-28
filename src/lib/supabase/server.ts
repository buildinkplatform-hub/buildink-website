import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

import {
  supabaseAuthCookieOptions,
  websiteLogoutGuardCookie,
} from "./cookie-options"

export async function createClient(options?: {
  sessionMaxAgeSeconds?: number
}) {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: supabaseAuthCookieOptions(options?.sessionMaxAgeSeconds),
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options: cookie }) =>
              cookieStore.set(name, value, cookie),
            )
          } catch {
            // Server Components cannot write cookies; src/proxy.ts refreshes them.
          }
        },
      },
    },
  )
}

export const getAccessToken = cache(async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.access_token) return sessionData.session.access_token

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data: retry } = await supabase.auth.getSession()
  return retry.session?.access_token ?? null
})

export async function clearSupabaseAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const base = supabaseAuthCookieOptions().name
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name === base || cookie.name.startsWith(`${base}.`)) {
      cookieStore.delete(cookie.name)
    }
  }
}

export async function beginWebsiteLogoutGuard(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(websiteLogoutGuardCookie, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30,
  })
}

export async function clearWebsiteLogoutGuard(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(websiteLogoutGuardCookie)
}
