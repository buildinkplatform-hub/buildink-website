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
  const portalNav = page.getByRole("navigation", { name: /portal/i })
  await expect(portalNav).toBeVisible({ timeout: 20_000 })
}

test.describe("supplier catalogue acceptance", () => {
  test.beforeEach(() => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password; placeholders are not valid credentials",
    )
  })

  test("uses the Supplier module boundary and preserves catalogue pricing on edit", async ({
    page,
  }) => {
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(120_000)
    await loginSupplier(page)

    const nav = page.getByRole("navigation", { name: /portal/i })
    await expect(nav.getByRole("link", { name: "Catalogue" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Offers" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Tenders" })).toHaveCount(0)

    await nav.getByRole("link", { name: "Catalogue" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/catalogue(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })
    await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible({
      timeout: portalTransitionTimeout,
    })

    const row = page.getByRole("row", { name: /Rebar 12mm coil/ })
    await expect(row).toBeVisible({ timeout: portalTransitionTimeout })
    await row.getByRole("link", { name: "View details" }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Rebar 12mm coil" }),
    ).toBeVisible({ timeout: portalTransitionTimeout })

    await page.getByRole("link", { name: "Edit", exact: true }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/catalogue\/[^/]+\/edit$/, {
      timeout: portalTransitionTimeout,
    })

    const priceOnRequest = page.getByRole("checkbox", {
      name: "Price on request",
    })
    await expect(priceOnRequest).not.toBeChecked()
    await expect(page.getByLabel(/^Indicative price/)).toHaveValue("780.00")
    await expect(page.getByLabel(/^Currency/)).toHaveValue("EUR")

    // Saving the seeded values exercises the real update boundary without
    // changing the reusable fixture for subsequent local acceptance runs.
    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page.getByText("Saved")).toBeVisible({
      timeout: portalTransitionTimeout,
    })
    await expect(page.getByLabel(/^Indicative price/)).toHaveValue("780.00")
    await expect(page.getByLabel(/^Currency/)).toHaveValue("EUR")
  })
})
