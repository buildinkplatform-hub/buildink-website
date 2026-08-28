import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import {
  deletePortalUploadAction,
  getPortalUploadDownloadAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalDocument } from "@/features/dashboard/data/portal-client"
import messages from "@/messages/en"
import { ProfileDocumentsManager } from "./profile-documents-manager"

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  deletePortalUploadAction: vi.fn(),
  getPortalUploadDownloadAction: vi.fn(),
  createPortalUploadIntentAction: vi.fn(),
  completePortalUploadAction: vi.fn(),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        uploadToSignedUrl: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}))

const identityDocument: PortalDocument = {
  id: "00000000-0000-4000-8000-000000000010",
  originalName: "identity.pdf",
  documentType: "IDENTITY",
  purpose: "document",
  issuedAt: "2026-01-01",
  expiresAt: "2030-01-01",
  status: "UPLOADED",
  expiryRequired: true,
  expiryMissing: false,
}

const licenceDocument: PortalDocument = {
  id: "00000000-0000-4000-8000-000000000011",
  originalName: "licence.pdf",
  documentType: "LICENSE",
  purpose: "document",
  issuedAt: null,
  expiresAt: null,
  status: "AWAITING_REVIEW",
  expiryRequired: true,
  expiryMissing: true,
}

function renderManager(documents: PortalDocument[] = [identityDocument]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ProfileDocumentsManager documents={documents} />
    </NextIntlClientProvider>,
  )
}

async function confirmDelete(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await screen.findByRole("dialog")
  await user.click(within(dialog).getByRole("button", { name: "Delete" }))
}

describe("ProfileDocumentsManager", () => {
  it("lists onboarding documents with type and status", () => {
    renderManager()

    expect(screen.getByText("identity.pdf")).toBeVisible()
    expect(screen.getByText("Identity document")).toBeVisible()
    expect(screen.getByText("uploaded")).toBeVisible()
    expect(screen.getByText("Expires 2030-01-01")).toBeVisible()
  })

  it("flags documents that are missing a required expiry date", () => {
    renderManager([licenceDocument])

    expect(screen.getByText("Expiry date required")).toBeVisible()
  })

  it("opens the secure preview dialog for a document", async () => {
    const user = userEvent.setup()
    vi.mocked(getPortalUploadDownloadAction).mockResolvedValue({
      ok: true as const,
      file: {
        url: "https://storage.example/identity.pdf",
        name: "identity.pdf",
        mimeType: "application/pdf",
        expiresInSeconds: 300,
      },
    })
    renderManager()

    await user.click(screen.getByRole("button", { name: "View identity.pdf" }))

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toBeVisible()
    expect(within(dialog).getByTitle("identity.pdf")).toHaveAttribute(
      "src",
      "https://storage.example/identity.pdf",
    )
  })

  it("removes a document after a successful delete", async () => {
    const user = userEvent.setup()
    vi.mocked(deletePortalUploadAction).mockResolvedValue({
      ok: true as const,
    })
    renderManager()

    await user.click(
      screen.getByRole("button", { name: "Delete identity.pdf" }),
    )
    await confirmDelete(user)

    expect(screen.queryByText("identity.pdf")).not.toBeInTheDocument()
    expect(
      screen.getByText("No verification documents uploaded yet."),
    ).toBeVisible()
  })

  it("keeps the document when the delete API rejects it", async () => {
    const user = userEvent.setup()
    vi.mocked(deletePortalUploadAction).mockResolvedValue({
      ok: false as const,
      code: "UPLOAD_NOT_FOUND",
      message: "The upload was not found or is locked",
    })
    renderManager()

    await user.click(
      screen.getByRole("button", { name: "Delete identity.pdf" }),
    )
    await confirmDelete(user)

    expect(screen.getByText("identity.pdf")).toBeInTheDocument()
    expect(
      await screen.findByText("The upload was not found or is locked"),
    ).toBeVisible()
  })

  it("pre-fills the replace editor with the current document metadata", async () => {
    const user = userEvent.setup()
    renderManager()

    await user.click(
      screen.getByRole("button", { name: "Replace identity.pdf" }),
    )

    expect(screen.getByText("Replace document")).toBeVisible()
    expect(screen.getByText("identity.pdf")).toBeInTheDocument()
  })
})
