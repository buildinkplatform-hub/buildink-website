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
    const headers = response.headers()
    const cacheControl = headers["cache-control"] ?? ""
    const cdnCacheControl = headers["cdn-cache-control"] ?? ""
    const netlifyCdnCacheControl = headers["netlify-cdn-cache-control"] ?? ""

    // Next.js may normalize the browser-facing Cache-Control header on dynamic
    // responses to `no-cache, must-revalidate`. The security boundary is that
    // neither browser nor shared/CDN caches may reuse the response as public
    // content. Keep the explicit CDN no-store headers authoritative too.
    expect(cacheControl, `${path} must not be publicly cacheable`).not.toMatch(
      /(?:^|,)\s*(?:public|s-maxage\s*=)/i,
    )
    expect(
      /no-store/i.test(cacheControl) ||
        (/no-cache/i.test(cacheControl) &&
          /must-revalidate/i.test(cacheControl)),
      `${path} must require revalidation or disable browser storage`,
    ).toBe(true)
    expect(cdnCacheControl, `${path} must disable CDN storage`).toContain(
      "no-store",
    )
    expect(
      netlifyCdnCacheControl,
      `${path} must disable Netlify CDN storage`,
    ).toContain("no-store")
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
