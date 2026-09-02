import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCatalogueAction,
  updateCatalogueItemAction,
} from "@/features/dashboard/actions/portal.actions"
import messages from "@/messages/en"
import { CatalogueForm } from "./catalogue-form"

const push = vi.fn()
const refresh = vi.fn()

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
  useRouter: () => ({ push, refresh }),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  createCatalogueAction: vi.fn(),
  updateCatalogueItemAction: vi.fn(),
}))

function provider(children: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe("CatalogueForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates an offering without presenting the operation as a draft lifecycle", async () => {
    vi.mocked(createCatalogueAction).mockResolvedValue({
      ok: true,
      data: { id: "catalogue-1", version: 1 },
    } as never)

    render(
      provider(
        <CatalogueForm mode="create" companyId="company-1" categories={[]} />,
      ),
    )

    expect(screen.queryByText("Save draft")).toBeNull()
    expect(screen.getByLabelText(/^Offering type/)).toHaveValue("product")
    fireEvent.change(screen.getByLabelText(/^Name/), {
      target: { value: "Structural cement" },
    })
    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "CEM-42" },
    })
    fireEvent.change(screen.getByLabelText("Unit of measure"), {
      target: { value: "bag" },
    })
    fireEvent.change(screen.getByLabelText("Minimum order quantity"), {
      target: { value: "40" },
    })
    fireEvent.change(screen.getByLabelText("Lead time (days)"), {
      target: { value: "5" },
    })

    fireEvent.click(
      screen.getByRole("button", { name: "Add catalogue offering" }),
    )

    await waitFor(() => {
      expect(createCatalogueAction).toHaveBeenCalledWith(
        "company-1",
        expect.objectContaining({
          name: "Structural cement",
          offeringType: "product",
          sku: "CEM-42",
          unitOfMeasure: "bag",
          moq: 40,
          leadTimeDays: 5,
          priceOnRequest: true,
          indicativePriceMinor: null,
          currency: null,
        }),
        expect.any(String),
      )
    })
    expect(push).toHaveBeenCalledWith("/dashboard/catalogue/catalogue-1")
  })

  it("preserves priced catalogue fields in minor units and currency", async () => {
    vi.mocked(updateCatalogueItemAction).mockResolvedValue({
      ok: true,
    } as never)

    render(
      provider(
        <CatalogueForm
          mode="edit"
          companyId="company-1"
          categories={[]}
          initial={{
            id: "catalogue-1",
            version: 1,
            name: "Structural cement",
            offeringType: "product",
            description: "Bagged cement",
            categoryId: null,
            sku: "CEM-42",
            unitOfMeasure: "bag",
            moq: 40,
            leadTimeDays: 5,
            priceOnRequest: false,
            indicativePriceMinor: "12500",
            currency: "EUR",
          }}
        />,
      ),
    )

    expect(screen.getByLabelText("SKU")).toHaveValue("CEM-42")
    expect(screen.getByLabelText("Unit of measure")).toHaveValue("bag")
    expect(screen.getByLabelText("Minimum order quantity")).toHaveValue(40)
    expect(screen.getByLabelText("Lead time (days)")).toHaveValue(5)
    expect(
      screen.getByRole("checkbox", { name: "Price on request" }),
    ).not.toBeChecked()
    expect(screen.getByLabelText(/^Indicative price/)).toHaveValue("125.00")
    expect(screen.getByLabelText(/^Currency/)).toHaveValue("EUR")

    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "CEM-42-REV" },
    })
    fireEvent.change(screen.getByLabelText(/^Indicative price/), {
      target: { value: "149.95" },
    })
    fireEvent.change(screen.getByLabelText(/^Currency/), {
      target: { value: "gbp" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() => {
      expect(updateCatalogueItemAction).toHaveBeenCalledWith(
        "company-1",
        "catalogue-1",
        expect.objectContaining({
          name: "Structural cement",
          description: "Bagged cement",
          sku: "CEM-42-REV",
          unitOfMeasure: "bag",
          moq: 40,
          leadTimeDays: 5,
          priceOnRequest: false,
          indicativePriceMinor: "14995",
          currency: "GBP",
        }),
        1,
      )
    })
    expect(refresh).toHaveBeenCalled()
  })
})
