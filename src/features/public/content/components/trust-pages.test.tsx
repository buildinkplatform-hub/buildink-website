import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "@/messages/en"
import { CookiePreferencesPanel } from "./cookie-preferences-panel"
import { HowItWorksExplorer } from "./how-it-works-explorer"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : "/"} {...props}>
      {children}
    </a>
  ),
}))

function renderWithMessages(node: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  )
}

describe("HowItWorksExplorer", () => {
  it("switches the role-specific workflow and CTA without losing the shared journey", async () => {
    const user = userEvent.setup()
    renderWithMessages(<HowItWorksExplorer />)

    expect(
      screen.getByText(/publish projects and tenders, review bids/i),
    ).toBeVisible()

    await user.click(screen.getByRole("tab", { name: "Worker" }))

    expect(
      screen.getByText(
        /create a professional profile, apply to opportunities/i,
      ),
    ).toBeVisible()
    expect(
      screen.getByRole("link", { name: /browse worker opportunities/i }),
    ).toHaveAttribute("href", "/opportunities/workers")
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/register")
  })
})

describe("CookiePreferencesPanel", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("persists optional cookie choices and dismisses the banner as managed", async () => {
    const user = userEvent.setup()
    renderWithMessages(<CookiePreferencesPanel />)

    expect(screen.getByText("Always on")).toBeVisible()

    await user.click(screen.getByRole("checkbox", { name: "Analytics" }))
    await user.click(screen.getByRole("button", { name: "Save preferences" }))

    expect(
      JSON.parse(
        window.localStorage.getItem("buildink_cookie_preferences") ?? "{}",
      ),
    ).toMatchObject({ analytics: true, preferences: false, marketing: false })
    expect(
      window.localStorage.getItem("buildink_cookie_banner_dismissed"),
    ).toBe("managed")
    expect(screen.getByText("Preferences saved")).toBeVisible()
  })
})
