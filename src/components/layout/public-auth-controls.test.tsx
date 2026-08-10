import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { PublicAuthControls } from "./public-auth-controls"

vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}))

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
}))

vi.mock("@/features/auth/actions/auth.actions", () => ({
  logoutAction: vi.fn(),
}))

const labels = {
  login: "Log in",
  register: "Create account",
  dashboard: "Dashboard",
  logout: "Log out",
  confirmLogoutTitle: "Confirm logout",
  confirmLogoutBody: "Are you sure?",
  confirmLogoutAction: "Log out now",
  cancel: "Cancel",
}

describe("PublicAuthControls", () => {
  it("shows login and registration buttons when signed out", () => {
    render(<PublicAuthControls locale="en" viewer={null} labels={labels} />)

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    )
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/register")
  })

  it("shows the signed-in user menu with initials fallback", async () => {
    const user = userEvent.setup()

    render(
      <PublicAuthControls
        locale="en"
        viewer={{
          name: "Test User",
          email: "test@example.com",
          nextAction: "continue_onboarding",
          profileHref: "/onboarding/profile-type",
          profileImageAssetId: null,
        }}
        labels={labels}
      />,
    )

    expect(
      screen.queryByRole("link", { name: "Create account" }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Test User" })).toHaveTextContent(
      "TU",
    )

    await user.click(screen.getByRole("button", { name: "Test User" }))

    expect(screen.getByRole("menuitem", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/onboarding/profile-type",
    )
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeVisible()
  })
})
