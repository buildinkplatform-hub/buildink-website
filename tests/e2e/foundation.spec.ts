import { expect, test } from "@playwright/test"

test("redirects the root to Italian and switches direction for Arabic", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/it$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await page.goto("/ar")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
})

test("protects the dashboard and preserves a safe return path", async ({
  page,
}) => {
  await page.goto("/en/dashboard")
  await expect(page).toHaveURL(/\/en\/login\?next=/)
})

test("logs in a provisioned Supabase user and opens a future portal screen", async ({
  page,
}) => {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(process.env.E2E_USER_EMAIL!)
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard$/)
  await expect(
    page.getByRole("heading", { name: /Buildink E2E User/ }),
  ).toBeVisible()
  const mobileMenu = page.getByRole("button", { name: "Open navigation" })
  if (await mobileMenu.isVisible()) await mobileMenu.click()
  await page
    .getByRole("link", { name: /Proposals/ })
    .first()
    .click()
  await expect(page.getByRole("heading", { name: "Proposals" })).toBeVisible()
  await expect(
    page.locator("main#main-content").getByText("Coming soon"),
  ).toBeVisible()
})

test("shows anti-enumeration recovery and reset token states", async ({
  page,
}) => {
  await page.goto("/en/forgot-password")
  await page.getByLabel("Email address").fill("unknown@example.com")
  await page.getByRole("button", { name: "Send reset instructions" }).click()
  await expect(
    page.getByRole("heading", { name: "Check your inbox" }),
  ).toBeVisible()
  await page.goto("/en/reset-password")
  await expect(
    page.getByRole("heading", { name: "This reset link is not valid" }),
  ).toBeVisible()
})
