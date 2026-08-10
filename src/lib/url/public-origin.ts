import { headers } from "next/headers"

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.origin
  } catch {
    return null
  }
}

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim()
  return first ? first : null
}

export function resolvePublicOriginFromHeaders(
  headerStore: Pick<Headers, "get">,
  envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  const forwardedHost = firstHeaderValue(headerStore.get("x-forwarded-host"))
  const host = forwardedHost ?? firstHeaderValue(headerStore.get("host"))
  const forwardedProto = firstHeaderValue(headerStore.get("x-forwarded-proto"))

  if (host) {
    const protocol =
      forwardedProto ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https")
    return `${protocol}://${host}`
  }

  const origin = normalizeOrigin(firstHeaderValue(headerStore.get("origin")) ?? "")
  if (origin) return origin

  const envOrigin = envSiteUrl ? normalizeOrigin(envSiteUrl) : null
  if (envOrigin) return envOrigin

  return "http://localhost:3000"
}

export async function resolvePublicOrigin(): Promise<string> {
  return resolvePublicOriginFromHeaders(await headers())
}
