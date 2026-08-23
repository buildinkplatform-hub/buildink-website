import { z } from "zod"

import { profileTypeForAccountType } from "@/shared/lib/account-type-mapping"
import { locales, type PrimaryAccountType, type ProfileType } from "@/shared/types/platform"

const requiredText = z.string().trim().min(1).max(500)
const optionalText = z.string().trim().max(500).optional()
const yearsOfExperience = z
  .string()
  .trim()
  .regex(/^\d{1,2}$/)
  .refine((value) => Number(value) <= 80)

const commonProfileFields = {
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/),
  country: requiredText,
  region: optionalText,
  city: optionalText,
  preferredLocale: z.enum(locales),
  contactPreference: z.enum(["platform_only", "public_contact"]),
}

const companyIdentifierSchema = z.object({
  countryCode: z.string().trim().length(2),
  kind: z.enum([
    "VAT",
    "FISCAL_CODE",
    "REA",
    "REGISTRATION_NUMBER",
    "EORI",
    "LEI",
    "OTHER",
  ]),
  rawValue: requiredText,
  isPrimary: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

const companyCreateFields = {
  companyName: optionalText,
  companyLegalName: optionalText,
  companyType: z
    .enum([
      "GENERAL_CONTRACTOR",
      "SUBCONTRACTOR",
      "SUPPLIER",
      "EQUIPMENT",
      "PROFESSIONAL",
    ])
    .optional(),
  companyRegistrationNumber: optionalText,
  companyCategoryId: z.string().uuid().optional().or(z.literal("")),
  companySubcategoryId: z.string().uuid().optional().or(z.literal("")),
  companyCityId: z.string().uuid().optional().or(z.literal("")),
  companyRegion: optionalText,
  companyAddress: optionalText,
  companyDescription: z.string().trim().max(10000).optional(),
  companyBusinessHours: optionalText,
  companySize: optionalText,
  companyTimezone: optionalText,
  companyWebsite: z.union([z.url(), z.literal("")]).optional(),
  companyEmail: z.union([z.email(), z.literal("")]).optional(),
  companyPhone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/)
    .optional()
    .or(z.literal("")),
  companyIdentifiers: z.array(companyIdentifierSchema).max(12).optional(),
}

function requireCompanyCreateDetails(
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (value.organizationMode === "select" || value.organizationMode === "claim") {
    if (
      typeof value.companyId !== "string" ||
      value.companyId.trim().length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["companyId"],
        message: "Choose an existing company",
      })
    }
  }
  if (value.organizationMode !== "create") return
  const requiredFields = [
    ["companyName", value.companyName],
    ["companyType", value.companyType],
    ["companyEmail", value.companyEmail],
    ["companyPhone", value.companyPhone],
    ["companyCategoryId", value.companyCategoryId],
    ["companyRegion", value.companyRegion],
    ["companyAddress", value.companyAddress],
    ["companySize", value.companySize],
    ["companyTimezone", value.companyTimezone],
  ] as const
  for (const [field, fieldValue] of requiredFields) {
    if (typeof fieldValue === "string" && fieldValue.trim().length > 0) continue
    ctx.addIssue({
      code: "custom",
      path: [field],
      message: "Company details are required when creating a company",
    })
  }
  const registrationNumber =
    typeof value.companyRegistrationNumber === "string"
      ? value.companyRegistrationNumber.trim()
      : ""
  const vatNumber =
    typeof value.vatNumber === "string" ? value.vatNumber.trim() : ""
  const hasComplianceIdentifier =
    registrationNumber.length >= 3 || vatNumber.length >= 3
  if (!hasComplianceIdentifier) {
    ctx.addIssue({
      code: "custom",
      path: ["companyRegistrationNumber"],
      message: "Add a VAT number or registration number",
    })
  }
}

const companyAccountProfileSchema = z
  .object({
    organizationMode: z.enum(["select", "create", "claim"]),
    companyId: z.string().uuid().optional().or(z.literal("")),
    ...companyCreateFields,
  })
  .superRefine(requireCompanyCreateDetails)

export const profileSchemas = {
  individual: z.object({
    ...commonProfileFields,
    organizationMode: z.enum(["select"]).default("select"),
    companyId: z.string().uuid(),
    bio: optionalText,
    profileVisibility: z.enum(["public", "private"]),
    interests: requiredText,
  }),
  worker: z.object({
    ...commonProfileFields,
    profession: requiredText,
    skills: requiredText,
    yearsExperience: yearsOfExperience,
    availability: requiredText,
    languages: requiredText,
    bio: requiredText,
  }),
  contractor: z.object({
    ...commonProfileFields,
    contractorIdentity: requiredText,
    organizationMode: z.enum(["select", "create", "claim"]),
    companyId: z.string().uuid().optional().or(z.literal("")),
    primaryTrade: requiredText,
    categories: requiredText,
    yearsExperience: yearsOfExperience,
    serviceRegions: requiredText,
    capabilityStatement: requiredText,
    availability: requiredText,
    ...companyCreateFields,
  }).superRefine(requireCompanyCreateDetails),
  supplier_contact: z.object({
    ...commonProfileFields,
    jobTitle: requiredText,
    organizationMode: z.enum(["select", "create", "claim"]),
    companyId: z.string().uuid().optional().or(z.literal("")),
    supplierName: requiredText,
    vatNumber: optionalText,
    categories: requiredText,
    serviceRegions: requiredText,
    businessDescription: requiredText,
    ...companyCreateFields,
  }).superRefine(requireCompanyCreateDetails),
  service_provider: z.object({
    ...commonProfileFields,
    providerIdentity: requiredText,
    organizationMode: z.enum(["select", "create", "claim"]),
    companyId: z.string().uuid().optional().or(z.literal("")),
    categories: requiredText,
    yearsExperience: yearsOfExperience,
    professionalBackground: requiredText,
    serviceRegions: requiredText,
    capabilityStatement: requiredText,
    availability: requiredText,
    ...companyCreateFields,
  }).superRefine(requireCompanyCreateDetails),
} satisfies Record<ProfileType, z.ZodObject>

export function getProfileSchema(profileType: ProfileType) {
  return profileSchemas[profileType]
}

export function getProfileSchemaForAccountType(
  accountType: PrimaryAccountType,
  existingProfileType?: ProfileType,
) {
  if (accountType === "COMPANY") return companyAccountProfileSchema
  const schema = profileSchemas[
    profileTypeForAccountType(accountType, existingProfileType)
  ]
  if (
    accountType !== "PROJECT_OWNER" &&
    accountType !== "SUBCONTRACTOR" &&
    accountType !== "SERVICE_PROVIDER"
  ) {
    return schema
  }
  return schema.superRefine((value, ctx) => {
    if (
      "organizationMode" in value &&
      value.organizationMode &&
      value.organizationMode !== "select"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationMode"],
        message: "Choose an existing company",
      })
    }
  })
}

export function expiryRequiredForDocument(documentType: string) {
  return documentType === "identity" || documentType === "license"
}

export const documentMetadataSchema = z
  .object({
    documentType: z.enum([
      "identity",
      "certificate",
      "license",
      "trade_proof",
      "professional_proof",
      "company_authorization",
      "registration",
      "vat_proof",
      "other",
    ]),
    expiryDate: z.union([z.iso.date(), z.literal("")]).optional(),
    issuingCountry: z.string().trim().length(2),
    ownerName: requiredText,
  })
  .superRefine((value, ctx) => {
    if (
      expiryRequiredForDocument(value.documentType) &&
      !value.expiryDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry date is required for this document",
      })
    }
  })

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>
