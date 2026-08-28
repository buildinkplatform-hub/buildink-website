import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import { submitVerificationAction } from "@/features/dashboard/actions/portal.actions"
import messages from "@/messages/en"
import { VerificationSubmitClient } from "./verification-submit-client"

const refresh = vi.fn()

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  submitVerificationAction: vi.fn(),
}))

function renderSubmit(
  props: Partial<Parameters<typeof VerificationSubmitClient>[0]> = {},
) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <VerificationSubmitClient
        documentIds={["asset-1", "asset-2"]}
        fulfilledRequiredCount={1}
        issueCount={0}
        requiredCount={1}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

describe("VerificationSubmitClient", () => {
  it("explains blocked submission states", () => {
    renderSubmit({ disabledReasons: ["Upload at least one document."] })

    expect(
      screen.getByText("Verification cannot be submitted yet"),
    ).toBeVisible()
    expect(screen.getByText("Upload at least one document.")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Submit verification" }),
    ).toBeDisabled()
  })

  it("submits selected documents and refreshes the route", async () => {
    const user = userEvent.setup()
    vi.mocked(submitVerificationAction).mockResolvedValue({
      ok: true as const,
    })
    renderSubmit()

    await user.type(
      screen.getByPlaceholderText("Optional notes for the reviewer"),
      "All files are current.",
    )
    await user.click(
      screen.getByRole("button", { name: "Submit verification" }),
    )

    expect(submitVerificationAction).toHaveBeenCalledWith({
      documentAssetIds: ["asset-1", "asset-2"],
      applicantNotes: "All files are current.",
    })
    expect(await screen.findByText("Verification submitted.")).toBeVisible()
    expect(refresh).toHaveBeenCalled()
  })
})
