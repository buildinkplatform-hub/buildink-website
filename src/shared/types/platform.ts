export const locales = ["it", "en", "ar"] as const
export type Locale = (typeof locales)[number]

export const profileTypes = [
  "individual",
  "worker",
  "contractor",
  "supplier_contact",
  "service_provider",
] as const
export type ProfileType = (typeof profileTypes)[number]
export type VerificationStatus = "pending" | "verified" | "changes_requested"

export interface SessionClaims {
  userId: string
  name: string
  email: string
  profileType: ProfileType
  onboardingComplete: boolean
  verificationStatus: VerificationStatus
  issuedAt: number
  expiresAt: number
}

export interface PublicViewer {
  name: string
  email: string
  nextAction: string
  profileHref: string
  profileImageAssetId?: string | null
}

export interface OnboardingFile {
  id: string
  name: string
  size: number
  mimeType: string
  purpose?: "profile_image" | "portfolio" | "document"
  status?: string
}

export interface CountryOption {
  code: string
  name: string
}

export interface CategoryOption {
  id: string
  slug: string
  label: string
  parentId: string | null
  children: CategoryOption[]
}

export interface OnboardingCatalog {
  countries: CountryOption[]
  categories: CategoryOption[]
}

export interface OnboardingDocument extends OnboardingFile {
  documentType: string
  expiryDate: string
  issuingCountry: string
  ownerName: string
}

export interface OnboardingDraft {
  id?: string
  version?: number
  currentStep?: string
  account: {
    name: string
    email: string
    preferredLocale: Locale
    termsAcceptedAt: string
    privacyAcceptedAt: string
    marketing: boolean
  }
  profileType?: ProfileType
  profile: Record<string, unknown>
  profileImage?: OnboardingFile
  documents: OnboardingDocument[]
  consent: { publicProfile: boolean; documentProcessing: boolean }
}

export interface DashboardMetric {
  labelKey: string
  value: string
  tone: "blue" | "green" | "orange" | "navy"
}

export interface DashboardItem {
  titleKey: string
  descriptionKey: string
  metaKey: string
}

export interface DashboardViewModel {
  profileType: ProfileType
  completion: number
  metrics: DashboardMetric[]
  tasks: DashboardItem[]
  notifications: DashboardItem[]
  quickActionKeys: string[]
}

export type PortalRouteState = "active" | "coming-soon"

export interface PortalRouteDefinition {
  segment: string
  labelKey: string
  descriptionKey: string
  profileTypes: ProfileType[]
  state: PortalRouteState
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  requestId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}
