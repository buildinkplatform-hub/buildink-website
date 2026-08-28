import { expect, test } from "@playwright/test"

const portalRoutes = [
  "profile",
  "verification",
  "workspace",
  "members",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "workforce",
  "operations",
  "catalogue",
  "equipment",
  "engagements",
  "messages",
  "saved",
  "notifications",
  "settings",
  "support",
] as const

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

test("every active top-level portal page resolves inside the authenticated shell", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_SKIP_AUTH === "true",
    "requires configured Supabase E2E credentials",
  )
  test.setTimeout(240_000)

  const email = process.env.E2E_USER_EMAIL!
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(email)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: "Log in", exact: true }).click()
  await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 45_000 })
  await expect(page.locator("main.auth-grid")).toHaveCount(0, {
    timeout: 45_000,
  })

  const accountMenu = page.getByRole("button", {
    name: new RegExp(escapeRegExp(email), "i"),
  })
  await expect(accountMenu).toBeVisible({ timeout: 30_000 })

  for (const segment of portalRoutes) {
    const path = `/en/dashboard/${segment}`
    const response = await page.goto(path, { waitUntil: "domcontentloaded" })

    expect(response, `${path} should return an HTTP response`).not.toBeNull()
    expect(response!.status(), `${path} should not be a 404`).not.toBe(404)
    expect(response!.status(), `${path} should not return 5xx`).toBeLessThan(
      500,
    )
    await expect(page).toHaveURL(
      new RegExp(`${path.replaceAll("/", "\\/")}(?:\\?|$)`),
    )
    await expect(page.locator("main#main-content")).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    })
    await expect(accountMenu).toBeVisible({ timeout: 30_000 })
  }
})
