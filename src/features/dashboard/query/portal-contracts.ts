import { z } from "zod"
import { projectWebsiteSchema } from "@/shared/marketplace/portal-form-schemas"

const nullableText = z.string().trim().nullable().optional()
const nullableUuid = z.string().uuid().nullable().optional()
const nullableEmail = z.union([z.email(), z.null()]).optional()
const nullableUrl = z.union([z.url(), z.null()]).optional()
const companyMemberRole = z.enum([
  "COMPANY_ADMIN",
  "PROJECT_MANAGER",
  "BID_MANAGER",
  "PROCUREMENT_MANAGER",
  "HR_WORKFORCE",
  "FINANCE",
  "EDITOR",
  "VIEWER",
  "SUPERVISOR",
  "MEMBER",
])

export const profileVisibilityContract = z.object({
  publicProfileVisible: z.boolean(),
  websiteVisible: z.boolean(),
  displayNameVisible: z.boolean(),
  profileImageVisible: z.boolean(),
  biographyVisible: z.boolean(),
  skillsVisible: z.boolean(),
  languagesVisible: z.boolean(),
  portfolioVisible: z.boolean(),
  reviewsVisible: z.boolean(),
  generalLocationVisible: z.boolean(),
  exactAddressVisible: z.boolean(),
  phoneVisible: z.boolean(),
  emailVisible: z.boolean(),
  availabilityVisible: z.boolean(),
  lastActiveVisible: z.boolean(),
  searchEngineIndexable: z.boolean(),
  version: z.number().int().positive(),
})

export const personaAvailabilityStatusContract = z.enum([
  "AVAILABLE",
  "LIMITED",
  "UNAVAILABLE",
  "OPEN_TO_OFFERS",
  "NOT_DISCLOSED",
])

export const employmentTypeContract = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "TEMPORARY",
  "CONTRACT",
  "SEASONAL",
  "APPRENTICE",
  "DAY_LABOUR",
])

export const workArrangementContract = z.enum([
  "ON_SITE",
  "HYBRID",
  "REMOTE",
  "MOBILE",
])

export const payIntervalContract = z.enum([
  "HOURLY",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "FIXED",
])

const nullableMinor = z.string().regex(/^\d+$/).nullable().optional()

const nullableCurrency = z.string().trim().length(3).nullable().optional()

const nullableDate = z.string().trim().nullable().optional()

export const personaUpdateContract = z.object({
  worker: z
    .object({
      professionId: nullableUuid,
      yearsExperience: z.number().int().min(0).max(80).optional(),
      availability: nullableText,
      availabilityStatus: personaAvailabilityStatusContract.optional(),
      availableFrom: nullableDate,
      bio: nullableText,
      preferredEmploymentTypes: z
        .array(employmentTypeContract)
        .max(7)
        .optional(),
      preferredWorkArrangement: workArrangementContract.nullable().optional(),
      willingToTravel: z.boolean().optional(),
      travelRadiusKm: z.number().int().min(0).max(5000).nullable().optional(),
      hasOwnTransport: z.boolean().optional(),
      workPermitCountries: z
        .array(z.string().trim().length(2))
        .max(20)
        .optional(),
      expectedPayMinMinor: nullableMinor,
      expectedPayCurrency: nullableCurrency,
      expectedPayInterval: payIntervalContract.nullable().optional(),
    })
    .optional(),
  subcontractor: z
    .object({
      primaryCategoryId: nullableUuid,
      tradingName: nullableText,
      yearsExperience: z.number().int().min(0).max(80).optional(),
      capabilityStatement: nullableText,
      availabilityStatus: personaAvailabilityStatusContract.optional(),
      availableFrom: nullableDate,
      maxConcurrentProjects: z
        .number()
        .int()
        .min(0)
        .max(1000)
        .nullable()
        .optional(),
      crewSize: z.number().int().min(0).max(10000).nullable().optional(),
      travelRadiusKm: z.number().int().min(0).max(5000).nullable().optional(),
      emergencyCallout: z.boolean().optional(),
    })
    .optional(),
  serviceProvider: z
    .object({
      providerIdentity: z.string().trim().min(1).max(100).optional(),
      tradingName: nullableText,
      yearsExperience: z.number().int().min(0).max(80).optional(),
      professionalBackground: z.string().trim().min(1).max(8000).optional(),
      capabilityStatement: z.string().trim().min(1).max(8000).optional(),
      professionalTitle: nullableText,
      licenceNumber: nullableText,
      licenceCountryCode: z.string().trim().length(2).nullable().optional(),
      professionalBody: nullableText,
      availability: nullableText,
      availabilityStatus: personaAvailabilityStatusContract.optional(),
      availableFrom: nullableDate,
      hourlyRateMinMinor: nullableMinor,
      rateCurrency: nullableCurrency,
      remoteServices: z.boolean().optional(),
    })
    .optional(),
  projectOwner: z
    .object({
      background: nullableText,
      description: nullableText,
      organizationName: nullableText,
      website: nullableUrl,
      preferredProjectTypes: z
        .array(z.string().trim().max(80))
        .max(20)
        .optional(),
      typicalBudgetMinMinor: nullableMinor,
      typicalBudgetMaxMinor: nullableMinor,
      budgetCurrency: nullableCurrency,
      acceptsIntroductions: z.boolean().optional(),
      yearsExperience: z.number().int().min(0).max(80).optional(),
      serviceRegionIds: z.array(z.string().uuid()).max(30).optional(),
    })
    .optional(),
})

