import { expect, test } from "@playwright/test"

async function dismissCookieBanner(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("buildink_cookie_banner_dismissed", "rejected")
  })
}

test.describe("public form edge cases", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test("contact form blocks empty and malformed values before mutation", async ({
    page,
  }) => {
    await page.goto("/en/contact")
    const form = page.getByRole("main").locator("form").last()
    const name = form.getByLabel("Your name")
    const email = form.getByLabel("Email address")
    const message = form.getByLabel("How can we help?")

    await form.getByRole("button", { name: "Send message" }).click()
    await expect(name).toHaveJSProperty("validity.valueMissing", true)

    await name.fill("QA User")
    await email.fill("not-an-email")
    await message.fill("This is a sufficiently detailed support request.")
    await form.getByRole("button", { name: "Send message" }).click()
    await expect(email).toHaveJSProperty("validity.typeMismatch", true)

    await email.fill("qa.public@example.com")
    await message.fill("short")
    await form.getByRole("button", { name: "Send message" }).click()
    await expect(message).toHaveJSProperty("validity.tooShort", true)
  })

  test("general contact persists structured category, profile and reference context", async ({
    page,
  }) => {
    await page.goto("/en/contact")
    const form = page.getByRole("main").locator("form").last()
    await form.getByLabel("Your name").fill("QA User")
    await form.getByLabel("Email address").fill("qa.public@example.com")
    await form.getByLabel("Phone number (optional)").fill("+39 0200000000")
    await form.getByLabel("Contact category").selectOption("VERIFICATION")
    await form
      .getByLabel("Profile type (optional)")
      .selectOption("contractor_company")
    await form
      .getByLabel("Relevant item ID (optional)")
      .fill("company-buildright")
    await form
      .getByLabel("Relevant URL (optional)")
      .fill("https://example.test/en/companies/buildright")
    await form
      .getByLabel("How can we help?")
      .fill("Please review the verification status for this company profile.")

    const submit = form.getByRole("button", { name: "Send message" })
    await submit.click()
    await expect(
      page.getByRole("status").filter({
        hasText: "Thanks — your message has been received.",
      }),
    ).toBeVisible()
    await expect(form).toHaveCount(0)
  })

  test("illegal-content flow requires exact URL, reason, legal basis and good-faith confirmation", async ({
    page,
  }) => {
    await page.goto("/en/contact")
    const form = page.getByRole("main").locator("form").last()
    await form.getByLabel("Your name").fill("Reporter")
    await form.getByLabel("Email address").fill("reporter@example.com")
    await form
      .getByLabel("Contact category")
      .selectOption("ILLEGAL_CONTENT_ABUSE")
    await form
      .getByLabel("How can we help?")
      .fill("This report concerns content displayed on a public listing.")

    const exactUrl = form.getByLabel("Relevant URL")
    const reason = form.getByLabel("Why is this content illegal or abusive?")
    const legalBasis = form.getByLabel("Law or right you believe is affected")
    const goodFaith = form.getByLabel(/I confirm in good faith/)
    const submit = form.getByRole("button", { name: "Send message" })

    await submit.click()
    await expect(exactUrl).toHaveJSProperty("validity.valueMissing", true)

    await exactUrl.fill("https://example.test/en/companies/unsafe-listing")
    await reason.fill(
      "The listing appears to impersonate another registered business.",
    )
    await legalBasis.fill("Identity and trademark rights")
    await submit.click()
    await expect(goodFaith).toHaveJSProperty("validity.valueMissing", true)

    await goodFaith.check()
    await submit.click()
    await expect(
      page.getByRole("status").filter({
        hasText: "Thanks — your message has been received.",
      }),
    ).toBeVisible()
  })

  test("newsletter validates email and records a successful consented subscription", async ({
    page,
  }) => {
    await page.goto("/en/about")
    const footer = page.locator("footer")
    const input = footer.getByPlaceholder("Enter your email address")
    const submit = footer.getByRole("button", { name: "Subscribe" })

    await submit.click()
    await expect(input).toHaveJSProperty("validity.valueMissing", true)

    await input.fill("invalid-email")
    await submit.click()
    await expect(input).toHaveJSProperty("validity.typeMismatch", true)

    await input.fill("qa.newsletter@example.com")
    await submit.click()
    await expect(
      footer.getByRole("status").filter({ hasText: "Thanks" }),
    ).toBeVisible()
  })
})
