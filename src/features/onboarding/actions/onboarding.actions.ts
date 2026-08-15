"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { backendApi } from "@/lib/backend/api"
import { isLocale, isPrimaryAccountType, isProfileType } from "@/shared/constants/platform"
import {
  accountTypeFromProfileType,
  needsCompanyAssociation,
  profileTypeForAccountType,
} from "@/shared/lib/account-type-mapping"
import type {
  Locale,
  OnboardingCatalog,
  OnboardingDraft,
  PrimaryAccountType,
  ProfileType,
} from "@/shared/types/platform"

interface BackendDraft {
  id: string
  currentStep: string
  profileType: ProfileType | string | null
  primaryAccountType?: PrimaryAccountType | string | null
  payload: Record<string, unknown>
  version: number
  reviewFeedback?: {
    status: string
    closedReason?: string | null
    issues: Array<{ fieldPath: string; message: string }>
  } | null
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

export async function saveProfileTypeAction(
  primaryAccountType: PrimaryAccountType,
  version?: number,
  existingProfileType?: ProfileType,
) {
  if (!isPrimaryAccountType(primaryAccountType)) return { success: false as const }
  const profileType = profileTypeForAccountType(
    primaryAccountType,
    existingProfileType,
  )
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/profile-type", {
    method: "PUT",
    body: JSON.stringify({ primaryAccountType, profileType, version }),
  })
  return { success: true as const, draft: mapBackendDraft(draft) }
}

export async function saveProfileAction(
  profileType: ProfileType,
  profile: Record<string, unknown>,
  version?: number,
  primaryAccountType?: PrimaryAccountType | null,
) {
  if (!isProfileType(profileType)) return { success: false as const }
  const normalized = normalizeProfile(profileType, profile)
  const draft = await backendApi<BackendDraft>("/api/v1/onboarding/profile", {
    method: "PUT",
    body: JSON.stringify({ profile: normalized, version }),
  })
  const association = buildCompanyAssociation(
    profileType,
    profile,
    primaryAccountType,
  )
  if (association) {
    await backendApi("/api/v1/onboarding/company-association", {
      method: "PUT",
      body: JSON.stringify({ association }),
    })
  }
  return { success: true as const, draft: mapBackendDraft(draft) }
}

export async function saveConsentsAction(
  locale: Locale,
  documentProcessing: boolean,
  marketing: boolean,
  version?: number,
  terms = false,
  privacy = false,
) {
  if (!isLocale(locale) || !documentProcessing || !terms || !privacy) {
    return { success: false as const }
  }
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

export async function searchCompaniesAction(query: string) {
  const q = query.trim()
  if (q.length < 2) return [] as Array<{
    id: string
    name: string
    slug: string
    companyType: string
    verificationStatus: string
  }>
  return backendApi<
    Array<{
      id: string
      name: string
      slug: string
      companyType: string
      verificationStatus: string
    }>
  >(`/api/v1/onboarding/companies/search?q=${encodeURIComponent(q)}`)
}

function buildCompanyAssociation(
  profileType: ProfileType,
  profile: Record<string, unknown>,
  primaryAccountType?: PrimaryAccountType | null,
) {
  const accountType =
    primaryAccountType ?? accountTypeFromProfileType(profileType)
  const mode = String(profile.organizationMode ?? "")
  if (accountType === "WORKER") return null
  if (!needsCompanyAssociation(accountType) && !mode) return null
  switch (profileType) {
    case "individual":
    case "worker":
      return null
    case "contractor":
    case "supplier_contact":
    case "service_provider":
      break
    default: {
      const exhaustive: never = profileType
      return exhaustive
    }
  }
  const resolvedMode = mode || "create"
  const companyId = String(profile.companyId ?? "")
  if (resolvedMode === "claim" && companyId) return { mode: "claim" as const, companyId }
  if (resolvedMode === "select" && companyId) return { mode: "join" as const, companyId }
  if (resolvedMode !== "create") return null
  return {
    mode: "create" as const,
    company: {
      name: associationCompanyName(profileType, profile),
      vatNumber: String(profile.vatNumber ?? "") || undefined,
      companyType: associationCompanyType(profileType),
      description: associationDescription(profileType, profile),
    },
  }
}

function associationCompanyName(
  profileType: "contractor" | "supplier_contact" | "service_provider",
  profile: Record<string, unknown>,
) {
  switch (profileType) {
    case "contractor":
      return String(profile.contractorIdentity ?? "")
    case "supplier_contact":
      return String(profile.supplierName ?? "")
    case "service_provider":
      return String(profile.providerIdentity ?? "")
    default: {
      const exhaustive: never = profileType
      return exhaustive
    }
  }
}

function associationCompanyType(
  profileType: "contractor" | "supplier_contact" | "service_provider",
) {
  switch (profileType) {
    case "contractor":
      return "contractor"
    case "supplier_contact":
      return "supplier"
    case "service_provider":
      return "professional"
    default: {
      const exhaustive: never = profileType
      return exhaustive
    }
  }
}

function associationDescription(
  profileType: "contractor" | "supplier_contact" | "service_provider",
  profile: Record<string, unknown>,
) {
  switch (profileType) {
    case "contractor":
      return String(profile.capabilityStatement ?? "")
    case "supplier_contact":
      return String(profile.businessDescription ?? "")
    case "service_provider":
      return String(profile.professionalBackground ?? "")
    default: {
      const exhaustive: never = profileType
      return exhaustive
    }
  }
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
  delete result.companyId
  if (profileType !== "individual") delete result.profileVisibility
  return result
}

function consentAccepted(value: unknown) {
  if (typeof value === "boolean") return value
  if (value && typeof value === "object" && "accepted" in value) {
    return Boolean((value as { accepted?: unknown }).accepted)
  }
  return false
}

function mapBackendDraft(draft: BackendDraft) {
  const payloadAccountType =
    typeof draft.payload?.primaryAccountType === "string"
      ? draft.payload.primaryAccountType
      : draft.primaryAccountType
  const normalizedProfileType = draft.profileType?.toLowerCase() ?? null
  const profileType = isProfileType(normalizedProfileType)
    ? normalizedProfileType
    : null
  const primaryAccountType = isPrimaryAccountType(payloadAccountType)
    ? payloadAccountType
    : profileType
      ? accountTypeFromProfileType(profileType)
      : null
  return { ...draft, profileType, primaryAccountType }
}

function mapDraft(draft: BackendDraft, account: OnboardingDraft["account"]): OnboardingDraft {
  const mapped = mapBackendDraft(draft)
  const payload = mapped.payload ?? {}
  const profileImage = mapped.assets.find((asset) => asset.purpose === "profile_image")
  const storedProfile = (payload.profile as Record<string, unknown> | undefined) ?? {}
  return {
    id: mapped.id,
    version: mapped.version,
    currentStep: mapped.currentStep,
    account,
    profileType: mapped.profileType ?? undefined,
    primaryAccountType: mapped.primaryAccountType,
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
      documentProcessing: consentAccepted(
        (payload.consents as Record<string, unknown> | undefined)?.documentProcessing,
      ),
      terms: consentAccepted(
        (payload.consents as Record<string, unknown> | undefined)?.terms,
      ),
      privacy: consentAccepted(
        (payload.consents as Record<string, unknown> | undefined)?.privacy,
      ),
    },
    reviewFeedback: draft.reviewFeedback ?? null,
  }
}