export const profileCollectionsContract = z.object({
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid(),
        level: z
          .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
          .nullable()
          .optional(),
      }),
    )
    .max(50)
    .optional(),
  languages: z
    .array(
      z.object({
        languageCode: z.string().trim().min(2).max(8),
        proficiency: z
          .enum(["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "NATIVE"])
          .nullable()
          .optional(),
      }),
    )
    .max(20)
    .optional(),
  categoryIds: z.array(z.string().uuid()).max(30).optional(),
  serviceRegionIds: z.array(z.string().uuid()).max(30).optional(),
  version: z.number().int().positive().optional(),
})

export const companyVisibilityContract = z.object({
  publicProfileVisible: z.boolean(),
  websiteVisible: z.boolean(),
  legalNameVisible: z.boolean(),
  identifiersVisible: z.boolean(),
  descriptionVisible: z.boolean(),
  logoVisible: z.boolean(),
  galleryVisible: z.boolean(),
  capabilitiesVisible: z.boolean(),
  catalogueVisible: z.boolean(),
  equipmentVisible: z.boolean(),
  projectsVisible: z.boolean(),
  reviewsVisible: z.boolean(),
  generalLocationVisible: z.boolean(),
  exactAddressVisible: z.boolean(),
  phoneVisible: z.boolean(),
  emailVisible: z.boolean(),
  websiteUrlVisible: z.boolean(),
  businessHoursVisible: z.boolean(),
  searchEngineIndexable: z.boolean(),
})

const companyIdentifierContract = z.object({
  id: z.string().uuid().optional(),
  countryCode: z.string().trim().length(2),
  kind: z.enum([
    "VAT",
    "FISCAL_CODE",
    "REGISTRATION_NUMBER",
    "REA",
    "EORI",
    "LEI",
    "OTHER",
  ]),
  rawValue: z.string().trim().min(1).max(100),
  isPrimary: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

export const companyServiceContract = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(250),
  description: nullableText,
})

export const companyCertificationContract = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(250),
  issuer: nullableText,
  issuedAt: nullableText,
  expiresAt: nullableText,
})

export const workspaceCreateContract = z.object({
  name: z.string().trim().min(2).max(250),
  legalName: nullableText,
  registrationNumber: nullableText,
  vatNumber: nullableText,
  companyType: z.enum([
    "GENERAL_CONTRACTOR",
    "SUBCONTRACTOR",
    "SUPPLIER",
    "EQUIPMENT",
    "PROFESSIONAL",
  ]),
  description: nullableText,
  email: nullableEmail,
  phone: nullableText,
  website: nullableUrl,
  addressLine1: z.string().trim().min(5).max(250),
  cityId: z.string().uuid(),
  region: nullableText,
  postalCode: nullableText,
  categoryId: nullableUuid,
  subcategoryId: nullableUuid,
  size: nullableText,
  timezone: z.string().trim().min(1).max(64),
  visibility: companyVisibilityContract.optional(),
})

