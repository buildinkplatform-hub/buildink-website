import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const envPath = resolve(websiteRoot, ".env")

function unquote(value: string) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function loadWebsiteEnv() {
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separator = trimmed.indexOf("=")
    if (separator <= 0) continue

    const key = trimmed.slice(0, separator).trim()
    const value = unquote(trimmed.slice(separator + 1))
    if (!key || process.env[key] !== undefined) continue
    process.env[key] = value
  }
}

export function ensureE2EEnvironment() {
  loadWebsiteEnv()

  process.env.NEXT_DIST_DIR ??= ".next-e2e"
  process.env.NEXT_PUBLIC_SITE_URL ??= "http://127.0.0.1:3100"
  process.env.BACKEND_API_URL ??= "http://127.0.0.1:4100"
  process.env.AUTH_RATE_LIMIT_ALLOW_MEMORY ??= "true"
  process.env.E2E_USE_MOCK_AUTH ??= process.env.PLAYWRIGHT_BASE_URL
    ? "false"
    : "true"

  if (process.env.E2E_USE_MOCK_AUTH === "true") {
    process.env.BACKEND_API_URL = "http://127.0.0.1:4100"
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:4100"
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "e2e-anon-key"
    process.env.E2E_SUPABASE_SECRET_KEY = "e2e-service-role-key"
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  }
  process.env.E2E_SUPABASE_SECRET_KEY ??= process.env.SUPABASE_SECRET_KEY
  process.env.E2E_USER_EMAIL ??= `buildink-e2e-${Date.now()}-${process.pid}@example.com`
  process.env.E2E_USER_PASSWORD ??= "Buildink-E2E-Only@2026"

  return {
    envPath,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseSecret: process.env.E2E_SUPABASE_SECRET_KEY,
    email: process.env.E2E_USER_EMAIL,
    password: process.env.E2E_USER_PASSWORD,
  }
}
