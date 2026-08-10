import { z } from "zod"

import { locales, type ProfileType } from "@/shared/types/platform"

const requiredText = z.string().trim().min(1).max(500)
const optionalText = z.string().trim().max(500)
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
  region: requiredText,
  city: requiredText,
  preferredLocale: z.enum(locales),
  contactPreference: z.enum(["platform_only", "public_contact"]),
}

export const profileSchemas = {
  individual: z.object({
    ...commonProfileFields,
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
    primaryTrade: requiredText,
    categories: requiredText,
    yearsExperience: yearsOfExperience,
    serviceRegions: requiredText,
    capabilityStatement: requiredText,
    availability: requiredText,
  }),
  supplier_contact: z.object({
    ...commonProfileFields,
    jobTitle: requiredText,
    organizationMode: z.enum(["select", "create", "claim"]),
    supplierName: requiredText,
    vatNumber: optionalText,
    categories: requiredText,
    serviceRegions: requiredText,
    businessDescription: requiredText,
  }),
  service_provider: z.object({
    ...commonProfileFields,
    providerIdentity: requiredText,
    categories: requiredText,
    yearsExperience: yearsOfExperience,
    professionalBackground: requiredText,
    serviceRegions: requiredText,
    capabilityStatement: requiredText,
    availability: requiredText,
  }),
} satisfies Record<ProfileType, z.ZodObject>

export function getProfileSchema(profileType: ProfileType) {
  return profileSchemas[profileType]
}

export const documentMetadataSchema = z.object({
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
  expiryDate: z.iso.date(),
  issuingCountry: z.string().trim().length(2),
  ownerName: requiredText,
})

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>
