import { expect, test } from "@playwright/test"

test("validates registration and starts the configured Google OAuth flow", async ({
  page,
}) => {
  await page.goto("/en/register")
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(page.getByText("Enter your full name.")).toBeVisible()

  await Promise.all([
    page.waitForURL((url) => url.hostname === "accounts.google.com", {
      waitUntil: "commit",
    }),
    page.getByRole("button", { name: "Continue with Google" }).click(),
  ])
  await expect(page).toHaveURL(/accounts\.google\.com/)
  expect(new URL(page.url()).pathname).not.toBe("/signin/oauth/error")
})
