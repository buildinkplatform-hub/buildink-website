import { expect, test, type Page } from "@playwright/test"

const personaModules: Record<string, string[]> = {
  contractor: ["Workspace", "Projects", "Offers", "Tenders"],
  worker: ["Applications", "Opportunities"],
  supplier: ["Workspace", "Catalogue"],
}

const serviceProviderEmail =
  process.env.E2E_SERVICE_PROVIDER_EMAIL ??
  "buildinkplatform+service-test@gmail.com"
const portalTransitionTimeout = process.env.PLAYWRIGHT_BASE_URL
  ? 20_000
  : 10_000

function hasSharedAccountPassword() {
  const value = process.env.E2E_USER_PASSWORD?.trim() ?? ""
  return Boolean(value) && !/^<.*password.*>$/i.test(value)
}

async function expectPortalLogin(page: Page, accountLabel: string) {
  const loginAlert = page.locator("form").getByRole("alert").first()
  const portalUnavailable = page.getByRole("heading", {
    name: /portal view could not be loaded/i,
  })
  const deadline = Date.now() + 20_000

  while (Date.now() < deadline) {
    if (/\/en\/dashboard(?:\/|$)/.test(new URL(page.url()).pathname)) {
      const portalNav = page.getByRole("navigation", { name: /portal/i })
      if (await portalNav.isVisible().catch(() => false)) return

      if (await portalUnavailable.isVisible().catch(() => false)) {
        const fallback =
          (
            await portalUnavailable
              .locator("xpath=ancestor::section[1]")
              .textContent()
          )
            ?.replace(/\s+/g, " ")
            .trim() || "Portal bootstrap unavailable"
        throw new Error(
          `${accountLabel} reached the dashboard route but the portal bootstrap failed: ${fallback}`,
        )
      }
    }
    if (await loginAlert.isVisible().catch(() => false)) {
      const message =
        (await loginAlert.textContent())?.trim() || "Unknown login error"
      throw new Error(
        `${accountLabel} login failed before portal assertions: ${message}`,
      )
    }
    await page.waitForTimeout(150)
  }

  throw new Error(
    `${accountLabel} login did not reach a rendered portal shell within 20 seconds; final URL: ${page.url()}`,
  )
}

test.describe("portal alignment", () => {
  test("contractor dashboard exposes marketplace modules", async ({ page }) => {
    test.skip(
      !process.env.E2E_CONTRACTOR_EMAIL || !hasSharedAccountPassword(),
      "Set E2E_CONTRACTOR_EMAIL and the real E2E_USER_PASSWORD to run persona alignment checks",
    )
    await page.goto("/en/login")
    await page
      .getByLabel("Email address")
      .fill(process.env.E2E_CONTRACTOR_EMAIL!)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expectPortalLogin(page, "Contractor")
    const nav = page.getByRole("navigation", { name: /portal/i })
    for (const label of personaModules.contractor) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible()
    }
    await page.getByRole("link", { name: "Projects" }).click()
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible()
    await expect(page.getByText("This module is connected")).toHaveCount(0)
  })

  test("worker dashboard exposes application modules", async ({ page }) => {
    test.skip(
      !process.env.E2E_WORKER_EMAIL || !hasSharedAccountPassword(),
      "Set E2E_WORKER_EMAIL and the real E2E_USER_PASSWORD to run persona alignment checks",
    )
    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(process.env.E2E_WORKER_EMAIL!)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expectPortalLogin(page, "Worker")
    const nav = page.getByRole("navigation", { name: /portal/i })
    for (const label of personaModules.worker) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible()
    }
  })

  test("service provider Create proposal quick action opens the create form", async ({
    page,
  }) => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password; placeholders are not valid credentials",
    )
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(75_000)

    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(serviceProviderEmail)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expectPortalLogin(page, "Service Provider")

    const createProposal = page.getByRole("link", { name: "Create proposal" })
    await expect(createProposal).toBeVisible({
      timeout: portalTransitionTimeout,
    })
    await createProposal.click()

    await expect(page).toHaveURL(/\/en\/dashboard\/offers\/create$/, {
      timeout: portalTransitionTimeout,
    })
    const loadingForm = page.getByRole("status", { name: "Loading form" })
    await expect(
      page.getByRole("heading", { name: "Create offer", exact: true }).first(),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(loadingForm).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Submit offer" }),
    ).toBeVisible()
  })

  test("service provider tender submission preserves target context and lot count", async ({
    page,
  }) => {
    test.skip(
      !hasSharedAccountPassword(),
      "Set E2E_USER_PASSWORD to the real shared Website test password; placeholders are not valid credentials",
    )
    if (process.env.PLAYWRIGHT_BASE_URL) test.setTimeout(90_000)

    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(serviceProviderEmail)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expectPortalLogin(page, "Service Provider")

    const portalNav = page.getByRole("navigation", { name: /portal/i })
    const tendersLink = portalNav.getByRole("link", { name: "Tenders" })
    await expect(tendersLink).toBeVisible({ timeout: portalTransitionTimeout })
    await tendersLink.click()
    await expect(page).toHaveURL(/\/en\/dashboard\/tenders(?:\?|$)/, {
      timeout: portalTransitionTimeout,
    })

    const tenderRow = page.getByRole("row", {
      name: /Community library renovation/,
    })
    await expect(tenderRow).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(tenderRow.getByRole("cell").nth(5)).toHaveText("1")

    await tenderRow.getByRole("link", { name: "View details" }).click()
    await expect(
      page.getByRole("heading", { name: "Community library renovation" }),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(page.getByRole("link", { name: /edit/i })).toHaveCount(0)

    const tenderId = new URL(page.url()).pathname
      .split("/")
      .filter(Boolean)
      .at(-1)!
    const submitOffer = page.getByRole("link", { name: "Submit offer" })
    await expect(submitOffer).toBeVisible({ timeout: portalTransitionTimeout })
    await submitOffer.click()

    await expect(page).toHaveURL(/\/en\/dashboard\/offers\/create\?/, {
      timeout: portalTransitionTimeout,
    })
    const createUrl = new URL(page.url())
    expect(createUrl.searchParams.get("tender")).toBe(tenderId)
    expect(createUrl.searchParams.get("target")).toBe(`tender:${tenderId}`)
    expect(createUrl.searchParams.get("tenderTitle")).toBe(
      "Community library renovation",
    )

    await expect(
      page.getByRole("heading", { name: "Create offer", exact: true }).first(),
    ).toBeVisible({ timeout: portalTransitionTimeout })
    await expect(
      page.getByRole("status", { name: "Loading form" }),
    ).toHaveCount(0)
    const target = page.getByRole("combobox", { name: "Choose a target" })
    await expect(target).toContainText("Community library renovation")
    await expect(
      page.getByRole("button", { name: "Submit offer" }),
    ).toBeEnabled()
  })
})
