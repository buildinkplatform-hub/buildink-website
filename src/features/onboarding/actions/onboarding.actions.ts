"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { backendApi } from "@/lib/backend/api"
import { isLocale, isProfileType } from "@/shared/constants/platform"
import type { Locale, OnboardingCatalog, OnboardingDraft, ProfileType } from "@/shared/types/platform"

interface BackendDraft {
  id: string
  currentStep: string
  profileType: ProfileType | null
  payload: Record<string, unknown>
  version: number
  assets: Array<{
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    purpose: "profile_image" | "portfolio" | "document"
    documentType: string | null
    ownerName?: string | null
    issuingCountry?: string | null
    expiresAt?: string | null
    status: string
  }>
}

const fallbackCatalog: OnboardingCatalog = {
  countries: [
    { code: "AE", name: "United Arab Emirates" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "GB", name: "United Kingdom" },
    { code: "IT", name: "Italy" },
    { code: "PK", name: "Pakistan" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "US", name: "United States" },
  ],
  categories: [
    {
      id: "construction",
      slug: "construction",
      label: "Construction",
      parentId: null,
      children: [
        {
          id: "general-contracting",
          slug: "general-contracting",
          label: "General contracting",
          parentId: "construction",
          children: [],
        },
        {
          id: "masonry-concrete",
          slug: "masonry-concrete",
          label: "Masonry and concrete",
          parentId: "construction",
          children: [],
        },
        {
          id: "roofing-facades",
          slug: "roofing-facades",
          label: "Roofing and facades",
          parentId: "construction",
          children: [],
        },
      ],
    },
    {
      id: "building-services",
      slug: "building-services",
      label: "Building services",
      parentId: null,
      children: [
        {
          id: "electrical",
          slug: "electrical",
          label: "Electrical",
          parentId: "building-services",
          children: [],
        },
        {
          id: "plumbing",
          slug: "plumbing",
          label: "Plumbing",
          parentId: "building-services",
          children: [],
        },
        {
          id: "hvac",
          slug: "hvac",
          label: "HVAC",
          parentId: "building-services",
          children: [],
        },
      ],
    },
    {
      id: "materials-supply",
      slug: "materials-supply",
      label: "Materials supply",
      parentId: null,
      children: [
        {
          id: "cement-aggregates",
          slug: "cement-aggregates",
          label: "Cement and aggregates",
          parentId: "materials-supply",
          children: [],
        },
        {
          id: "steel-metals",
          slug: "steel-metals",
          label: "Steel and metals",
          parentId: "materials-supply",
          children: [],
        },
        {
          id: "finishes-fixtures",
          slug: "finishes-fixtures",
          label: "Finishes and fixtures",
          parentId: "materials-supply",
          children: [],
        },
      ],
    },
  ],
}

export async function getOnboardingDraftAction(account: OnboardingDraft["account"]): Promise<OnboardingDraft> {
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/draft")
  return mapDraft(draft, account)
}

export async function getOnboardingCatalogAction(locale: Locale): Promise<OnboardingCatalog> {
  if (!isLocale(locale)) return { countries: [], categories: [] }
  try {
    const catalog = await backendApi<OnboardingCatalog>(
      `/api/v1/onboarding/catalog?locale=${locale}`,
    )
    return {
      countries: catalog.countries.length
        ? catalog.countries
        : fallbackCatalog.countries,
      categories: catalog.categories.length
        ? catalog.categories
        : fallbackCatalog.categories,
    }
  } catch {
    return fallbackCatalog
  }
}

export async function saveProfileTypeAction(profileType: ProfileType, version?: number) {
  if (!isProfileType(profileType)) return { success: false as const }
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/profile-type", {
    method: "PUT",
    body: JSON.stringify({ profileType, version }),
  })
  return { success: true as const, draft }
}

export async function saveProfileAction(profileType: ProfileType, profile: Record<string, unknown>, version?: number) {
  if (!isProfileType(profileType)) return { success: false as const }
  const normalized = normalizeProfile(profileType, profile)
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/profile", {
    method: "PUT",
    body: JSON.stringify({ profile: normalized, version }),
  })
  if (profileType === "supplier_contact") {
    const mode = String(profile.organizationMode ?? "create")
    const association = mode === "create"
      ? {
          mode: "create",
          company: {
            name: String(profile.supplierName ?? ""),
            vatNumber: String(profile.vatNumber ?? "") || undefined,
            companyType: "supplier",
            description: String(profile.businessDescription ?? ""),
          },
        }
      : null
    if (association) {
      await backendApi("/api/v1/onboarding/company-association", {
        method: "PUT",
        body: JSON.stringify({ association }),
      })
    }
  }
  return { success: true as const, draft }
}

