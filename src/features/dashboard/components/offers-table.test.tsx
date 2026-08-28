import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { OffersTable } from "./offers-table"

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard/offers",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const labels = {
  search: "Search offers",
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
  reference: "Reference",
  direction: "Direction",
  submitted: "Submitted",
  revisions: "Revisions",
  totalRecords: "total records",
  rows: "rows",
  statusLabels: { SUBMITTED: "Submitted", DRAFT: "Draft" },
}

const rows = [
  {
    id: "offer-1",
    title: "Zulu excavation",
    secondary: "BID-001 · submitted",
    amount: "€1,500",
    reference: "BID-001",
    inbox: "Sent",
    submitted: "Aug 26, 2026",
    revisions: 2,
    statusLabel: "Submitted",
    status: "SUBMITTED",
    statuses: ["SUBMITTED"],
    actions: <button type="button">Withdraw offer</button>,
  },
  {
    id: "offer-2",
    title: "Alpha concrete",
    secondary: "BID-002 · submitted",
    amount: "€2,000",
    reference: "BID-002",
    inbox: "Sent",
    submitted: "Not submitted",
    revisions: 0,
    statusLabel: "Draft",
    status: "DRAFT",
    statuses: ["DRAFT"],
  },
]

function renderTable(
  overrides: Partial<Parameters<typeof OffersTable>[0]> = {},
) {
  return render(
    <OffersTable
      rows={rows}
      empty="No offers yet"
      labels={labels}
      offerLabel="Bid / offer"
      amountLabel="Amount"
      {...overrides}
    />,
  )
}

describe("OffersTable", () => {
  it("renders expanded columns, the attached footer, sticky actions, and action slots", () => {
    const { container } = renderTable()

    expect(screen.getByText("Bid / offer")).toBeVisible()
    expect(screen.getByText("Amount")).toBeVisible()
    expect(screen.getAllByText("Zulu excavation")).toHaveLength(2)
    expect(screen.getByText("Reference")).toBeVisible()
    expect(screen.getByText("Direction")).toBeVisible()
    expect(screen.getByText("Revisions")).toBeVisible()
    expect(screen.getAllByText("2 total records").length).toBeGreaterThan(0)
    expect(screen.getAllByText("10 rows").length).toBeGreaterThan(0)
    expect(container.querySelector("th.sticky")).toHaveTextContent("Actions")
    expect(
      screen.getAllByRole("button", { name: "Withdraw offer" }),
    ).toHaveLength(2)
  })

  it("filters offers and shows the empty state when no row matches", async () => {
    const user = userEvent.setup()
    renderTable()

    await user.type(
      screen.getByRole("textbox", { name: "Search offers" }),
      "alpha",
    )
    expect(screen.getAllByText("Alpha concrete")).toHaveLength(2)
    expect(screen.queryByText("Zulu excavation")).not.toBeInTheDocument()

    await user.clear(screen.getByRole("textbox", { name: "Search offers" }))
    await user.type(
      screen.getByRole("textbox", { name: "Search offers" }),
      "missing",
    )
    expect(screen.getByText("No offers yet")).toBeVisible()
  })

  it("sorts offers by title", async () => {
    const user = userEvent.setup()
    const { container } = renderTable()

    await user.click(screen.getByRole("combobox", { name: "Sort" }))
    await user.click(screen.getByRole("option", { name: "Title A-Z" }))

    const titles = Array.from(
      container.querySelectorAll<HTMLTableRowElement>("tbody tr"),
    ).map((row) => row.cells[0]?.querySelector("p")?.textContent)
    expect(titles).toEqual(["Alpha concrete", "Zulu excavation"])
  })

  it("paginates ten rows at a time from the attached footer", async () => {
    const user = userEvent.setup()
    const pagedRows = Array.from({ length: 11 }, (_, index) => ({
      ...rows[0],
      id: `offer-${index + 1}`,
      title: `Offer ${String(index + 1).padStart(2, "0")}`,
      reference: `BID-${String(index + 1).padStart(3, "0")}`,
    }))
    const { container } = renderTable({ rows: pagedRows })

    expect(container.querySelectorAll("tbody tr")).toHaveLength(10)
    const next = screen
      .getAllByRole("button", { name: "Next" })
      .find((button) => !button.hasAttribute("disabled"))
    expect(next).toBeDefined()
    await user.click(next!)

    expect(container.querySelectorAll("tbody tr")).toHaveLength(1)
    expect(screen.getAllByText("Offer 11").length).toBeGreaterThan(0)
  })
})
