import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { loginAction } from "@/features/auth/actions/auth.actions"
import messages from "@/messages/en"
import { LoginForm } from "./login-form"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
}))

vi.mock("@/features/auth/actions/auth.actions", () => ({
  googleLoginAction: vi.fn(),
  loginAction: vi.fn(),
}))

function renderLoginForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LoginForm />
    </NextIntlClientProvider>,
  )
}

async function submitLogin() {
  const user = userEvent.setup()
  await user.type(
    screen.getByLabelText(/^Email address/),
    "buildinkplatform+service-test@gmail.com",
  )
  await user.type(
    screen.getByLabelText(/^Password/),
    "Buildink!WebsiteTest#7318",
  )
  await user.click(screen.getByRole("button", { name: /^Log in$/ }))
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does not misreport an authentication backend failure as invalid credentials", async () => {
    vi.mocked(loginAction).mockResolvedValue({
      success: false,
      error: "backend",
    })

    renderLoginForm()
    await submitLogin()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign-in is temporarily unavailable",
    )
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "email or password is incorrect",
    )
  })

  it("explains when sign-in is rate limited", async () => {
    vi.mocked(loginAction).mockResolvedValue({
      success: false,
      error: "rate_limited",
      retryAfterSeconds: 60,
    })

    renderLoginForm()
    await submitLogin()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many sign-in attempts",
    )
  })

  it("keeps the invalid-credentials message for an actual invalid login", async () => {
    vi.mocked(loginAction).mockResolvedValue({
      success: false,
      error: "invalid",
    })

    renderLoginForm()
    await submitLogin()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password is incorrect",
    )
  })
})
