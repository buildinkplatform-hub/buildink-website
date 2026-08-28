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

    expect(saveProfileTypeAction).toHaveBeenCalledWith(
      "COMPANY",
      undefined,
      undefined,
    )
    expect(push).toHaveBeenCalledWith("/onboarding/profile")
  })

  it("does not preselect a previously saved account type", () => {
    renderRoleSelection(
      draft({
        profileType: "supplier_contact",
        primaryAccountType: "COMPANY",
      }),
    )

    expect(screen.getByRole("button", { name: /^Company/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
    expect(
      screen.getByRole("button", { name: /^Project owner/ }),
    ).toHaveAttribute("aria-pressed", "false")
  })

  it("allows changing away from a previously saved account type", async () => {
    const user = userEvent.setup()
    vi.mocked(saveProfileTypeAction).mockResolvedValue({
      success: true,
      draft: {
        id: "draft-1",
        currentStep: "profile",
        profileType: "worker",
        primaryAccountType: "WORKER",
        payload: {},
        version: 2,
        assets: [],
      },
    })

    renderRoleSelection(
      draft({
        profileType: "supplier_contact",
        primaryAccountType: "COMPANY",
      }),
    )

    await user.click(screen.getByRole("button", { name: /^Worker/ }))
    await user.click(screen.getByRole("button", { name: /^Continue$/i }))

    expect(saveProfileTypeAction).toHaveBeenCalledWith(
      "WORKER",
      undefined,
      "supplier_contact",
    )
    expect(push).toHaveBeenCalledWith("/onboarding/profile")
  })

  it("shows a save error instead of a selection error when saving fails", async () => {
    const user = userEvent.setup()
    vi.mocked(saveProfileTypeAction).mockResolvedValue({ success: false })
    renderRoleSelection(draft())

    await user.click(screen.getByRole("button", { name: /^Company/ }))
    await user.click(screen.getByRole("button", { name: /^Continue$/i }))

    expect(
      screen.getByText("We couldn't save your account type. Please try again."),
    ).toBeInTheDocument()
    expect(
      screen.queryByText("Choose an account type to continue."),
    ).not.toBeInTheDocument()
  })
})
