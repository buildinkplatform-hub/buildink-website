export const websiteLogoutGuardCookie = "buildink-logout-in-progress"

export function supabaseAuthCookieOptions(maxAgeSeconds?: number) {
  return {
    name: "sb-buildink-website-auth",
    path: "/",
    sameSite: "lax" as const,
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  }
}
