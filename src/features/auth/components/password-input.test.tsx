import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import messages from "@/messages/en"
import { PasswordInput } from "./password-input"

describe("PasswordInput", () => {
  it("toggles password visibility with an accessible control", async () => {
    const user = userEvent.setup()
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PasswordInput aria-label="Password" />
      </NextIntlClientProvider>,
    )
    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")
  })
})
