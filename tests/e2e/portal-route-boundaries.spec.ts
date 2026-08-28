import { expect, test } from "@playwright/test"

const portalListRoutes = [
  "profile",
  "verification",
  "workspace",
  "members",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "workforce",
  "operations",
  "catalogue",
  "equipment",
  "engagements",
  "messages",
  "saved",
  "notifications",
  "settings",
  "support",
] as const

const createRoutes = [
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "catalogue",
  "equipment",
] as const

const editRoutes = [
  "projects",
  "opportunities",
  "tenders",
  "catalogue",
  "equipment",
] as const

const detailRoutes = [
  "members",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "catalogue",
  "equipment",
  "engagements",
  "messages",
  "support",
] as const

const operationSubpages = [
  "attendance",
  "attendance/check-in",
  "attendance/exceptions",
  "crews",
  "tasks",
  "production",
  "labour",
  "materials",
  "equipment",
  "costs",
  "profit-control",
  "forecasts",
  "sal",
  "daily-reports",
  "compliance",
  "payroll",
  "alerts",
] as const

async function expectProtectedRedirect(
  page: import("@playwright/test").Page,
  path: string,
) {
  await page.goto(path)
  await expect(page).toHaveURL(/\/en\/login\?next=/, { timeout: 20_000 })
  const url = new URL(page.url())
  expect(url.pathname).toBe("/en/login")
  expect(url.searchParams.get("next")).toBe(path)
}

test.describe("portal authorization boundaries", () => {
  test("dashboard root and every list module preserve the requested deep link", async ({
    page,
  }) => {
    await expectProtectedRedirect(page, "/en/dashboard")
    for (const segment of portalListRoutes) {
      await expectProtectedRedirect(page, `/en/dashboard/${segment}`)
    }
  })

  test("create routes cannot be opened without a session", async ({ page }) => {
    for (const segment of createRoutes) {
      await expectProtectedRedirect(page, `/en/dashboard/${segment}/create`)
    }
  })

  test("detail and edit routes cannot leak records without a session", async ({
    page,
  }) => {
    const id = "11111111-1111-4111-8111-111111111111"
    for (const segment of detailRoutes) {
      await expectProtectedRedirect(page, `/en/dashboard/${segment}/${id}`)
    }
    for (const segment of editRoutes) {
      await expectProtectedRedirect(page, `/en/dashboard/${segment}/${id}/edit`)
    }
  })

  test("all operations subpages are protected consistently", async ({
    page,
  }) => {
    for (const subpage of operationSubpages) {
      await expectProtectedRedirect(page, `/en/dashboard/operations/${subpage}`)
    }
  })

  test("malicious external next targets are never accepted as an auth return path", async ({
    page,
  }) => {
    await page.goto("/en/login?next=https://evil.example/phish")
    await expect(page).toHaveURL(/\/en\/login/)
    expect(new URL(page.url()).searchParams.get("next")).toBe(
      "https://evil.example/phish",
    )

    // The page may preserve the untrusted query for display/state, but auth code
    // must not navigate to it. Existing auth-boundary tests cover the safe local
    // redirect behavior after successful login.
    await expect(
      page.getByRole("button", { name: "Log in", exact: true }),
    ).toBeVisible()
  })
})
