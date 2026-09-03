import { expect, test, type Page } from "@playwright/test"

const publicRoutes = [
  "/en",
  "/en/search",
  "/en/companies",
  "/en/project-owners",
  "/en/workers",
  "/en/subcontractors",
  "/en/service-providers",
  "/en/suppliers",
  "/en/equipment",
  "/en/projects",
  "/en/tenders",
  "/en/opportunities",
  "/en/how-it-works",
  "/en/verification",
  "/en/faq",
  "/en/about",
  "/en/contact",
  "/en/privacy",
  "/en/terms",
  "/en/cookies",
  "/en/help",
] as const

const authRoutes = [
  "/en/login",
  "/en/register",
  "/en/forgot-password",
  "/en/reset-password",
] as const

async function prepare(page: Page) {
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

async function inspectPage(page: Page, route: string) {
  const pageErrors: string[] = []
  const serverErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))
  page.on("response", (response) => {
    if (response.status() >= 500)
      serverErrors.push(`${response.status()} ${response.url()}`)
  })

  const response = await page.goto(route, { waitUntil: "domcontentloaded" })
  expect(response, `${route} should return an HTTP response`).not.toBeNull()
  expect(response!.status(), `${route} should not return 5xx`).toBeLessThan(500)
  await expect(page.locator("body")).toBeVisible()

  const contracts = await page.evaluate(() => {
    const visible = (element: Element) => {
      const html = element as HTMLElement
      const style = getComputedStyle(html)
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        html.getClientRects().length > 0
      )
    }

    const ids = [...document.querySelectorAll<HTMLElement>("[id]")]
      .map((element) => element.id)
      .filter(Boolean)
    const duplicates = [
      ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
    ]

    const unnamedButtons = [
      ...document.querySelectorAll<HTMLElement>('button, [role="button"]'),
    ]
      .filter(visible)
      .filter((element) => {
        const text = element.textContent?.trim()
        return !(
          text ||
          element.getAttribute("aria-label") ||
          element.getAttribute("aria-labelledby") ||
          element.getAttribute("title")
        )
      })
      .map((element) => element.outerHTML.slice(0, 240))

    const unlabeledControls = [
      ...document.querySelectorAll<HTMLElement>("input, select, textarea"),
    ]
      .filter(visible)
      .filter((element) => {
        if (element.getAttribute("aria-hidden") === "true") return false
        if (element instanceof HTMLInputElement && element.type === "hidden")
          return false
        const id = element.id
        const explicit = id
          ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
          : null
        return !(
          explicit ||
          element.closest("label") ||
          element.getAttribute("aria-label") ||
          element.getAttribute("aria-labelledby") ||
          element.getAttribute("title") ||
          element.getAttribute("placeholder")
        )
      })
      .map((element) => element.outerHTML.slice(0, 240))

    return { duplicates, unnamedButtons, unlabeledControls }
  })

  expect(contracts.duplicates, `${route} has duplicate DOM ids`).toEqual([])
  expect(
    contracts.unnamedButtons,
    `${route} has unnamed visible buttons`,
  ).toEqual([])
  expect(
    contracts.unlabeledControls,
    `${route} has unlabeled visible controls`,
  ).toEqual([])
  expect(pageErrors, `${route} emitted page errors`).toEqual([])
  expect(serverErrors, `${route} received 5xx responses`).toEqual([])
}

test.describe("website public and auth UI contracts", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.setTimeout(300_000)

  test("public and auth routes satisfy baseline component contracts", async ({
    page,
  }) => {
    await prepare(page)
    for (const route of [...publicRoutes, ...authRoutes])
      await inspectPage(page, route)
  })

  test("representative public/auth pages do not horizontally overflow at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await prepare(page)
    for (const route of [
      "/en",
      "/en/about",
      "/en/privacy",
      "/en/contact",
      "/en/login",
      "/en/register",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      )
      expect(
        overflow,
        `${route} should fit a 320px viewport`,
      ).toBeLessThanOrEqual(2)
    }
  })
})
