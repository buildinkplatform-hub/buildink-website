export const locales = ["it", "en", "ar", "ro", "sq"] as const
export type Locale = (typeof locales)[number]

export const profileTypes = [
  "individual",
  "worker",
  "contractor",
  "supplier_contact",
  "service_provider",
] as const
export type ProfileType = (typeof profileTypes)[number]

export const primaryAccountTypes = [
  "COMPANY",
  "PROJECT_OWNER",
  "SUBCONTRACTOR",
  "SERVICE_PROVIDER",
  "WORKER",
] as const
export type PrimaryAccountType = (typeof primaryAccountTypes)[number]

export const portalModules = [
  "overview",
  "profile",
  "verification",
  "notifications",
  "messages",
  "saved",
  "settings",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "workforce",
  "catalogue",
  "equipment",
  "engagements",
  "workspace",
  "members",
  "support",
] as const
export type PortalModule = (typeof portalModules)[number]

export type VerificationStatus = "pending" | "verified" | "changes_requested"

export interface SessionClaims {
  userId: string
  name: string
  email: string
  profileType: ProfileType
  primaryAccountType?: PrimaryAccountType | null
  modules: PortalModule[]
  permissions: string[]
  capabilities: string[]
  hasActiveWorkspace: boolean
  counts?: PortalAccountCounts
  onboardingComplete: boolean
  verificationStatus: VerificationStatus
  issuedAt: number
  expiresAt: number
}

export interface PortalAccountCounts {
  projects: number
  opportunities: number
  offers: number
  applications: number
  engagements: number
  unreadNotifications: number
  savedItems: number
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
  expiryDate?: string
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
  primaryAccountType?: PrimaryAccountType | null
  profile: Record<string, unknown>
  profileImage?: OnboardingFile
  documents: OnboardingDocument[]
  consent: {
    publicProfile: boolean
    documentProcessing: boolean
    terms: boolean
    privacy: boolean
  }
  reviewFeedback?: {
    status: string
    closedReason?: string | null
    issues: Array<{ fieldPath: string; message: string }>
  } | null
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
  primaryAccountType?: PrimaryAccountType | null
  completion: number
  metrics: DashboardMetric[]
  tasks: DashboardItem[]
  notifications: DashboardItem[]
  quickActionKeys: string[]
  accountOnly: true
}

export type PortalRouteState = "active" | "coming-soon"

export interface PortalRouteDefinition {
  segment: string
  module: PortalModule
  labelKey: string
  descriptionKey: string
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
