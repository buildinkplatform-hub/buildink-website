import { expect, test, type Page, type TestInfo } from "@playwright/test"

const routes = [
  "/",
  "/companies",
  "/tenders",
  "/equipment",
  "/login",
  "/register",
]
const locales = [
  { locale: "en", direction: "ltr" },
  { locale: "ar", direction: "rtl" },
] as const

async function expectResponsiveDocument(page: Page, route: string) {
  await expect(page.locator("main#main-content")).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible()

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.body.querySelectorAll<HTMLElement>("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return (
          rect.width > 0 &&
          (rect.left < -1 ||
            rect.right > document.documentElement.clientWidth + 1) &&
          !element.closest(
            "[data-radix-popper-content-wrapper], .overflow-x-auto",
          )
        )
      })
      .slice(0, 5)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        text: element.textContent?.trim().slice(0, 60),
      })),
  }))

  expect(
    layout.scrollWidth,
    `${route} overflows at ${layout.clientWidth}px: ${JSON.stringify(layout.offenders)}`,
  ).toBeLessThanOrEqual(layout.clientWidth + 1)
}

async function attachViewportScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await page.evaluate(() => document.fonts.ready)
  await testInfo.attach(name, {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  })
}

async function expectPopupInViewport(page: Page, role: "menu" | "listbox") {
  const popup = page.getByRole(role)
  await expect(popup).toBeVisible()
  const viewport = page.viewportSize()!
  await expect
    .poll(async () => {
      const box = await popup.boundingBox()
      if (!box) return Number.POSITIVE_INFINITY
      return Math.max(
        -box.x,
        -box.y,
        box.x + box.width - viewport.width,
        box.y + box.height - viewport.height,
      )
    })
    .toBeLessThanOrEqual(1)
}

test("public routes remain usable without horizontal overflow in LTR and RTL", async ({
  page,
}, testInfo) => {
  for (const { locale, direction } of locales) {
    for (const route of routes) {
      const path = `/${locale}${route === "/" ? "" : route}`
      const response = await page.goto(path)
      expect(response?.ok(), `${path} should respond successfully`).toBe(true)
      await expect(page.locator("html")).toHaveAttribute("lang", locale)
      await expect(page.locator("html")).toHaveAttribute("dir", direction)
      await expectResponsiveDocument(page, path)

      if (locale === "ar" && route === "/login") {
        await expect(
          page.getByRole("button", { name: "المتابعة باستخدام Google" }),
        ).toBeVisible()
        await expect(
          page.getByText("Buildink portal", { exact: true }),
        ).toHaveCount(0)
      }

      if (route === "/") {
        await attachViewportScreenshot(
          page,
          testInfo,
          `${testInfo.project.name}-${locale}-home`,
        )
      }
    }
  }
})

test("mobile navigation opens from the reading-start edge", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 1280)

  for (const { locale, direction } of locales) {
    await page.goto(`/${locale}`)
    await page.locator("button:has(svg.lucide-menu)").click()
    const navigation = page.getByRole("dialog")
    await expect(navigation).toBeVisible()
    const box = await navigation.boundingBox()
    const viewportWidth = page.viewportSize()!.width
    expect(box).not.toBeNull()
    if (direction === "rtl") {
      expect(Math.abs(box!.x + box!.width - viewportWidth)).toBeLessThanOrEqual(
        1,
      )
    } else {
      expect(Math.abs(box!.x)).toBeLessThanOrEqual(1)
    }
    await page.keyboard.press("Escape")
  }
})

test("public dropdowns stay legible and inside the viewport in LTR and RTL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("buildink_cookie_banner_dismissed", "accepted")
  })

  for (const { locale } of locales) {
    await page.goto(`/${locale}`)

    const languageLabel = locale === "ar" ? /^اللغة:/ : /^Language:/
    await page.getByRole("button", { name: languageLabel }).click()
    await expectPopupInViewport(page, "menu")
    await page.keyboard.press("Escape")

    const desktopNavigation = page.getByRole("navigation").first()
    if (await desktopNavigation.isVisible()) {
      await desktopNavigation.getByRole("button").first().click()
      await expectPopupInViewport(page, "menu")
      await page.keyboard.press("Escape")
    }

    await page.getByRole("combobox").click()
    await expectPopupInViewport(page, "listbox")
    await page.keyboard.press("Escape")
  }
})
