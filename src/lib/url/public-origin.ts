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

function originFromHost(host: string, protocol?: string | null): string {
  const resolvedProtocol =
    protocol ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https")

  return `${resolvedProtocol}://${host}`
}

function normalizeVercelOrigin(value?: string): string | null {
  if (!value) return null
  const raw = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`
  return normalizeOrigin(raw)
}

function isLocalOrigin(value: string | null): boolean {
  return value === "http://localhost:3000" || value?.startsWith("http://127.0.0.1:") === true
}

export function resolveConfiguredPublicOrigin(
  envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  const vercelProductionOrigin = normalizeVercelOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  )
  if (vercelProductionOrigin) return vercelProductionOrigin

  const vercelDeploymentOrigin = normalizeVercelOrigin(process.env.VERCEL_URL)
  if (vercelDeploymentOrigin) return vercelDeploymentOrigin

  const envOrigin = envSiteUrl ? normalizeOrigin(envSiteUrl) : null
  if (envOrigin && !isLocalOrigin(envOrigin)) return envOrigin

  return envOrigin ?? "http://localhost:3000"
}

export function resolvePublicOriginFromHeaders(
  headerStore: Pick<Headers, "get">,
  envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  const forwardedHost = firstHeaderValue(headerStore.get("x-forwarded-host"))
  const forwardedProto = firstHeaderValue(headerStore.get("x-forwarded-proto"))
  const host = firstHeaderValue(headerStore.get("host"))

  if (forwardedHost) {
    return originFromHost(forwardedHost, forwardedProto)
  }

  const requestOrigin = normalizeOrigin(firstHeaderValue(headerStore.get("origin")) ?? "")
  if (requestOrigin) return requestOrigin

  const refererOrigin = normalizeOrigin(firstHeaderValue(headerStore.get("referer")) ?? "")
  if (refererOrigin) return refererOrigin

  if (host) {
    return originFromHost(host, forwardedProto)
  }

  return resolveConfiguredPublicOrigin(envSiteUrl)
}

export async function resolvePublicOrigin(): Promise<string> {
  return resolvePublicOriginFromHeaders(await headers())
}
