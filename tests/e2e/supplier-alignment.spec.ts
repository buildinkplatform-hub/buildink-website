import { expect, test, type Page } from "@playwright/test"

const supplierEmail =
  process.env.E2E_SUPPLIER_EMAIL ?? "buildinkplatform+supplier-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function loginSupplier(page: Page) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(supplierEmail)
  await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /log in/i }).click()
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 20_000 })
  await expect(page.getByRole("navigation", { name: /portal/i })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe("supplier portal alignment", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password; placeholders are not valid credentials",
    )
  })

  test("catalogue create is an offering workflow, not a fake draft lifecycle", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(75_000)
    await loginSupplier(page)
    await page.getByRole("link", { name: "Catalogue" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/catalogue(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
    await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible({
      timeout: portalTransitionTimeout,
    })

    const addOffering = page.getByRole("link", {
      name: /add catalogue offering/i,
    })
    await expect(addOffering).toBeVisible({ timeout: portalTransitionTimeout })
    await addOffering.click()

    await expect(page.getByLabel(/^name/i)).toBeVisible({
      timeout: portalTransitionTimeout,
    })
    await expect(page.getByLabel(/sku/i)).toBeVisible()
    await expect(page.getByLabel(/minimum order quantity/i)).toBeVisible()
    await expect(page.getByLabel(/lead time/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /save draft/i })).toHaveCount(
      0,
    )
  })

  test("Supplier exposes Catalogue and Offers without inventing Tender ownership", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(60_000)
    await loginSupplier(page)
    const nav = page.getByRole("navigation", { name: /portal/i })

    await expect(nav.getByRole("link", { name: "Catalogue" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Offers" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Tenders" })).toHaveCount(0)

    await nav.getByRole("link", { name: "Offers" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/offers(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
  })
})
