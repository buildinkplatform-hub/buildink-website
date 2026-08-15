import { expect, test } from "@playwright/test"

const personaModules: Record<string, string[]> = {
  contractor: ["Workspace", "Projects", "Offers", "Tenders"],
  worker: ["Applications", "Opportunities"],
  supplier: ["Workspace", "Catalogue"],
}

test.describe("portal alignment", () => {
  test("contractor dashboard exposes marketplace modules", async ({ page }) => {
    test.skip(
      !process.env.E2E_CONTRACTOR_EMAIL || !process.env.E2E_USER_PASSWORD,
      "Set E2E_CONTRACTOR_EMAIL and E2E_USER_PASSWORD to run persona alignment checks",
    )
    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(process.env.E2E_CONTRACTOR_EMAIL!)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expect(page).toHaveURL(/\/en\/dashboard/)
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
      !process.env.E2E_WORKER_EMAIL || !process.env.E2E_USER_PASSWORD,
      "Set E2E_WORKER_EMAIL and E2E_USER_PASSWORD to run persona alignment checks",
    )
    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(process.env.E2E_WORKER_EMAIL!)
    await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole("button", { name: /log in/i }).click()
    await expect(page).toHaveURL(/\/en\/dashboard/)
    const nav = page.getByRole("navigation", { name: /portal/i })
    for (const label of personaModules.worker) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible()
    }
  })
})
