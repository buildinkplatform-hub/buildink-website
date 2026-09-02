import { act, fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createOfferAction,
  submitOfferAction,
} from "@/features/dashboard/actions/portal.actions"
import messages from "@/messages/en"
import { OfferCreateForm } from "./marketplace-create"

const navigation = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: vi.fn() }),
}))

vi.mock("@/features/dashboard/components/attachment-upload", () => ({
  AttachmentUpload: () => null,
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  createApplicationAction: vi.fn(),
  createOfferAction: vi.fn(),
  submitApplicationAction: vi.fn(),
  submitOfferAction: vi.fn(),
  updateApplicationDraftAction: vi.fn(),
  updateOfferDraftAction: vi.fn(),
}))

const tenderId = "77777777-7777-4777-8777-777777777777"

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe("OfferCreateForm tender context", () => {
  it("preselects the tender, autosaves its draft, and leaves create after one successful submit", async () => {
    vi.useFakeTimers()
    vi.mocked(createOfferAction).mockResolvedValue({
      ok: true,
      offer: { id: "draft-offer", version: 1 },
    } as never)
    vi.mocked(submitOfferAction).mockResolvedValue({
      ok: true,
      offer: { id: "draft-offer", version: 2 },
    } as never)

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <OfferCreateForm
          opportunities={[]}
          packages={[]}
          lots={[]}
          tenders={[
            {
              id: tenderId,
              kind: "tender",
              title: "Community library renovation",
              currency: "EUR",
            },
          ]}
          initialTarget={`tender:${tenderId}`}
        />
      </NextIntlClientProvider>,
    )

    expect(
      screen.getByRole("combobox", { name: "Choose a target" }),
    ).toHaveTextContent("Community library renovation")
    const submit = screen.getByRole("button", { name: "Submit offer" })
    expect(submit).toBeEnabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })
    expect(createOfferAction).not.toHaveBeenCalled()

    const currency = screen.getByLabelText(/^Currency/)
    expect(currency).toHaveValue("EUR")
    fireEvent.change(currency, { target: { value: "gbp" } })
    expect(currency).toHaveValue("GBP")

    fireEvent.change(screen.getByLabelText(/^Price \(EUR\)/), {
      target: { value: "2500" },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900)
    })

    expect(createOfferAction).toHaveBeenCalledWith(
      expect.objectContaining({
        tenderId,
        submit: false,
        currency: "GBP",
        proposedPriceMinor: "250000",
      }),
      expect.any(String),
    )

    await act(async () => {
      fireEvent.click(submit)
      await Promise.resolve()
    })

    expect(submitOfferAction).toHaveBeenCalledWith("draft-offer", 1)
    expect(navigation.push).toHaveBeenCalledWith("/dashboard/offers")
    expect(submit).toBeDisabled()

    fireEvent.click(submit)
    expect(submitOfferAction).toHaveBeenCalledTimes(1)
  })
})
