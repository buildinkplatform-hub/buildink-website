import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { registerAction } from "@/features/auth/actions/auth.actions"
import messages from "@/messages/en"
import { RegisterForm } from "./register-form"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
}))

vi.mock("@/features/auth/actions/auth.actions", () => ({
  googleLoginAction: vi.fn(),
  registerAction: vi.fn(),
}))

async function completeRegistrationForm(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByLabelText(/Full name/), "Test User")
  await user.type(screen.getByLabelText(/Email address/), "test@example.com")
  await user.type(screen.getByLabelText(/^Password/), "Buildink@123")
  await user.type(screen.getByLabelText(/Confirm password/), "Buildink@123")
  await user.click(screen.getByLabelText(/I accept the Terms of Service/))
  await user.click(screen.getByLabelText(/I have read and accept/))
  await user.click(screen.getByRole("button", { name: /^Continue$/ }))
}

function renderRegisterForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <RegisterForm />
    </NextIntlClientProvider>,
  )
}

describe("RegisterForm", () => {
  it("shows a registration email error instead of invalid credentials", async () => {
    const user = userEvent.setup()
    vi.mocked(registerAction).mockResolvedValue({
      success: false,
      error: "email_delivery",
    })
    renderRegisterForm()
    await completeRegistrationForm(user)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not send its confirmation email",
    )
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "email or password is incorrect",
    )
    expect(
      screen.getByRole("link", { name: "Open email verification options" }),
    ).toHaveAttribute("href", "/verify-email?email=test%40example.com")
  })

  it("shows a countdown and disables submission while rate limited", async () => {
    const user = userEvent.setup()
    vi.mocked(registerAction).mockResolvedValue({
      success: false,
      error: "rate_limited",
      retryAfterSeconds: 61,
    })
    renderRegisterForm()
    await completeRegistrationForm(user)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You can try again in 01:01",
    )
    expect(
      screen.getByRole("button", { name: /Try again in 01:01/ }),
    ).toBeDisabled()
  })
})
