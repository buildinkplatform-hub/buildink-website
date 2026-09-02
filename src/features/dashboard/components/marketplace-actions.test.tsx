import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "@/messages/en"
import { OfferDecisionActions } from "./marketplace-actions"

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  decideWorkspaceApplicationAction: vi.fn(),
  decideWorkspaceOfferAction: vi.fn(),
  requestWorkspaceOfferChangesAction: vi.fn(),
  shortlistWorkspaceOfferAction: vi.fn(),
  withdrawPortalOfferAction: vi.fn(),
  withdrawPortalApplicationAction: vi.fn(),
  stageWorkspaceApplicationAction: vi.fn(),
  sendPortalMessageAction: vi.fn(),
}))

vi.mock("@/features/dashboard/query/use-portal-mutation", () => ({
  usePortalMutationRunner: () => vi.fn(),
}))

function renderActions(status: string) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <OfferDecisionActions
        companyId="company-1"
        id="offer-1"
        version={2}
        status={status}
        acceptLabel="Accept"
        rejectLabel="Reject"
        requestChangesLabel="Request changes"
        shortlistLabel="Shortlist"
      />
    </NextIntlClientProvider>,
  )
}

describe("OfferDecisionActions", () => {
  it("renders no decision controls for accepted offers", () => {
    const { container } = renderActions("ACCEPTED")

    expect(container).toBeEmptyDOMElement()
  })

  it("does not expose Shortlist again for an already shortlisted offer", () => {
    renderActions("SHORTLISTED")

    expect(screen.getByRole("button", { name: "Accept" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Reject" })).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Request changes" }),
    ).toBeVisible()
    expect(screen.queryByRole("button", { name: "Shortlist" })).toBeNull()
  })

  it("does not expose Request changes again after changes were already requested", () => {
    renderActions("CHANGES_REQUESTED")

    expect(screen.getByRole("button", { name: "Accept" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Reject" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Shortlist" })).toBeVisible()
    expect(screen.queryByRole("button", { name: "Request changes" })).toBeNull()
  })
})
