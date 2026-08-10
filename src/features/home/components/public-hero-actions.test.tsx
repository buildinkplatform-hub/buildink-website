import { render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { PublicHeroActions } from "./public-hero-actions"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
}))

const labels = {
  register: "Create account",
  login: "Log in",
  profile: "Profile",
  dashboard: "Dashboard",
}

describe("PublicHeroActions", () => {
  it("shows auth calls to action when signed out", () => {
    render(<PublicHeroActions viewer={null} labels={labels} />)

    expect(screen.getByRole("link", { name: /Create account/ })).toHaveAttribute(
      "href",
      "/register",
    )
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    )
  })

  it("hides auth calls to action for signed-in onboarding users", () => {
    render(
      <PublicHeroActions
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
      screen.queryByRole("link", { name: /Create account/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Profile/ })).toHaveAttribute(
      "href",
      "/onboarding/profile-type",
    )
  })
})
