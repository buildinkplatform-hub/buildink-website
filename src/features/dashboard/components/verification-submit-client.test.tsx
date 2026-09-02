import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("explains blocked submission states", () => {
    renderSubmit({ disabledReasons: ["Upload at least one document."] })

    const blockedStatus = screen.getByRole("status")
    expect(blockedStatus).toHaveTextContent(
      "Verification cannot be submitted yet",
    )
    expect(blockedStatus).toHaveTextContent("Upload at least one document.")
    expect(
      screen.getByRole("button", { name: "Submit verification" }),
    ).toBeDisabled()
  })

  it("gives the reviewer notes field an explicit accessible label", () => {
    renderSubmit()

    expect(
      screen.getByRole("textbox", { name: "Optional notes for the reviewer" }),
    ).toBeVisible()
  })

  it("shows backend submission errors and does not refresh stale state", async () => {
    const user = userEvent.setup()
    vi.mocked(submitVerificationAction).mockResolvedValue({
      ok: false as const,
      code: "VERIFICATION_SUBMIT_FAILED",
      message: "The verification request could not be submitted.",
    })
    renderSubmit()

    await user.click(
      screen.getByRole("button", { name: "Submit verification" }),
    )

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(
      "The verification request could not be submitted.",
    )
    expect(refresh).not.toHaveBeenCalled()
  })

  it("submits selected documents and refreshes the route", async () => {
    const user = userEvent.setup()
    vi.mocked(submitVerificationAction).mockResolvedValue({
      ok: true as const,
    })
    renderSubmit()

    await user.type(
      screen.getByRole("textbox", { name: "Optional notes for the reviewer" }),
      "All files are current.",
    )
    await user.click(
      screen.getByRole("button", { name: "Submit verification" }),
    )

    expect(submitVerificationAction).toHaveBeenCalledWith({
      documentAssetIds: ["asset-1", "asset-2"],
      applicantNotes: "All files are current.",
    })
    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Verification submitted.")
    expect(refresh).toHaveBeenCalled()
  })
})
