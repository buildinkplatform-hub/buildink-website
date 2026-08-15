import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { saveProfileTypeAction } from "@/features/onboarding/actions/onboarding.actions"
import messages from "@/messages/en"
import type { OnboardingDraft } from "@/shared/types/platform"
import { OnboardingProvider } from "./onboarding-provider"
import { RoleSelection } from "./role-selection"

const push = vi.fn()

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => (
    <a href={String(href)} {...props} />
  ),
  useRouter: () => ({ push }),
}))

vi.mock("@/features/onboarding/actions/onboarding.actions", () => ({
  saveProfileTypeAction: vi.fn(),
}))

function draft(overrides: Partial<OnboardingDraft> = {}): OnboardingDraft {
  return {
    account: {
      name: "Test User",
      email: "test@example.com",
      preferredLocale: "en",
      termsAcceptedAt: "2026-08-10",
      privacyAcceptedAt: "2026-08-10",
      marketing: false,
    },
    profile: {},
    documents: [],
    consent: {
      publicProfile: false,
      documentProcessing: false,
      terms: false,
      privacy: false,
    },
    ...overrides,
  }
}

function renderRoleSelection(initialDraft: OnboardingDraft) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <OnboardingProvider initialDraft={initialDraft}>
        <RoleSelection />
      </OnboardingProvider>
    </NextIntlClientProvider>,
  )
}

describe("RoleSelection", () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(saveProfileTypeAction).mockReset()
  })

  it("shows the five current account types and hides legacy profile types", () => {
    renderRoleSelection(draft())

    expect(screen.getByRole("button", { name: /^Company/ })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^Project owner/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^Subcontractor/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^Service Provider/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Worker/ })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Individual/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Supplier Contact/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Contractor")).not.toBeInTheDocument()
  })

  it("saves the selected account type", async () => {
    const user = userEvent.setup()
    vi.mocked(saveProfileTypeAction).mockResolvedValue({
      success: true,
      draft: {
        id: "draft-1",
        currentStep: "profile",
        profileType: "contractor",
        primaryAccountType: "COMPANY",
        payload: {},
        version: 2,
        assets: [],
      },
    })
    renderRoleSelection(draft())

    await user.click(screen.getByRole("button", { name: /^Company/ }))
    await user.click(screen.getByRole("button", { name: /^Continue$/i }))

    expect(saveProfileTypeAction).toHaveBeenCalledWith("COMPANY", undefined, undefined)
    expect(push).toHaveBeenCalledWith("/onboarding/profile")
  })

  it("locks the invited account type mapped from a legacy profile type", () => {
    renderRoleSelection(
      draft({
        profileType: "supplier_contact",
        primaryAccountType: "COMPANY",
      }),
    )

    expect(screen.getByRole("button", { name: /^Company/ })).toBeEnabled()
    expect(screen.getByRole("button", { name: /^Project owner/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^Worker/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^Subcontractor/ })).toBeDisabled()
    expect(
      screen.getByRole("button", { name: /^Service Provider/ }),
    ).toBeDisabled()
  })
})
