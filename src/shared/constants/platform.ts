import type { Locale, ProfileType, PrimaryAccountType } from "@/shared/types/platform"

export const DEFAULT_LOCALE: Locale = "it"
export const TIME_ZONE = "Europe/Rome"
export const LOCALE_COOKIE = "buildink_locale"
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024
export const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
]
export const ALLOWED_PROFILE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]

export const localeMetadata: Record<
  Locale,
  { nativeLabel: string; direction: "ltr" | "rtl"; intlLocale: string }
> = {
  it: { nativeLabel: "Italiano", direction: "ltr", intlLocale: "it-IT" },
  en: { nativeLabel: "English", direction: "ltr", intlLocale: "en-GB" },
  ar: { nativeLabel: "العربية", direction: "rtl", intlLocale: "ar-SA" },
  ro: { nativeLabel: "Română", direction: "ltr", intlLocale: "ro-RO" },
  sq: { nativeLabel: "Shqip", direction: "ltr", intlLocale: "sq-AL" },
}

export const profileTypeLabelKeys: Record<ProfileType, string> = {
  individual: "roles.individual",
  worker: "roles.worker",
  contractor: "roles.contractor",
  supplier_contact: "roles.supplierContact",
  service_provider: "roles.serviceProvider",
}

export const primaryAccountTypeLabelKeys: Record<PrimaryAccountType, string> = {
  COMPANY: "roles.company",
  PROJECT_OWNER: "roles.projectOwner",
  SUBCONTRACTOR: "roles.subcontractor",
  SERVICE_PROVIDER: "roles.serviceProvider",
  WORKER: "roles.worker",
}

export function isLocale(value?: string): value is Locale {
  return value === "it" || value === "en" || value === "ar" || value === "ro" || value === "sq"
}

export function isProfileType(value?: string | null): value is ProfileType {
  return Boolean(value && value in profileTypeLabelKeys)
}

export function isPrimaryAccountType(
  value?: string | null,
): value is PrimaryAccountType {
  return Boolean(value && value in primaryAccountTypeLabelKeys)
}
