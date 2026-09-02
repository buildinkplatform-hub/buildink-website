import { expect, test, type Page } from "@playwright/test"

const subcontractorEmail =
  process.env.E2E_SUBCONTRACTOR_EMAIL ??
  "buildinkplatform+subcontractor-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginSubcontractor(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(subcontractorEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("subcontractor offer acceptance", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password",
    )
  })

  test("Subcontractor discovers commercial work and gets bidder-side Offers", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(90_000)
    await loginSubcontractor(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
    await expect(
      nav.getByRole("link", { name: /bid board|offers/i }),
    ).toBeVisible()
    await expect(nav.getByRole("link", { name: "Opportunities" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Tenders" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Applications" })).toHaveCount(0)

    await nav.getByRole("link", { name: /bid board|offers/i }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/offers(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
    await expect(page.getByRole("link", { name: /create offer/i })).toBeVisible(
      { timeout: portalTransitionTimeout },
    )
  })
})
