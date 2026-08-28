import { expect, test, type Page } from "@playwright/test"

async function websiteAuthCookies(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.filter(
    (cookie) =>
      cookie.name === "sb-buildink-website-auth" ||
      cookie.name.startsWith("sb-buildink-website-auth."),
  )
}

test("protected deep links preserve the exact safe return path", async ({
  page,
}) => {
  const protectedPath = "/en/dashboard/projects?page=3&status=OPEN"
  await page.goto(protectedPath)

  await expect(page).toHaveURL(/\/en\/login\?next=/)
  const redirected = new URL(page.url())
  expect(redirected.pathname).toBe("/en/login")
  expect(redirected.searchParams.get("next")).toBe(protectedPath)
})

test("protected redirects preserve the requested locale", async ({ page }) => {
  await page.goto("/ar/dashboard/projects")

  await expect(page).toHaveURL(/\/ar\/login\?next=/)
  const redirected = new URL(page.url())
  expect(redirected.pathname).toBe("/ar/login")
  expect(redirected.searchParams.get("next")).toBe("/ar/dashboard/projects")
})

test("auth-sensitive pages are never publicly cacheable", async ({
  request,
}) => {
  for (const path of ["/en/login", "/en/dashboard"]) {
    const response = await request.get(path, { maxRedirects: 0 })
    const cacheControl = response.headers()["cache-control"] ?? ""

    expect(cacheControl, `${path} should be private`).toContain("private")
    expect(cacheControl, `${path} should disable storage`).toContain("no-store")
  }
})

test("invalid credentials stay on login and never create a website auth cookie", async ({
  page,
}) => {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill("missing-e2e-user@example.com")
  await page.locator("#password").fill("Definitely-Wrong-E2E-Password-9!")
  await page.getByRole("button", { name: "Log in", exact: true }).click()

  await expect(page.getByRole("alert")).toBeVisible({ timeout: 30_000 })
  await expect(page).toHaveURL(/\/en\/login(?:\?|$)/)
  await expect
    .poll(async () => (await websiteAuthCookies(page)).length, {
      timeout: 10_000,
    })
    .toBe(0)
})
