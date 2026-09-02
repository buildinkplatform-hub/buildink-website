import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import type { PortalBootstrapProfile } from "@/features/dashboard/data/portal-client"
import messages from "@/messages/en"
import { ProfilePageClient } from "./profile-page-client"

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard/profile",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/features/dashboard/actions/portal.actions", () => ({
  updateMeProfileAction: vi.fn(),
  updatePersonaAction: vi.fn(),
  updateVisibilityAction: vi.fn(),
  updateProfileCollectionsAction: vi.fn(),
  deletePortalUploadAction: vi.fn(),
  getPortalUploadDownloadAction: vi.fn(),
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

const profile: PortalBootstrapProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "worker@example.com",
  displayName: "Luca Rossi",
  phone: "+393330001112",
  preferredLocale: "en",
  timezone: "Europe/Rome",
  contactPreference: "platform_only",
  primaryAccountType: "WORKER",
  accountStatus: "ACTIVE",
  onboardingStatus: "COMPLETED",
  verificationStatus: "VERIFIED",
  publicationStatus: "PUBLISHED",
  profileImageAssetId: null,
  version: 3,
  updatedAt: "2026-08-20T10:00:00.000Z",
}

const documents = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    originalName: "identity.pdf",
    documentType: "IDENTITY",
    purpose: "document",
    issuedAt: "2026-01-01",
    expiresAt: "2030-01-01",
    status: "UPLOADED",
    expiryRequired: true,
    expiryMissing: false,
  },
]

const workerPersona = {
  accountType: "WORKER",
  professions: [
    {
      id: "profession-1",
      slug: "electrician",
      translations: { en: "Electrician" },
    },
  ],
  categories: [],
  worker: {
    professionId: "profession-1",
    yearsExperience: 8,
    availability: "Weekdays",
    availabilityStatus: "AVAILABLE",
    availableFrom: "2026-09-01",
    bio: "Residential wiring specialist",
    preferredEmploymentTypes: ["FULL_TIME"],
    preferredWorkArrangement: "ON_SITE",
    willingToTravel: true,
    travelRadiusKm: 60,
    hasOwnTransport: true,
    workPermitCountries: ["IT"],
    expectedPayMinMinor: "2500",
    expectedPayCurrency: "EUR",
    expectedPayInterval: "MONTHLY",
  },
  subcontractor: null,
  serviceProvider: null,
  projectOwner: null,
  regions: [],
}

const subcontractorPersona = {
  ...workerPersona,
  accountType: "SUBCONTRACTOR",
  worker: null,
  subcontractor: {
    primaryCategoryId: "category-1",
    tradingName: "Rossi Facades",
    yearsExperience: 12,
    capabilityStatement: "Facades and roofing",
    availabilityStatus: "LIMITED",
    availableFrom: "2026-10-01",
    maxConcurrentProjects: 3,
    crewSize: 8,
    travelRadiusKm: 120,
    emergencyCallout: true,
  },
}

const serviceProviderPersona = {
  ...workerPersona,
  accountType: "SERVICE_PROVIDER",
  worker: null,
  serviceProvider: {
    providerIdentity: "Studio Tecnico Rossi",
    tradingName: "STR Consulting",
    yearsExperience: 15,
    professionalBackground: "Structural engineering",
    capabilityStatement: "Structural surveys",
    professionalTitle: "Ing.",
    licenceNumber: "IT-1234",
    licenceCountryCode: "IT",
    professionalBody: "Ordine Ingegneri",
    availability: null,
    availabilityStatus: "AVAILABLE",
    availableFrom: null,
    hourlyRateMinMinor: "9000",
    rateCurrency: "EUR",
    remoteServices: true,
  },
}

const projectOwnerPersona = {
  ...workerPersona,
  accountType: "PROJECT_OWNER",
  worker: null,
  projectOwner: {
    background: "Property developer",
    description: "Residential redevelopments",
    organizationName: "Rossi Developments",
    website: "https://rossi.example",
    preferredProjectTypes: [],
    typicalBudgetMinMinor: "5000000",
    typicalBudgetMaxMinor: "50000000",
    budgetCurrency: "EUR",
    acceptsIntroductions: true,
    yearsExperience: 10,
    serviceRegionIds: ["region-1"],
  },
}

function renderProfile(
  overrides: Partial<Parameters<typeof ProfilePageClient>[0]> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProfilePageClient
          profile={profile}
          persona={workerPersona}
          collections={null}
          visibility={null}
          documents={documents}
          {...overrides}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  )
}

describe("ProfilePageClient", () => {
  it("renders tabs with the documents count badge", () => {
    renderProfile()

    expect(
      screen.getByRole("tab", { name: /overview/i, selected: true }),
    ).toBeVisible()
    expect(screen.getByRole("tab", { name: /documents/i })).toHaveTextContent(
      "1",
    )
    expect(screen.getByRole("tab", { name: /visibility/i })).toBeVisible()
  })

  it("shows the account summary captured during onboarding", () => {
    renderProfile()

    expect(screen.getByText("worker@example.com")).toBeVisible()
    expect(screen.getByText("Luca Rossi")).toBeVisible()
    expect(screen.getByText("+393330001112")).toBeVisible()
    expect(screen.getByText("COMPLETED")).toBeVisible()
  })

  it("shows the worker persona entered during onboarding", () => {
    renderProfile()

    expect(screen.getByText("Worker profile")).toBeVisible()
    expect(
      screen.getByDisplayValue("Residential wiring specialist"),
    ).toBeVisible()
    expect(screen.getByDisplayValue("Weekdays")).toBeVisible()
  })

  it("shows the subcontractor persona entered during onboarding", () => {
    renderProfile({ persona: subcontractorPersona })

    expect(screen.getByText("Subcontractor profile")).toBeVisible()
    expect(screen.getByDisplayValue("Rossi Facades")).toBeVisible()
    expect(screen.getByDisplayValue("Facades and roofing")).toBeVisible()
  })

  it("shows the service provider persona entered during onboarding", () => {
    renderProfile({ persona: serviceProviderPersona })

    expect(screen.getByText("Service provider profile")).toBeVisible()
    expect(screen.getByDisplayValue("Studio Tecnico Rossi")).toBeVisible()
    expect(screen.getByDisplayValue("Structural surveys")).toBeVisible()
  })

  it("shows the project owner persona entered during onboarding", () => {
    renderProfile({ persona: projectOwnerPersona })

    expect(screen.getByText("Project owner profile")).toBeVisible()
    expect(screen.getByDisplayValue("Rossi Developments")).toBeVisible()
    expect(screen.getByDisplayValue("https://rossi.example")).toBeVisible()
  })

  it("renders the requested documents tab with view, replace and delete actions", () => {
    renderProfile({ initialTab: "documents" })

    expect(screen.getByText("identity.pdf")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "View identity.pdf" }),
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Replace identity.pdf" }),
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Delete identity.pdf" }),
    ).toBeVisible()
  })

  it("keeps the company persona managed in the workspace note for company accounts", () => {
    renderProfile({
      persona: { ...workerPersona, accountType: "COMPANY", worker: null },
    })

    expect(
      screen.getByText(
        "Company identity is managed in the workspace, not as a personal persona.",
      ),
    ).toBeVisible()
  })
})
