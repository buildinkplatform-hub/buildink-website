import { createClient } from "@supabase/supabase-js"
import { expect, test, type Page } from "@playwright/test"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecret = process.env.E2E_SUPABASE_SECRET_KEY

const createAdminClient = () =>
  createClient(supabaseUrl!, supabaseSecret!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

type AdminClient = ReturnType<typeof createAdminClient>

interface SwitchAccount {
  id: string
  email: string
  password: string
}

test.skip(
  !supabaseUrl || !supabaseSecret,
  "Account switching tests require NEXT_PUBLIC_SUPABASE_URL and E2E_SUPABASE_SECRET_KEY",
)

async function createAccount(
  admin: AdminClient,
  label: string,
): Promise<SwitchAccount> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `buildink-e2e-switch-${label}-${suffix}@example.com`
  const password = `Switch-${suffix}-Aa9!`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: `E2E Switch ${label}`, preferred_locale: "en" },
  })
  if (error || !data.user) {
    throw new Error(
      `Unable to provision switching account: ${error?.message ?? "unknown"}`,
    )
  }
  return { id: data.user.id, email, password }
}

async function deleteAccount(admin: AdminClient, account: SwitchAccount) {
  await admin.auth.admin.deleteUser(account.id).catch(() => undefined)
}

function accountMenu(page: Page, email: string) {
  return page.getByRole("button", { name: new RegExp(email, "i") })
}

async function expectSignedInAs(page: Page, account: SwitchAccount) {
  await expect(page).toHaveURL(/\/en\/dashboard(?:\/|$)/, { timeout: 45_000 })
  await expect(accountMenu(page, account.email)).toBeVisible({
    timeout: 45_000,
  })
}

async function login(page: Page, account: SwitchAccount) {
  await page.goto("/en/login")
  await page.getByLabel("Email address").fill(account.email)
  await page.locator("#password").fill(account.password)
  await page.getByRole("button", { name: "Log in", exact: true }).click()
  await expectSignedInAs(page, account)
}

async function logout(page: Page, account: SwitchAccount) {
  const menu = accountMenu(page, account.email)
  await menu.click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page
    .getByRole("button", { name: "Yes, log out" })
    .click({ timeout: 20_000 })
  await page.waitForURL(/\/en\/login/, { timeout: 30_000 })
}

async function authCookies(page: Page) {
  return (await page.context().cookies()).filter(
    (cookie) =>
      cookie.name === "sb-buildink-website-auth" ||
      cookie.name.startsWith("sb-buildink-website-auth."),
  )
}

async function expectNoAuthCookies(page: Page) {
  await expect
    .poll(async () => (await authCookies(page)).length, { timeout: 30_000 })
    .toBe(0)
}

test("logout terminates the session and allows switching to another account", async ({
  page,
}) => {
  const admin = createAdminClient()
  const first = await createAccount(admin, "a")
  const second = await createAccount(admin, "b")
  test.setTimeout(180_000)

  try {
    await login(page, first)
    const staleFirstSessionCookies = await authCookies(page)
    expect(staleFirstSessionCookies.length).toBeGreaterThan(0)

    await logout(page, first)
    await expectNoAuthCookies(page)

    // Model the production race from C-01: a portal response that started before
    // logout arrives late and attempts to restore an old Supabase auth cookie.
    // Treat cookie values as opaque: @supabase/ssr controls their encoding.
    await page.context().addCookies(staleFirstSessionCookies)
    await page.reload()
    await expect(page).toHaveURL(/\/en\/login/)
    await expectNoAuthCookies(page)

    await login(page, second)
    await expect(accountMenu(page, first.email)).toHaveCount(0)

    await page.reload()
    await expectSignedInAs(page, second)
    await expect(accountMenu(page, first.email)).toHaveCount(0)

    await logout(page, second)
    await expectNoAuthCookies(page)
    await expect(page).toHaveURL(/\/en\/login/)
  } finally {
    await deleteAccount(admin, first)
    await deleteAccount(admin, second)
  }
})

test("browser back after logout cannot restore protected portal content", async ({
  page,
}) => {
  const admin = createAdminClient()
  const account = await createAccount(admin, "history")
  test.setTimeout(120_000)

  try {
    await login(page, account)
    await logout(page, account)
    await expectNoAuthCookies(page)

    await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => null)
    await expect(page).toHaveURL(/\/en\/login(?:\?|$)/, { timeout: 30_000 })
    await expect(accountMenu(page, account.email)).toHaveCount(0)
    await expectNoAuthCookies(page)
  } finally {
    await deleteAccount(admin, account)
  }
})
