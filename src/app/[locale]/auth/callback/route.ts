import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { isLocale } from "@/shared/constants/platform"

function safePath(value: string | null, locale: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return `/${locale}/onboarding/profile-type`
  try {
    const url = new URL(value, "https://buildink.local")
    return url.origin === "https://buildink.local" ? `${url.pathname}${url.search}${url.hash}` : `/${locale}/onboarding/profile-type`
  } catch {
    return `/${locale}/onboarding/profile-type`
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const url = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https"
  const code = url.searchParams.get("code")
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const callbackOrigin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : url.origin
      return NextResponse.redirect(
        new URL(safePath(url.searchParams.get("next"), locale), callbackOrigin),
      )
    }
  }
  return NextResponse.redirect(new URL(`/${locale}/login?error=auth_callback`, url.origin))
}
