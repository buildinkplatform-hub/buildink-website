import { expect, test } from "@playwright/test"

test("validates registration and starts the configured Google OAuth flow", async ({
  page,
}) => {
  await page.goto("/en/register", { waitUntil: "domcontentloaded" })
  await page.getByRole("button", { name: "Continue", exact: true }).click()

  // Validation state is the durable contract. The visible error copy remains
  // localized and is covered by message/component tests separately.
  await expect(page.locator('#name[aria-invalid="true"]')).toBeVisible()
  await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()

  await Promise.all([
    page.waitForURL((url) => url.hostname === "accounts.google.com", {
      waitUntil: "commit",
      timeout: 30_000,
    }),
    page.getByRole("button", { name: "Continue with Google" }).click(),
  ])
  await expect(page).toHaveURL(/accounts\.google\.com/)
  expect(new URL(page.url()).pathname).not.toBe("/signin/oauth/error")
})
