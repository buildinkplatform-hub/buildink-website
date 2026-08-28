import { expect, test } from "@playwright/test"

const onboardingRoutes = [
  "/en/onboarding/profile-type",
  "/en/onboarding/role",
  "/en/onboarding/profile",
  "/en/onboarding/documents",
  "/en/onboarding/review",
  "/en/onboarding/pending",
  "/en/onboarding/rejected",
] as const

async function expectLoginRedirect(
  page: import("@playwright/test").Page,
  path: string,
) {
  await page.goto(path)
  await expect(page).toHaveURL(/\/en\/login\?next=/, { timeout: 20_000 })
  const url = new URL(page.url())
  expect(url.pathname).toBe("/en/login")
  expect(url.searchParams.get("next")).toBe(path)
}

test.describe("onboarding route boundaries", () => {
  test("every onboarding step requires an authenticated account", async ({
    page,
  }) => {
    for (const path of onboardingRoutes) {
      await expectLoginRedirect(page, path)
    }
  })

  test("onboarding deep links preserve locale and requested step", async ({
    page,
  }) => {
    for (const locale of ["it", "ar", "ro", "sq"] as const) {
      const path = `/${locale}/onboarding/profile`
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(`/${locale}/login\\?next=`), {
        timeout: 20_000,
      })
      const url = new URL(page.url())
      expect(url.pathname).toBe(`/${locale}/login`)
      expect(url.searchParams.get("next")).toBe(path)
    }
  })

  test("invalid onboarding steps do not expose wizard content", async ({
    page,
  }) => {
    await page.goto("/en/onboarding/not-a-real-step")
    await expect(page).toHaveURL(/\/en\/login\?next=/, { timeout: 20_000 })
    expect(new URL(page.url()).searchParams.get("next")).toBe(
      "/en/onboarding/not-a-real-step",
    )
  })
})
