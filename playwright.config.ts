import { defineConfig, devices } from "@playwright/test"

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
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
          reuseExistingServer: false,
          timeout: 30_000,
        },
        {
          command: "npm run start -- --hostname 127.0.0.1 --port 3100",
          url: "http://127.0.0.1:3100/it",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
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
