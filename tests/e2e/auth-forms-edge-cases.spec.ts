import { expect, test, type Page } from "@playwright/test"

async function authCookies(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.filter(
    (cookie) =>
      cookie.name === "sb-buildink-website-auth" ||
      cookie.name.startsWith("sb-buildink-website-auth."),
  )
}

test.describe("auth form edge cases", () => {
  test("login rejects empty and malformed credentials before submission", async ({
    page,
  }) => {
    await page.goto("/en/login")

    await page.getByRole("button", { name: "Log in", exact: true }).click()
    await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()
    await expect(page.locator('#password[aria-invalid="true"]')).toBeVisible()
    expect(await authCookies(page)).toHaveLength(0)

    await page.getByLabel("Email address").fill("not-an-email")
    await page.locator("#password").fill("anything")
    await page.getByRole("button", { name: "Log in", exact: true }).click()
    await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()
    await expect(page).toHaveURL(/\/en\/login/)
    expect(await authCookies(page)).toHaveLength(0)
  })

  test("invalid server credentials show one generic error and never create a session", async ({
    page,
  }) => {
    await page.goto("/en/login")
    await page.getByLabel("Email address").fill("unknown-user@example.com")
    await page.locator("#password").fill("Wrong-Password-123!")
    await page.getByRole("button", { name: "Log in", exact: true }).click()

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 20_000 })
    await expect(page).toHaveURL(/\/en\/login/)
    await expect
      .poll(async () => (await authCookies(page)).length, { timeout: 10_000 })
      .toBe(0)
  })

  test("remember-me is optional and keyboard-operable", async ({ page }) => {
    await page.goto("/en/login")
    const remember = page.getByRole("checkbox")
    await expect(remember).toBeEnabled()
    await expect(remember).not.toBeChecked()
    await remember.focus()
    await page.keyboard.press("Space")
    await expect(remember).toBeChecked()
    await page.keyboard.press("Space")
    await expect(remember).not.toBeChecked()
  })

  test("registration validates identity, password strength, confirmation and mandatory consent", async ({
    page,
  }) => {
    await page.goto("/en/register")
    await page.getByRole("button", { name: "Continue", exact: true }).click()

    await expect(page.locator('#name[aria-invalid="true"]')).toBeVisible()
    await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()

    await page.locator("#name").fill("A")
    await page.getByLabel("Email address").fill("broken-email")
    await page.locator("#password").fill("weak")
    await page.locator("#confirmPassword").fill("different")
    await page.getByRole("button", { name: "Continue", exact: true }).click()

    await expect(page.locator('#name[aria-invalid="true"]')).toBeVisible()
    await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()
    await expect(page.locator('#password[aria-invalid="true"]')).toBeVisible()
    await expect(
      page.locator('#confirmPassword[aria-invalid="true"]'),
    ).toBeVisible()
    await expect(
      page.locator('input[type="checkbox"][aria-invalid="true"]'),
    ).toHaveCount(2)
  })

  test("registration accepts valid field values while marketing consent remains optional", async ({
    page,
  }) => {
    await page.goto("/en/register")
    await page.locator("#name").fill("QA Registration User")
    await page.getByLabel("Email address").fill("qa-registration@example.com")
    await page.locator("#password").fill("Strong-Password-123!")
    await page.locator("#confirmPassword").fill("Strong-Password-123!")

    const checkboxes = page.getByRole("checkbox")
    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()

    await expect(checkboxes.nth(0)).toBeChecked()
    await expect(checkboxes.nth(1)).toBeChecked()
    await expect(checkboxes.nth(2)).not.toBeChecked()
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0)
  })

  test("forgot-password rejects malformed email and keeps recovery anti-enumerating", async ({
    page,
  }) => {
    await page.goto("/en/forgot-password")
    await page.getByLabel("Email address").fill("not-an-email")
    await page.getByRole("button", { name: "Send reset instructions" }).click()
    await expect(page.locator('#email[aria-invalid="true"]')).toBeVisible()

    await page
      .getByLabel("Email address")
      .fill("definitely-unknown@example.com")
    await page.getByRole("button", { name: "Send reset instructions" }).click()
    await expect(
      page.getByRole("heading", { name: "Check your inbox" }),
    ).toBeVisible({ timeout: 20_000 })
  })

  test("password fields can be revealed without changing their values", async ({
    page,
  }) => {
    await page.goto("/en/login")
    const password = page.locator("#password")
    await password.fill("Secret-Password-123!")
    await expect(password).toHaveAttribute("type", "password")

    const toggle = page.getByRole("button", { name: /password/i }).last()
    if (await toggle.isVisible()) {
      await toggle.click()
      await expect(password).toHaveAttribute("type", "text")
      await expect(password).toHaveValue("Secret-Password-123!")
    }
  })
})
