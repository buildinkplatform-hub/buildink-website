import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  submitOfferAction,
  updateOfferDraftAction,
} from "@/features/dashboard/actions/portal.actions"
import messages from "@/messages/en"
import { OfferDraftEditForm } from "./offer-draft-edit-form"

const push = vi.fn()
const refresh = vi.fn()

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  submitOfferAction: vi.fn(),
  updateOfferDraftAction: vi.fn(),
}))

const offer = {
  id: "offer-1",
  version: 2,
  status: "DRAFT",
  targetTitle: "Community library renovation",
  title: null,
  reference: "OFF-001",
  proposedPriceMinor: "250000",
  currency: "EUR",
  proposedDurationDays: 14,
  coverMessage: "Initial notes",
}

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <OfferDraftEditForm offer={offer} />
    </NextIntlClientProvider>,
  )
}

describe("OfferDraftEditForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the backend draft-save failure instead of silently failing", async () => {
    vi.mocked(updateOfferDraftAction).mockResolvedValue({
      ok: false,
      code: "VERSION_CONFLICT",
      message: "This offer changed in another session.",
    })

    renderForm()
    fireEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(
      await screen.findByText("This offer changed in another session."),
    ).toBeInTheDocument()
    expect(submitOfferAction).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it("saves the latest draft version before submit and returns to the offers board", async () => {
    vi.mocked(updateOfferDraftAction).mockResolvedValue({
      ok: true,
      offer: { id: offer.id, version: 3 },
    } as never)
    vi.mocked(submitOfferAction).mockResolvedValue({
      ok: true,
      offer: { id: offer.id, version: 4 },
    } as never)

    renderForm()
    fireEvent.change(screen.getByLabelText(/^Currency/), {
      target: { value: "gbp" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Submit offer" }))

    await waitFor(() => {
      expect(updateOfferDraftAction).toHaveBeenCalledWith(
        offer.id,
        expect.objectContaining({ currency: "GBP" }),
        2,
      )
    })
    expect(submitOfferAction).toHaveBeenCalledWith(offer.id, 3)
    expect(push).toHaveBeenCalledWith("/dashboard/offers")
    expect(refresh).toHaveBeenCalled()
  })
})
