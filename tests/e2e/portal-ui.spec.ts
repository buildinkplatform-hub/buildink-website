import { expect, test, type Page, type TestInfo } from "@playwright/test"

interface PortalAccount {
  persona: string
  email: string
  password: string
}

const accounts = parseAccounts(process.env.E2E_PORTAL_ACCOUNTS_JSON)

function parseAccounts(value?: string): PortalAccount[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as PortalAccount[]
    return parsed.filter(
      (account) => account.persona && account.email && account.password,
    )
  } catch {
    return []
  }
}

async function expectNoOverflow(page: Page, context: string) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(
    dimensions.scrollWidth,
    `${context} should fit within ${dimensions.clientWidth}px`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function expectFloatingContentInViewport(page: Page) {
  const menu = page.getByRole("menu")
  await expect(menu).toBeVisible()
  const viewport = page.viewportSize()!
  await expect
    .poll(async () => {
      const box = await menu.boundingBox()
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

async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready)
  await testInfo.attach(name, {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  })
}

async function login(page: Page, account: PortalAccount) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.context().clearCookies()
    await page.goto("/en/login")
    await page.getByLabel("Email address").fill(account.email)
    await page.locator("#password").fill(account.password)
    await page.getByRole("button", { name: "Log in", exact: true }).click()
    try {
      await page.waitForURL(/\/en\/dashboard$/, { timeout: 30_000 })
      return
    } catch (error) {
      if (attempt === 2) throw error
    }
  }
}

test("website personas have polished, responsive portal shells and dropdowns", async ({
  page,
}, testInfo) => {
  test.skip(
    !accounts.length,
    "Provide E2E_PORTAL_ACCOUNTS_JSON to audit seeded portals",
  )
  test.setTimeout(600_000)

  for (const [index, account] of accounts.entries()) {
    await login(page, account)
    await expect(page.locator("main#main-content")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    })
    await expectNoOverflow(page, `${account.persona} portal`)

    const portalNav = page.getByRole("navigation", { name: "Portal" })
    const mobileMenu = page.locator("button:has(svg.lucide-menu)")
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.getByRole("dialog")).toBeVisible()
      await expect(
        page.getByRole("dialog").getByRole("navigation"),
      ).toBeVisible()
      await page.keyboard.press("Escape")
    } else {
      await expect(portalNav).toBeVisible()
    }

    const accountMenu = page.getByRole("button", {
      name: new RegExp(account.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    await accountMenu.click()
    await expectFloatingContentInViewport(page)
    await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible()
    await page.keyboard.press("Escape")

    await page.getByRole("button", { name: /^Language:/ }).click()
    await expectFloatingContentInViewport(page)
    await page.keyboard.press("Escape")

    await page.locator("button:has(svg.lucide-bell)").click()
    await expectFloatingContentInViewport(page)
    await page.keyboard.press("Escape")

    for (const route of ["/dashboard/settings", "/dashboard/support", "/dashboard/workforce"]) {
      await page.goto(`/en${route}`)
      await expect(page.locator("main#main-content")).toBeVisible()
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 30_000,
      })
      await expectNoOverflow(page, `${account.persona} ${route}`)
    }

    if (index === 0) {
      await attachScreenshot(
        page,
        testInfo,
        `${testInfo.project.name}-portal-${account.persona}`,
      )
      await page.getByRole("button", { name: /^Language:/ }).click()
      await page.getByRole("menuitem", { name: "العربية" }).click()
      await expect(page).toHaveURL(/\/ar\/dashboard$/, { timeout: 30_000 })
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 30_000,
      })
      await expectNoOverflow(page, `${account.persona} Arabic portal`)
      await accountMenu.click()
      await expectFloatingContentInViewport(page)
      await attachScreenshot(
        page,
        testInfo,
        `${testInfo.project.name}-portal-${account.persona}-rtl`,
      )
      await page.keyboard.press("Escape")
    }
  }
})