export const workspaceUpdateContract = z.object({
  name: z.string().trim().min(2).max(250).optional(),
  legalName: nullableText,
  registrationNumber: nullableText,
  vatNumber: nullableText,
  description: nullableText,
  email: nullableEmail,
  phone: nullableText,
  website: nullableUrl,
  addressLine1: nullableText,
  cityText: nullableText,
  cityId: nullableUuid,
  region: nullableText,
  postalCode: nullableText,
  countryCode: nullableText,
  categoryId: nullableUuid,
  subcategoryId: nullableUuid,
  categoryIds: z.array(z.string().uuid()).max(30).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  serviceRegionIds: z.array(z.string().uuid()).max(50).optional(),
  identifiers: z.array(companyIdentifierContract).optional(),
  visibility: companyVisibilityContract.partial().optional(),
  services: z.array(companyServiceContract).optional(),
  certifications: z.array(companyCertificationContract).optional(),
})

export const memberInviteContract = z.object({
  invitationEmail: z.string().email(),
  profileId: z.string().uuid().optional(),
  role: companyMemberRole.optional(),
  title: nullableText,
  department: nullableText,
})

export const memberUpdateContract = z.object({
  role: companyMemberRole.optional(),
  status: z.enum(["INVITED", "PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  title: nullableText,
  department: nullableText,
  version: z.number().int().positive().optional(),
})

export const projectMutationContract = projectWebsiteSchema

export const projectTransitionContract = z.object({
  status: z.enum([
    "DRAFT",
    "IN_PROGRESS",
    "COMPLETED",
    "ON_HOLD",
    "CANCELLED",
    "ARCHIVED",
  ]),
  reason: nullableText,
  actualEndAt: nullableText,
  version: z.number().int().positive(),
})

export const portalBootstrapContract = z
  .object({
    profile: z
      .object({
        id: z.string(),
        primaryAccountType: z.string().nullable().optional(),
      })
      .passthrough(),
    access: z.object({ nextAction: z.string() }).passthrough(),
    workspaces: z.array(z.object({ companyId: z.string() }).passthrough()),
    membershipInvitations: z.array(
      z
        .object({
          membershipId: z.string(),
          companyId: z.string(),
          companyName: z.string(),
          status: z.string(),
          invitedAt: z.string().nullable(),
        })
        .passthrough(),
    ),
    activeWorkspace: z
      .object({ companyId: z.string() })
      .passthrough()
      .nullable(),
    entitlements: z.object({
      modules: z.array(z.string()),
      permissions: z.array(z.string()),
      capabilities: z.array(z.string()),
      allowedActions: z.array(z.string()),
    }),
    counts: z.record(z.string(), z.number()),
  })
  .passthrough()

export const portalNotificationContract = z
  .object({
    id: z.string(),
    type: z.string(),
    category: z.string(),
    priority: z.string(),
    actionUrl: z.string().nullable(),
    payload: z.unknown(),
    seenAt: z.string().nullable(),
    createdAt: z.string(),
    readAt: z.string().nullable(),
  })
  .passthrough()

export const portalNotificationListContract = z.object({
  items: z.array(portalNotificationContract),
  unreadCount: z.number().int().nonnegative(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
})

export type PortalBootstrapContract = z.infer<typeof portalBootstrapContract>
export type PortalNotificationContract = z.infer<
  typeof portalNotificationContract
>
export type ProfileVisibilityContract = z.infer<
  typeof profileVisibilityContract
>
export type PersonaUpdateContract = z.infer<typeof personaUpdateContract>
export type ProfileCollectionsContract = z.infer<
  typeof profileCollectionsContract
>
export type CompanyVisibilityContract = z.infer<
  typeof companyVisibilityContract
>
export type WorkspaceCreateContract = z.infer<typeof workspaceCreateContract>
export type WorkspaceUpdateContract = z.infer<typeof workspaceUpdateContract>
export type MemberInviteContract = z.infer<typeof memberInviteContract>
export type MemberUpdateContract = z.infer<typeof memberUpdateContract>
export type ProjectMutationContract = z.infer<typeof projectMutationContract>
export type ProjectTransitionContract = z.infer<
  typeof projectTransitionContract
>
