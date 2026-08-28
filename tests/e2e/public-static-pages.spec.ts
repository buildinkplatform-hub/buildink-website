import { expect, test } from "@playwright/test"

const staticRoutes = [
  "about",
  "how-it-works",
  "verification",
  "faq",
  "contact",
  "privacy",
  "cookies",
  "terms",
] as const

async function dismissCookieBanner(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("buildink_cookie_banner_dismissed", "rejected")
    window.localStorage.setItem(
      "buildink_cookie_preferences",
      JSON.stringify({
        preferences: false,
        analytics: false,
        marketing: false,
      }),
    )
  })
}

test.describe("reviewed static public pages", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test("all eight pages are public in all five Website languages", async ({
    page,
  }) => {
    test.setTimeout(180_000)
    for (const locale of ["it", "en", "ar", "ro", "sq"] as const) {
      for (const route of staticRoutes) {
        const response = await page.goto(`/${locale}/${route}`)
        expect(response?.ok(), `/${locale}/${route} should be public`).toBe(
          true,
        )
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      }
    }
  })

  test("every translation preserves verified operator details", async ({
    page,
  }) => {
    for (const locale of ["it", "en", "ar", "ro", "sq"] as const) {
      await page.goto(`/${locale}/about`)
      await expect(
        page.getByText("METWALLY AMR", { exact: false }),
      ).toBeVisible()
      await expect(
        page.getByText("03994850133", { exact: false }),
      ).toBeVisible()
      await expect(page.getByText("CO-413411", { exact: false })).toBeVisible()
      await expect(
        page.getByText("metwally.arm@pec.it", { exact: false }),
      ).toBeVisible()
    }
  })

  test("FAQ exposes the full ten-question set in every language", async ({
    page,
  }) => {
    const expectedFirst = {
      it: "Che cos'è Buildink?",
      en: "What is Buildink?",
      ar: "ما هي Buildink؟",
      ro: "Ce este Buildink?",
      sq: "Çfarë është Buildink?",
    } as const
    for (const locale of ["it", "en", "ar", "ro", "sq"] as const) {
      await page.goto(`/${locale}/faq`)
      await expect(
        page.getByRole("button", { name: expectedFirst[locale] }),
      ).toBeVisible()
      await expect(page.locator("main button")).toHaveCount(10)
    }
  })

  test("legal pages contain no unresolved square-bracket placeholders", async ({
    page,
  }) => {
    for (const locale of ["it", "en", "ar", "ro", "sq"] as const) {
      for (const route of ["privacy", "cookies", "terms"] as const) {
        await page.goto(`/${locale}/${route}`)
        const mainText = await page.locator("main").innerText()
        expect(mainText).not.toMatch(/\[[^\]]+\]/)
      }
    }
  })

  test("footer exposes all eight public information and legal routes", async ({
    page,
  }) => {
    await page.goto("/en/about")
    const required = [
      "/en/about",
      "/en/how-it-works",
      "/en/verification",
      "/en/faq",
      "/en/contact",
      "/en/privacy",
      "/en/terms",
      "/en/cookies#cookie-preferences",
    ]
    for (const href of required) {
      await expect(
        page.locator(`footer a[href="${href}"]`).first(),
      ).toBeVisible()
    }
  })

  test("Arabic, Romanian and Albanian legal pages are translated, not English fallbacks", async ({
    page,
  }) => {
    const titles = {
      ar: "شروط الخدمة",
      ro: "Termeni și condiții",
      sq: "Kushtet e shërbimit",
    } as const
    for (const locale of ["ar", "ro", "sq"] as const) {
      await page.goto(`/${locale}/terms`)
      await expect(
        page.getByRole("heading", { level: 1, name: titles[locale] }),
      ).toBeVisible()
      await expect(
        page.getByRole("heading", { level: 1, name: "Terms of Service" }),
      ).toHaveCount(0)
    }
  })

  test("registration links directly to the static Terms and Privacy pages", async ({
    page,
  }) => {
    await page.goto("/en/register")
    await expect(page.locator('a[href="/en/terms"]')).toBeVisible()
    await expect(page.locator('a[href="/en/privacy"]')).toBeVisible()
  })
})

test.describe("cookie consent", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("reject all and accept all have equal prominence and persist rejection", async ({
    page,
  }) => {
    await page.goto("/en/about")
    const reject = page.getByRole("button", { name: "Reject all" })
    const accept = page.getByRole("button", { name: "Accept all" })
    await expect(reject).toBeVisible()
    await expect(accept).toBeVisible()
    expect(await reject.getAttribute("class")).toBe(
      await accept.getAttribute("class"),
    )

    await reject.click()
    await expect(reject).toHaveCount(0)
    expect(
      await page.evaluate(() =>
        JSON.parse(
          window.localStorage.getItem("buildink_cookie_preferences") ?? "{}",
        ),
      ),
    ).toEqual({ preferences: false, analytics: false, marketing: false })

    await page.reload()
    await expect(page.getByRole("button", { name: "Reject all" })).toHaveCount(
      0,
    )
    await expect(
      page.locator('footer a[href="/en/cookies#cookie-preferences"]').first(),
    ).toBeVisible()
  })

  test("manage cookies opens granular controls", async ({ page }) => {
    await page.goto("/en/about")
    await page.getByRole("link", { name: /Manage cookies/i }).click()
    await expect(page).toHaveURL(/\/en\/cookies#cookie-preferences$/)
    await expect(page.locator("#cookie-preferences")).toBeVisible()
    await expect(
      page.locator("#cookie-preferences input[type=checkbox]"),
    ).toHaveCount(3)
  })
})
