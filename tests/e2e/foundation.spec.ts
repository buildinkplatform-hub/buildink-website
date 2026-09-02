import { expect, test } from "@playwright/test"

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

test("sets html lang and dir for every platform locale", async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect(page).toHaveURL(/\/it$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  const cases = [
    { path: "/it", lang: "it", dir: "ltr" },
    { path: "/en", lang: "en", dir: "ltr" },
    { path: "/ar", lang: "ar", dir: "rtl" },
    { path: "/ro", lang: "ro", dir: "ltr" },
    { path: "/sq", lang: "sq", dir: "ltr" },
  ] as const
  for (const item of cases) {
    await page.goto(item.path, { waitUntil: "domcontentloaded" })
    await expect(page.locator("html")).toHaveAttribute("lang", item.lang)
    await expect(page.locator("html")).toHaveAttribute("dir", item.dir)
  }
})

test("protects the dashboard and preserves a safe return path", async ({
  page,
}) => {
  await page.goto("/en/dashboard")
  await expect(page).toHaveURL(/\/en\/login\?next=/)
})

test("retires blogs and permanently redirects duplicate public routes", async ({
  page,
  request,
}) => {
  for (const path of ["/en/blog", "/en/blog/old-article"]) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), `${path} should be removed`).toBe(404)
  }

  const redirects = [
    ["/en/profiles", "/en/workers"],
    ["/en/profiles/demo", "/en/workers/demo"],
    ["/en/trades", "/en/companies"],
    ["/en/opportunities/companies", "/en/opportunities"],
    ["/en/opportunities/workers/demo", "/en/opportunities/demo"],
  ] as const
  for (const [source, destination] of redirects) {
    const response = await request.get(source, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe(destination)
  }

  await page.goto("/en/faq", { waitUntil: "domcontentloaded" })
  // The reviewed source-controlled FAQ intentionally publishes ten entries.
  // Keep this assertion synchronized with the authoritative content pack rather
  // than the retired twenty-item CMS/demo fixture.
  await expect(page.locator("main button[aria-expanded]")).toHaveCount(10)
})

test("logs in a provisioned Supabase user and renders the authenticated portal", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_SKIP_AUTH === "true",
    "requires configured Supabase E2E credentials",
  )
  const email = process.env.E2E_USER_EMAIL!

  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(email)
  await expect(
    page.getByRole("textbox", { name: "Password", exact: true }),
  ).toBeVisible()
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()

  await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 45_000 })

  // Next can keep the previous auth route mounted briefly while the dashboard
  // transition commits. Wait for that shell to detach before using strict
  // locators that intentionally share the app-wide main-content id.
  await expect(page.locator("main.auth-grid")).toHaveCount(0, {
    timeout: 45_000,
  })

  await expect(page.locator("main#main-content")).toBeVisible({
    timeout: 45_000,
  })
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  })

  const accountMenu = page.getByRole("button", {
    name: new RegExp(escapeRegExp(email), "i"),
  })
  await expect(accountMenu).toBeVisible({ timeout: 30_000 })

  const desktopNavigation = page.getByRole("navigation", { name: "Portal" })
  const mobileMenu = page.locator("button:has(svg.lucide-menu)")
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click()
    await expect(page.getByRole("dialog").getByRole("navigation")).toBeVisible()
  } else {
    await expect(desktopNavigation).toBeVisible()
  }
})

test("shows anti-enumeration recovery and reset token states", async ({
  page,
}) => {
  await page.goto("/en/forgot-password")
  await page.getByLabel("Email address").fill("unknown@example.com")
  await page.getByRole("button", { name: "Send reset instructions" }).click()
  await expect(
    page.getByRole("heading", { name: "Check your inbox" }),
  ).toBeVisible({ timeout: 20_000 })
  await page.goto("/en/reset-password")
  await expect(
    page.getByRole("heading", { name: "This reset link is not valid" }),
  ).toBeVisible()
})
