import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { deleteUploadAction } from "@/features/onboarding/actions/onboarding.actions"
import messages from "@/messages/en"
import type { OnboardingDraft } from "@/shared/types/platform"
import { DocumentsForm } from "./documents-form"
import { OnboardingProvider } from "./onboarding-provider"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/features/onboarding/actions/onboarding.actions", () => ({
  deleteUploadAction: vi.fn(),
  getUploadDownloadUrlAction: vi.fn(),
}))

vi.mock("@/features/onboarding/data/upload-file", () => ({
  uploadOnboardingFile: vi.fn(),
}))

const draft: OnboardingDraft = {
  account: {
    name: "Test User",
    email: "test@example.com",
    preferredLocale: "en",
    termsAcceptedAt: "2026-08-10",
    privacyAcceptedAt: "2026-08-10",
    marketing: false,
  },
  profileType: "individual",
  profile: {},
  profileImage: undefined,
  documents: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "identity.pdf",
      size: 1024,
      mimeType: "application/pdf",
      purpose: "document",
      status: "uploaded",
      documentType: "identity",
      expiryDate: "2030-01-01",
      issuingCountry: "IT",
      ownerName: "Test User",
    },
  ],
  consent: { publicProfile: false, documentProcessing: false },
}

describe("DocumentsForm", () => {
  it("opens a fresh metadata form when adding another document", async () => {
    const user = userEvent.setup()
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <OnboardingProvider initialDraft={draft}>
          <DocumentsForm countries={[{ code: "IT", name: "Italy" }]} />
        </OnboardingProvider>
      </NextIntlClientProvider>,
    )

    expect(screen.getByText("identity.pdf")).toBeVisible()
    await user.click(
      screen.getByRole("button", { name: "Add another document" }),
    )

    expect(
      screen.getByRole("heading", { name: "Document details" }),
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: /choose a document file/i }),
    ).toBeVisible()
  })

  it("reopens the document editor after the final document is deleted", async () => {
    const user = userEvent.setup()
    vi.mocked(deleteUploadAction).mockResolvedValue(undefined as never)
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <OnboardingProvider initialDraft={draft}>
          <DocumentsForm countries={[{ code: "IT", name: "Italy" }]} />
        </OnboardingProvider>
      </NextIntlClientProvider>,
    )

    await user.click(
      screen.getByRole("button", { name: "Remove identity.pdf" }),
    )

    expect(
      await screen.findByRole("heading", { name: "Document details" }),
    ).toBeVisible()
    expect(
      screen.queryByText("No documents selected yet."),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
  })
})
