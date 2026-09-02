import { expect, test, type Page } from "@playwright/test"

const workerEmail =
  process.env.E2E_WORKER_EMAIL ?? "buildinkplatform+worker-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginWorker(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(workerEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("worker application acceptance", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password",
    )
  })

  test("Worker gets application submission but no commercial Offers module", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(90_000)
    await loginWorker(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
    await expect(nav.getByRole("link", { name: "Applications" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Opportunities" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Offers" })).toHaveCount(0)

    await nav.getByRole("link", { name: "Applications" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/applications(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
    await expect(
      page.getByRole("heading", { name: "Applications", level: 1 }),
    ).toBeVisible({ timeout: portalTransitionTimeout })

    const create = page.getByRole("link", { name: /create application/i })
    await expect(create).toBeVisible()
    await create.click()
    await expect(page).toHaveURL(/\/en\/dashboard\/applications\/create$/, {
      timeout: portalTransitionTimeout,
    })
    await expect(
      page.getByRole("heading", { name: /create application/i }).first(),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(
      page.getByRole("combobox", { name: /workforce/i }),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(
      page.getByRole("button", { name: /submit application/i }),
    ).toBeDisabled()
  })
})
