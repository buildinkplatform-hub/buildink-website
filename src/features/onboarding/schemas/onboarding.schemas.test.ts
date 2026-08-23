import { describe, expect, it } from "vitest"

import {
  documentMetadataSchema,
  getProfileSchemaForAccountType,
  profileSchemas,
} from "./onboarding.schemas"

const common = {
  phone: "+393331234567",
  country: "Italy",
  region: "",
  city: "",
  preferredLocale: "en",
  contactPreference: "platform_only",
}

const contractorFields = {
  contractorIdentity: "Rossi Contracting",
  organizationMode: "create" as const,
  primaryTrade: "General construction",
  categories: "Renovation",
  yearsExperience: "12",
  serviceRegions: "Lombardy",
  capabilityStatement: "Commercial renovation contractor.",
  availability: "Four-week lead time",
  companyEmail: "ops@rossi.example",
  companyPhone: "+393331111111",
  companyCategoryId: "11111111-1111-4111-8111-111111111111",
  companyRegion: "Lombardy",
  companyAddress: "Via Torino 10, Milan",
  companySize: "11-50",
  companyTimezone: "Europe/Rome",
}

const companyAccountFields = {
  organizationMode: "create" as const,
  companyName: "Rossi Contracting",
  companyType: "GENERAL_CONTRACTOR",
  companyRegistrationNumber: "BR-2021-0184",
  companyEmail: "ops@rossi.example",
  companyPhone: "+393331111111",
  companyCategoryId: "11111111-1111-4111-8111-111111111111",
  companyRegion: "Lombardy",
  companyAddress: "Via Torino 10, Milan",
  companySize: "11-50",
  companyTimezone: "Europe/Rome",
}

describe("onboarding schemas", () => {
  it("validates profile payloads for the five current account types", () => {
    expect(
      getProfileSchemaForAccountType("PROJECT_OWNER").safeParse({
        ...common,
        organizationMode: "select",
        companyId: "11111111-1111-4111-8111-111111111111",
        bio: "",
        profileVisibility: "public",
        interests: "Renovation",
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("WORKER").safeParse({
        ...common,
        profession: "Electrician",
        skills: "Wiring, maintenance",
        yearsExperience: "8",
        availability: "Available now",
        languages: "Italian, English",
        bio: "Qualified construction electrician.",
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("COMPANY").safeParse({
        ...companyAccountFields,
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("SUBCONTRACTOR").safeParse({
        ...common,
        ...contractorFields,
        organizationMode: "select",
        companyId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("SERVICE_PROVIDER").safeParse({
        ...common,
        providerIdentity: "Bianchi Engineering",
        organizationMode: "select",
        companyId: "11111111-1111-4111-8111-111111111111",
        categories: "Structural engineering",
        yearsExperience: "10",
        professionalBackground: "Licensed structural engineer.",
        serviceRegions: "Italy",
        capabilityStatement: "Design and site consulting.",
        availability: "Available next month",
      }).success,
    ).toBe(true)
  })

  it("keeps invited supplier payloads on the company account type", () => {
    expect(
      getProfileSchemaForAccountType("COMPANY", "supplier_contact").safeParse({
        ...companyAccountFields,
        companyName: "Build Supply SRL",
        vatNumber: "IT12345678901",
      }).success,
    ).toBe(true)
  })

  it("requires normalized phone and document metadata", () => {
    expect(
      profileSchemas.individual.safeParse({
        ...common,
        phone: "333 123 4567",
        bio: "",
        profileVisibility: "public",
        interests: "",
      }).success,
    ).toBe(false)
    expect(
      documentMetadataSchema.safeParse({
        documentType: "identity",
        expiryDate: "2030-01-01",
        issuingCountry: "IT",
        ownerName: "Giulia Rossi",
      }).success,
    ).toBe(true)
    expect(
      documentMetadataSchema.safeParse({
        documentType: "certificate",
        expiryDate: "",
        issuingCountry: "IT",
        ownerName: "Giulia Rossi",
      }).success,
    ).toBe(true)
    expect(
      documentMetadataSchema.safeParse({
        documentType: "identity",
        expiryDate: "",
        issuingCountry: "IT",
        ownerName: "Giulia Rossi",
      }).success,
    ).toBe(false)
  })

  it("accepts join and claim association fields for company personas and requires select for non-company paths", () => {
    expect(
      getProfileSchemaForAccountType("COMPANY").safeParse({
        organizationMode: "claim",
        companyId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("SUBCONTRACTOR").safeParse({
        ...common,
        ...contractorFields,
        organizationMode: "select",
        companyId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true)
    expect(
      getProfileSchemaForAccountType("SUBCONTRACTOR").safeParse({
        ...common,
        ...contractorFields,
        organizationMode: "create",
      }).success,
    ).toBe(false)
  })
})
