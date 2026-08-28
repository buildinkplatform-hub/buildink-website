import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { TabsNav } from "./tabs"

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}))

describe("TabsNav", () => {
  it("uses a contained desktop grid and a mobile select without a horizontal scroller", () => {
    const { container } = render(
      <TabsNav
        items={[
          {
            value: "attendance",
            label: "Attendance",
            href: "/attendance",
            active: true,
          },
          { value: "production", label: "Production", href: "/production" },
          { value: "costs", label: "Costs", href: "/costs" },
        ]}
      />,
    )
    expect(
      screen.getByRole("navigation", { name: "Section navigation" }),
    ).toBeVisible()
    expect(screen.getByRole("combobox")).toBeVisible()
    expect(container.querySelector(".overflow-x-auto")).toBeNull()
    expect(screen.getByRole("link", { name: "Attendance" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })
})
