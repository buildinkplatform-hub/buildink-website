import { expect, test, type Page } from "@playwright/test"

const individualEmail =
  process.env.E2E_INDIVIDUAL_EMAIL ?? "buildinkplatform+website-test@gmail.com"

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginIndividual(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(individualEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("individual account boundary", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password",
    )
  })

  test("Individual does not inherit company marketplace workspaces or owner modules", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(60_000)
    await loginIndividual(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
    await expect(nav.getByRole("link", { name: "Profile" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Verification" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Messages" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Notifications" })).toBeVisible()

    for (const restricted of [
      "Workspace",
      "Projects",
      "Offers",
      "Applications",
      "Tenders",
      "Catalogue",
      "Equipment",
    ]) {
      await expect(nav.getByRole("link", { name: restricted })).toHaveCount(0)
    }
  })
})
