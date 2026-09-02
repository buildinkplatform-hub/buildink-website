import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { PortalDataTable } from "./portal-data-table"

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard/projects",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const labels = {
  search: "Search projects",
  status: "Status",
  allStatuses: "All statuses",
  sort: "Sort",
  newest: "Newest",
  titleAsc: "Title A-Z",
  details: "Details",
  actions: "Actions",
  previous: "Previous",
  next: "Next",
  showing: "Showing",
  totalRecords: "total records",
  rows: "rows",
}

const rows = [
  {
    id: "project-1",
    title: "Central station upgrade",
    secondary: "Project owner",
    statuses: ["PENDING_REVIEW"],
  },
  {
    id: "project-2",
    title: "Airport package",
    secondary: "Contractor",
    statuses: ["ACTIVE"],
  },
]

describe("PortalDataTable", () => {
  it("humanizes backend enum statuses instead of leaking raw values", () => {
    render(<PortalDataTable rows={rows} empty="No projects" labels={labels} />)

    expect(screen.getAllByText("Pending review").length).toBeGreaterThan(0)
    expect(screen.queryByText("PENDING_REVIEW")).not.toBeInTheDocument()
  })

  it("keeps status filtering operable with human-readable option labels", async () => {
    const user = userEvent.setup()
    render(<PortalDataTable rows={rows} empty="No projects" labels={labels} />)

    await user.click(screen.getByRole("combobox", { name: "Status" }))
    await user.click(screen.getByRole("option", { name: "Active" }))

    expect(screen.getAllByText("Airport package").length).toBeGreaterThan(0)
    expect(
      screen.queryByText("Central station upgrade"),
    ).not.toBeInTheDocument()
  })
})
