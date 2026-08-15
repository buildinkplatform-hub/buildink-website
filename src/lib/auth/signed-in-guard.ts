import "server-only"

import { redirect } from "next/navigation"

import { getSignedInDestination } from "@/lib/auth/destination"
import { getApplicationIdentity } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { isLocale } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

export async function redirectSignedInUser(
  locale: string,
  requested?: string,
): Promise<void> {
  const resolved: Locale = isLocale(locale) ? locale : "it"
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return
  if (!data.user.email_confirmed_at) {
    redirect(
      `/${resolved}/verify-email?email=${encodeURIComponent(data.user.email ?? "")}`,
    )
  }

  const identity = await getApplicationIdentity()
  redirect(
    getSignedInDestination(
      resolved,
      identity?.account?.nextAction ?? "enter_portal",
      requested,
    ),
  )
}
