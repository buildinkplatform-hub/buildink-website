import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AssetPreviewDialog } from "./asset-preview-dialog"

vi.mock("@/features/onboarding/actions/onboarding.actions", () => ({
  getUploadDownloadUrlAction: vi.fn(),
}))

const labels = {
  preview: "File preview",
  loading: "Loading secure preview...",
  failed: "Preview failed",
  openNewTab: "Open full view",
  close: "Close preview",
}

describe("AssetPreviewDialog", () => {
  it("renders an uploaded image in a full-screen preview", () => {
    render(
      <AssetPreviewDialog
        asset={{
          id: "asset-1",
          name: "profile.png",
          size: 100,
          mimeType: "image/png",
        }}
        open
        onOpenChange={() => undefined}
        localUrl="https://example.test/profile.png"
        labels={labels}
      />,
    )

    expect(screen.getByRole("dialog")).toBeVisible()
    expect(screen.getByRole("img", { name: "profile.png" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Open full view" })).toHaveAttribute(
      "href",
      "https://example.test/profile.png",
    )
  })

  it("embeds an uploaded PDF in the preview", () => {
    render(
      <AssetPreviewDialog
        asset={{
          id: "asset-2",
          name: "certificate.pdf",
          size: 200,
          mimeType: "application/pdf",
        }}
        open
        onOpenChange={() => undefined}
        localUrl="https://example.test/certificate.pdf"
        labels={labels}
      />,
    )

    expect(screen.getByTitle("certificate.pdf")).toHaveAttribute(
      "src",
      "https://example.test/certificate.pdf",
    )
  })
})
