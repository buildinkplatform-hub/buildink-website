import "server-only"

import { createHash } from "node:crypto"

import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

export class AuthRateLimitExceededError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("Too many authentication attempts")
    this.name = "AuthRateLimitExceededError"
  }
}

const localCounters = new Map<string, { count: number; expiresAt: number }>()
let redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32)
}

async function clientAddress(): Promise<string> {
  const requestHeaders = await headers()
  return (
    requestHeaders.get("x-nf-client-connection-ip") ??
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  )
}

function consumeLocally(
  key: string,
  limit: number,
  windowSeconds: number,
): void {
  const now = Date.now()
  const current = localCounters.get(key)
  const next =
    !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + windowSeconds * 1000 }
      : { ...current, count: current.count + 1 }
  localCounters.set(key, next)
  if (next.count > limit)
    throw new AuthRateLimitExceededError(
      Math.max(1, Math.ceil((next.expiresAt - now) / 1000)),
    )
}

export async function limitAuthAction(
  action: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const address = await clientAddress()
  const prefix = process.env.AUTH_RATE_LIMIT_KEY_PREFIX ?? "buildink:auth"
  const key = `${prefix}:${action}:${digest(`${address}:${subject.toLowerCase()}`)}`
  const remote = getRedis()

  if (!remote) {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.AUTH_RATE_LIMIT_ALLOW_MEMORY !== "true"
    ) {
      throw new Error("Authentication rate limiting is not configured")
    }
    consumeLocally(key, limit, windowSeconds)
    return
  }

  const count = await remote.incr(key)
  if (count === 1) await remote.expire(key, windowSeconds)
  if (count > limit) {
    const ttl = await remote.ttl(key)
    throw new AuthRateLimitExceededError(ttl > 0 ? ttl : windowSeconds)
  }
}
