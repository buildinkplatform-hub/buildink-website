import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { OfferActionsMenu } from "./offer-actions-menu"

const runMutation = vi.hoisted(() => vi.fn())

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  decideWorkspaceOfferAction: vi.fn(),
  requestWorkspaceOfferChangesAction: vi.fn(),
  shortlistWorkspaceOfferAction: vi.fn(),
  withdrawPortalOfferAction: vi.fn(),
}))

vi.mock("@/features/dashboard/query/use-portal-mutation", () => ({
  usePortalMutationRunner: () => runMutation,
}))

const labels = {
  actions: "Actions",
  details: "View details",
  editDraft: "Edit draft",
  accept: "Accept",
  reject: "Reject",
  requestChanges: "Request changes",
  shortlist: "Shortlist",
  withdraw: "Withdraw",
  cancel: "Cancel",
}

beforeEach(() => {
  runMutation.mockReset()
})

async function openBuyerMenu(status: string) {
  const user = userEvent.setup()
  render(
    <OfferActionsMenu
      mode="buyer"
      companyId="company-1"
      id="offer-1"
      version={2}
      status={status}
      viewHref="/dashboard/offers/offer-1"
      labels={labels}
    />,
  )
  await user.click(screen.getByRole("button", { name: "Actions" }))
}

describe("OfferActionsMenu buyer decision boundary", () => {
  it("shows only the detail action for an accepted offer", async () => {
    await openBuyerMenu("ACCEPTED")

    expect(screen.getByRole("link", { name: /View details/ })).toBeVisible()
    expect(screen.queryByRole("menuitem", { name: /Accept/ })).toBeNull()
    expect(screen.queryByRole("menuitem", { name: /Reject/ })).toBeNull()
    expect(
      screen.queryByRole("menuitem", { name: /Request changes/ }),
    ).toBeNull()
    expect(screen.queryByRole("menuitem", { name: /Shortlist/ })).toBeNull()
  })

  it("does not offer Shortlist again for a shortlisted offer", async () => {
    await openBuyerMenu("SHORTLISTED")

    expect(screen.getByRole("menuitem", { name: /Accept/ })).toBeVisible()
    expect(screen.getByRole("menuitem", { name: /Reject/ })).toBeVisible()
    expect(
      screen.getByRole("menuitem", { name: /Request changes/ }),
    ).toBeVisible()
    expect(screen.queryByRole("menuitem", { name: /Shortlist/ })).toBeNull()
  })

  it("does not request changes again while awaiting a revision", async () => {
    await openBuyerMenu("CHANGES_REQUESTED")

    expect(screen.getByRole("menuitem", { name: /Accept/ })).toBeVisible()
    expect(screen.getByRole("menuitem", { name: /Reject/ })).toBeVisible()
    expect(screen.getByRole("menuitem", { name: /Shortlist/ })).toBeVisible()
    expect(
      screen.queryByRole("menuitem", { name: /Request changes/ }),
    ).toBeNull()
  })
})

describe("OfferActionsMenu bidder freshness", () => {
  it("removes edit and withdraw actions after a successful withdrawal", async () => {
    const user = userEvent.setup()
    runMutation.mockResolvedValue({ ok: true })

    render(
      <OfferActionsMenu
        mode="bidder"
        id="offer-1"
        version={2}
        status="DRAFT"
        viewHref="/dashboard/offers/offer-1"
        editHref="/dashboard/offers/offer-1/edit"
        labels={labels}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(screen.getByRole("link", { name: "Edit draft" })).toBeVisible()
    await user.click(screen.getByRole("menuitem", { name: "Withdraw" }))
    await user.click(screen.getByRole("button", { name: /^Withdraw$/ }))

    expect(runMutation).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(screen.getByRole("link", { name: /View details/ })).toBeVisible()
    expect(screen.queryByRole("link", { name: "Edit draft" })).toBeNull()
    expect(screen.queryByRole("menuitem", { name: "Withdraw" })).toBeNull()
  })
})
