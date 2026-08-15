import { isPrimaryAccountType, isProfileType } from "@/shared/constants/platform"
import type { PrimaryAccountType, ProfileType } from "@/shared/types/platform"

export function needsCompanyAssociation(
  accountType: PrimaryAccountType,
): boolean {
  switch (accountType) {
    case "COMPANY":
      return true
    case "SUBCONTRACTOR":
    case "SERVICE_PROVIDER":
    case "PROJECT_OWNER":
    case "WORKER":
      return false
    default: {
      const exhaustive: never = accountType
      return exhaustive
    }
  }
}

export function storedProfileTypeSupportsAccountType(
  profileType: ProfileType,
  accountType: PrimaryAccountType,
): boolean {
  switch (accountType) {
    case "COMPANY":
      return (
        profileType === "contractor" ||
        profileType === "supplier_contact" ||
        profileType === "service_provider"
      )
    case "SUBCONTRACTOR":
      return profileType === "contractor"
    case "SERVICE_PROVIDER":
      return profileType === "service_provider"
    case "PROJECT_OWNER":
      return profileType === "individual"
    case "WORKER":
      return profileType === "worker"
    default: {
      const exhaustive: never = accountType
      return exhaustive
    }
  }
}

export function profileTypeForAccountType(
  accountType: PrimaryAccountType,
  existingProfileType?: ProfileType | null,
): ProfileType {
  if (
    existingProfileType &&
    storedProfileTypeSupportsAccountType(existingProfileType, accountType)
  ) {
    return existingProfileType
  }
  switch (accountType) {
    case "COMPANY":
      return "contractor"
    case "PROJECT_OWNER":
      return "individual"
    case "SUBCONTRACTOR":
      return "contractor"
    case "SERVICE_PROVIDER":
      return "service_provider"
    case "WORKER":
      return "worker"
    default: {
      const exhaustive: never = accountType
      return exhaustive
    }
  }
}

export function accountTypeFromProfileType(
  profileType: ProfileType,
  companyId?: string | null,
): PrimaryAccountType {
  void companyId
  switch (profileType) {
    case "individual":
      return "PROJECT_OWNER"
    case "worker":
      return "WORKER"
    case "supplier_contact":
      return "COMPANY"
    case "service_provider":
      return "SERVICE_PROVIDER"
    case "contractor":
      return "SUBCONTRACTOR"
    default: {
      const exhaustive: never = profileType
      return exhaustive
    }
  }
}

export function resolveCanonicalAccountType(input: {
  primaryAccountType?: PrimaryAccountType | string | null
  profileType?: ProfileType | string | null
}): PrimaryAccountType | undefined {
  if (isPrimaryAccountType(input.primaryAccountType)) {
    return input.primaryAccountType
  }
  if (!isProfileType(input.profileType)) return undefined
  return accountTypeFromProfileType(input.profileType)
}

export function accountTypeFromDraft(draft: {
  primaryAccountType?: PrimaryAccountType | null
  profileType?: ProfileType
  profile?: Record<string, unknown>
}): PrimaryAccountType | undefined {
  return resolveCanonicalAccountType({
    primaryAccountType: draft.primaryAccountType,
    profileType: draft.profileType,
  })
}