export async function saveConsentsAction(locale: Locale, documentProcessing: boolean, marketing: boolean, version?: number) {
  if (!isLocale(locale) || !documentProcessing) return { success: false as const }
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/consents", {
    method: "PUT",
    body: JSON.stringify({
      version,
      consents: {
        locale,
        terms: { accepted: true, version: "2026-08-08" },
        privacy: { accepted: true, version: "2026-08-08" },
        documentProcessing: { accepted: true, version: "2026-08-08" },
        marketing: { accepted: marketing, version: "2026-08-08" },
      },
    }),
  })
  return { success: true as const, draft }
}

export async function createUploadIntentAction(input: Record<string, unknown>) {
  return backendApi<{
    assetId: string
    bucket: string
    signedUrl: string
    token: string
    path: string
    expiresAt: string
  }>("/api/v1/onboarding/uploads/intents", { method: "POST", body: JSON.stringify(input) })
}

export async function completeUploadAction(assetId: string) {
  return backendApi(`/api/v1/onboarding/uploads/${assetId}/complete`, { method: "POST" })
}

export async function getUploadDownloadUrlAction(assetId: string) {
  const validAssetId = z.string().uuid().parse(assetId)
  return backendApi<{
    url: string
    name: string
    mimeType: string
    expiresInSeconds: number
  }>(`/api/v1/onboarding/uploads/${validAssetId}/download`)
}

export async function deleteUploadAction(assetId: string) {
  return backendApi(`/api/v1/onboarding/uploads/${assetId}`, { method: "DELETE" })
}

export async function submitOnboardingAction(locale: Locale, version?: number) {
  if (!isLocale(locale)) return { success: false as const }
  await backendApi("/api/v1/onboarding/submit", { method: "POST", body: JSON.stringify({ version }) })
  redirect(`/${locale}/onboarding/pending`)
}

function normalizeProfile(profileType: ProfileType, profile: Record<string, unknown>) {
  const result: Record<string, unknown> = {
    ...profile,
    country: String(profile.country ?? "IT").toUpperCase().slice(0, 2),
  }
  for (const key of ["interests", "skills", "languages", "categories", "serviceRegions"]) {
    if (typeof result[key] === "string") result[key] = result[key].split(",").map((value) => value.trim()).filter(Boolean)
  }
  delete result.organizationMode
  if (profileType !== "individual") delete result.profileVisibility
  return result
}

function mapDraft(draft: BackendDraft, account: OnboardingDraft["account"]): OnboardingDraft {
  const payload = draft.payload ?? {}
  const profileImage = draft.assets.find((asset) => asset.purpose === "profile_image")
  const storedProfile = (payload.profile as Record<string, unknown> | undefined) ?? {}
  return {
    id: draft.id,
    version: draft.version,
    currentStep: draft.currentStep,
    account,
    profileType: draft.profileType ?? undefined,
    profile: Object.fromEntries(
      Object.entries(storedProfile).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : value,
      ]),
    ),
    profileImage: profileImage ? { id: profileImage.id, name: profileImage.originalName, size: profileImage.sizeBytes, mimeType: profileImage.mimeType, purpose: profileImage.purpose, status: profileImage.status } : undefined,
    documents: draft.assets.filter((asset) => asset.purpose === "document").map((asset) => ({
      id: asset.id,
      name: asset.originalName,
      size: asset.sizeBytes,
      mimeType: asset.mimeType,
      purpose: asset.purpose,
      status: asset.status,
      documentType: asset.documentType ?? "other",
      expiryDate: asset.expiresAt?.slice(0, 10) ?? "",
      issuingCountry: asset.issuingCountry ?? "",
      ownerName: asset.ownerName ?? "",
    })),
    consent: {
      publicProfile: false,
      documentProcessing: Boolean((payload.consents as Record<string, unknown> | undefined)?.documentProcessing),
    },
  }
}
