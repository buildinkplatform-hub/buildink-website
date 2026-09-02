import { expect, test, type Page } from "@playwright/test"

const projectOwnerEmail =
  process.env.E2E_PROJECT_OWNER_EMAIL ??
  "buildinkplatform+project-owner-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginProjectOwner(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(projectOwnerEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("project owner offer acceptance", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password",
    )
  })

  test("Project Owner receives bids and cannot enter bidder offer creation", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(90_000)
    await loginProjectOwner(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
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

    await page.goto("/en/dashboard/offers/create")
    await expect(page).toHaveURL(/\/en\/dashboard\/offers(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
  })
})
