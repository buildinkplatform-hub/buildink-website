import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { supabaseAuthCookieOptions } from "./cookie-options"

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

export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.access_token) return sessionData.session.access_token

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data: retry } = await supabase.auth.getSession()
  return retry.session?.access_token ?? null
}
