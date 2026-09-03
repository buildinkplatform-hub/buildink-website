import { defineConfig, devices } from "@playwright/test"

import { ensureE2EEnvironment } from "./tests/e2e/e2e-env"

ensureE2EEnvironment()

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL
const playwrightEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => typeof value === "string"),
) as Record<string, string>
const localWebCommand =
  process.env.E2E_PREBUILT === "true"
    ? "npm run start -- --hostname 127.0.0.1 --port 3100"
    : "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100"

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // Every authenticated project still uses the configured Supabase Auth
  // service, even when application API calls use the local mock backend.
  // Serial execution avoids sign-in throttling and concurrent RSC stream
  // pressure hiding real workflow failures behind infrastructure flakes.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: externalBaseUrl ?? "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: externalBaseUrl
    ? undefined
    : [
        {
          command: "node tests/e2e/mock-backend.mjs",
          url: "http://127.0.0.1:4100/health/live",
          env: playwrightEnv,
          reuseExistingServer: false,
          timeout: 30_000,
        },
        {
          command: localWebCommand,
          url: "http://127.0.0.1:3100/it",
          env: playwrightEnv,
          reuseExistingServer: !process.env.CI,
          timeout: 240_000,
        },
      ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "compact-mobile",
      testMatch: /(ui-quality|portal-ui)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 720 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "tablet",
      testMatch: /(ui-quality|portal-ui)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
})
