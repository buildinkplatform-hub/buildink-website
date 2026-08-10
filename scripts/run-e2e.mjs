import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

function loadEnvFile(relativePath) {
  const path = fileURLToPath(new URL(relativePath, import.meta.url))
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1].trim(), match[2].trim()]),
  )
}

const websiteEnv = loadEnvFile("../.env")
const backendEnv = loadEnvFile("../../backend/.env")

const environment = {
  ...websiteEnv,
  ...process.env,
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
  BACKEND_API_URL: "http://127.0.0.1:4100",
  AUTH_RATE_LIMIT_ALLOW_MEMORY: "true",
  E2E_SUPABASE_SECRET_KEY:
    process.env.E2E_SUPABASE_SECRET_KEY ?? backendEnv.SUPABASE_SECRET_KEY,
  E2E_USER_EMAIL:
    process.env.E2E_USER_EMAIL ?? `buildink-e2e-${Date.now()}@example.com`,
  E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD ?? "Buildink-E2E-Only@2026",
}

const build = spawnSync(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/next/dist/bin/next", import.meta.url),
    ),
    "build",
  ],
  { env: environment, stdio: "inherit" },
)

if (build.status !== 0) process.exit(build.status ?? 1)

const tests = spawnSync(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
    ),
    "test",
    ...process.argv.slice(2),
  ],
  { env: environment, stdio: "inherit" },
)

process.exit(tests.status ?? 1)
