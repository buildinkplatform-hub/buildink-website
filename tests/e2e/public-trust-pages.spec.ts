import { expect, test } from "@playwright/test"

const publicPages = [
  "privacy",
  "terms",
  "cookies",
  "about",
  "contact",
  "faq",
  "verification",
  "how-it-works",
] as const

const locales = ["en", "it", "ar", "ro", "sq"] as const

test("renders every public trust and legal route instead of a 404", async ({
  page,
}) => {
  test.setTimeout(90_000)
  for (const path of publicPages) {
    const response = await page.goto(`/en/${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    expect(response?.status(), path).toBeLessThan(400)
    await expect(page.locator("main#main-content")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  }
})

test("keeps trust pages localized across every supported locale", async ({
  page,
}) => {
  test.setTimeout(90_000)
  for (const locale of locales) {
    const response = await page.goto(`/${locale}/how-it-works`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    expect(response?.status(), locale).toBeLessThan(400)
    await expect(page.locator("html")).toHaveAttribute("lang", locale)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15_000 })
  }
})

test("how it works exposes real marketplace entry points", async ({ page }) => {
  await page.goto("/en/how-it-works", { waitUntil: "domcontentloaded" })

  for (const label of [
    "Global search",
    "Companies",
    "Projects",
    "Open tenders",
    "Workers",
    "Verification & safety",
  ]) {
    await expect(page.getByRole("link", { name: label }).first()).toBeVisible()
  }

  const companyTab = page.getByRole("tab", { name: "Company" })
  await expect(companyTab).toBeVisible({ timeout: 15_000 })
  await companyTab.click()
  await expect(
    page.getByRole("link", { name: "Browse companies" }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Create account" }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Sign in" }).first(),
  ).toBeVisible()
})

test("offers working cookie controls and improved footer navigation", async ({
  page,
}) => {
  await page.goto("/en/cookies", { waitUntil: "domcontentloaded" })

  const analytics = page.getByRole("checkbox", { name: "Analytics" })
  await expect(analytics).toBeEnabled({ timeout: 15_000 })
  await analytics.click()
  await expect(analytics).toBeChecked()
  await page.getByRole("button", { name: "Save preferences" }).click()
  await expect(page.getByText("Preferences saved")).toBeVisible()

  const stored = await page.evaluate(() =>
    window.localStorage.getItem("buildink_cookie_preferences"),
  )
  expect(JSON.parse(stored ?? "{}")).toMatchObject({ analytics: true })

  const footer = page.getByRole("contentinfo")
  await expect(
    footer.getByRole("link", { name: "Global search" }).first(),
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Companies" }).first(),
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Open tenders" }).first(),
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Privacy policy" }).last(),
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Terms of service" }).last(),
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Cookie policy" }).last(),
  ).toBeVisible()
})
