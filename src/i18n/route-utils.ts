import { isLocale } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1]
  return isLocale(segment) ? segment : null
}

export function replaceLocale(pathname: string, locale: Locale) {
  const segments = pathname.split("/")
  if (isLocale(segments[1])) segments[1] = locale
  else segments.splice(1, 0, locale)
  return segments.join("/") || `/${locale}`
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/")
  if (!isLocale(segments[1])) return pathname || "/"

  const result = `/${segments.slice(2).join("/")}`.replace(/\/+/g, "/")
  if (result === "/") return "/"
  return result.replace(/\/$/, "") || "/"
}

export function sanitizeReturnTo(
  value: string | null | undefined,
  locale: Locale,
) {
  const fallback = `/${locale}/dashboard`
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return fallback
  try {
    const url = new URL(value, "https://buildink.local")
    if (url.origin !== "https://buildink.local") return fallback
    if (!url.pathname.startsWith(`/${locale}/`)) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
