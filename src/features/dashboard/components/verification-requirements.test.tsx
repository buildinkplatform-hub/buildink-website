import { render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import messages from "@/messages/en"
import { VerificationRequirements } from "./verification-requirements"

describe("VerificationRequirements", () => {
  it("renders Service Provider requirements with customer-facing requiredness", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VerificationRequirements
          requirements={[
            {
              documentType: "identity",
              required: true,
              expiryRequired: true,
              uploaded: false,
            },
            {
              documentType: "professional_proof",
              required: true,
              expiryRequired: false,
              uploaded: false,
            },
            {
              documentType: "license",
              required: true,
              expiryRequired: true,
              uploaded: false,
            },
          ]}
        />
      </NextIntlClientProvider>,
    )

    expect(screen.getByText("Identity document")).toBeVisible()
    expect(screen.getByText("Professional proof")).toBeVisible()
    expect(screen.getByText("License")).toBeVisible()
    expect(screen.queryByText(/^id$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^pr$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^li$/i)).not.toBeInTheDocument()

    const professionalProof = document.querySelector<HTMLElement>(
      '[data-document-type="professional_proof"]',
    )
    expect(professionalProof).not.toBeNull()
    expect(within(professionalProof!).getByText("Required")).toBeVisible()
    expect(
      within(professionalProof!).queryByText("Optional"),
    ).not.toBeInTheDocument()

    const identity = document.querySelector<HTMLElement>(
      '[data-document-type="identity"]',
    )
    expect(identity).not.toBeNull()
    expect(
      within(identity!).getByText("Required · Expiry date required"),
    ).toBeVisible()
  })
})
