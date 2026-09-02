import { expect, test, type Page } from "@playwright/test"

const contractorEmail =
  process.env.E2E_CONTRACTOR_EMAIL ??
  "buildinkplatform+contractor-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginContractor(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(contractorEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("contractor company acceptance", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password",
    )
  })

  test("project-owning contractor workspace receives bids instead of submitting against itself", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(90_000)
    await loginContractor(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
    await expect(nav.getByRole("link", { name: "Workspace" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Projects" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Offers" })).toBeVisible()

    await nav.getByRole("link", { name: "Offers" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/offers(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
    await expect(
      page.getByRole("heading", { name: /received offers/i }),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(page.getByRole("link", { name: /create offer/i })).toHaveCount(
      0,
    )
  })
})
