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

const validWorker = {
  ...common,
  profession: "Electrician",
  skills: "Wiring, maintenance",
  yearsExperience: "8",
  availability: "Available now",
  languages: "Italian, English",
  bio: "Qualified construction electrician.",
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
      getProfileSchemaForAccountType("WORKER").safeParse(validWorker).success,
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

  it("requires normalized E.164 phone values", () => {
    const schema = getProfileSchemaForAccountType("WORKER")
    for (const phone of [
      "333 123 4567",
      "00393331234567",
      "+0123456789",
      "+1234567",
      "+1234567890123456",
    ]) {
      expect(schema.safeParse({ ...validWorker, phone }).success, phone).toBe(
        false,
      )
    }
    expect(
      schema.safeParse({ ...validWorker, phone: "+12345678" }).success,
    ).toBe(true)
    expect(
      schema.safeParse({ ...validWorker, phone: "+123456789012345" }).success,
    ).toBe(true)
  })

  it("enforces realistic years-of-experience boundaries", () => {
    const schema = getProfileSchemaForAccountType("WORKER")
    for (const value of ["0", "1", "80"]) {
      expect(
        schema.safeParse({ ...validWorker, yearsExperience: value }).success,
        value,
      ).toBe(true)
    }
    for (const value of ["81", "100", "-1", "8.5", "eight", ""]) {
      expect(
        schema.safeParse({ ...validWorker, yearsExperience: value }).success,
        value,
      ).toBe(false)
    }
  })

  it("requires meaningful project-owner interests and a real company UUID", () => {
    const schema = getProfileSchemaForAccountType("PROJECT_OWNER")
    const base = {
      ...common,
      organizationMode: "select" as const,
      companyId: "11111111-1111-4111-8111-111111111111",
      bio: "",
      profileVisibility: "public" as const,
      interests: "Renovation",
    }
    expect(schema.safeParse(base).success).toBe(true)
    expect(schema.safeParse({ ...base, interests: "   " }).success).toBe(false)
    expect(schema.safeParse({ ...base, companyId: "not-a-uuid" }).success).toBe(
      false,
    )
  })

  it("requires complete company-create details and a registration/compliance identifier", () => {
    const schema = getProfileSchemaForAccountType("COMPANY")
    expect(schema.safeParse(companyAccountFields).success).toBe(true)
    expect(
      schema.safeParse({ ...companyAccountFields, companyName: "" }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ ...companyAccountFields, companyEmail: "broken" })
        .success,
    ).toBe(false)
    expect(
      schema.safeParse({ ...companyAccountFields, companyPhone: "3331234567" })
        .success,
    ).toBe(false)
    expect(
      schema.safeParse({ ...companyAccountFields, companyCategoryId: "bad-id" })
        .success,
    ).toBe(false)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyRegistrationNumber: "",
      }).success,
    ).toBe(false)
  })

  it("validates optional company website/email/phone fields when supplied", () => {
    const schema = getProfileSchemaForAccountType("COMPANY")
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyWebsite: "https://rossi.example",
      }).success,
    ).toBe(true)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyWebsite: "rossi.example",
      }).success,
    ).toBe(false)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyEmail: "ops@rossi.example",
      }).success,
    ).toBe(true)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyEmail: "not-an-email",
      }).success,
    ).toBe(false)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyPhone: "+393331111111",
      }).success,
    ).toBe(true)
    expect(
      schema.safeParse({ ...companyAccountFields, companyPhone: "+0123456789" })
        .success,
    ).toBe(false)
  })

  it("caps company identifiers and validates their country/type/value metadata", () => {
    const schema = getProfileSchemaForAccountType("COMPANY")
    const identifier = {
      countryCode: "IT",
      kind: "VAT" as const,
      rawValue: "IT12345678901",
      isPrimary: true,
      isPublic: true,
    }
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyIdentifiers: [identifier],
      }).success,
    ).toBe(true)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyIdentifiers: [{ ...identifier, countryCode: "ITA" }],
      }).success,
    ).toBe(false)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyIdentifiers: [{ ...identifier, rawValue: " " }],
      }).success,
    ).toBe(false)
    expect(
      schema.safeParse({
        ...companyAccountFields,
        companyIdentifiers: Array.from({ length: 13 }, () => identifier),
      }).success,
    ).toBe(false)
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

  it("requires expiry dates for identity/licenses but not certificates and validates metadata format", () => {
    const valid = {
      documentType: "identity" as const,
      expiryDate: "2030-01-01",
      issuingCountry: "IT",
      ownerName: "Giulia Rossi",
    }
    expect(documentMetadataSchema.safeParse(valid).success).toBe(true)
    expect(
      documentMetadataSchema.safeParse({
        ...valid,
        documentType: "license",
        expiryDate: "",
      }).success,
    ).toBe(false)
    expect(
      documentMetadataSchema.safeParse({
        ...valid,
        documentType: "certificate",
        expiryDate: "",
      }).success,
    ).toBe(true)
    expect(
      documentMetadataSchema.safeParse({ ...valid, issuingCountry: "ITA" })
        .success,
    ).toBe(false)
    expect(
      documentMetadataSchema.safeParse({ ...valid, ownerName: "   " }).success,
    ).toBe(false)
    expect(
      documentMetadataSchema.safeParse({ ...valid, expiryDate: "01/01/2030" })
        .success,
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

  it("requires a company id for company select/claim association modes", () => {
    const schema = getProfileSchemaForAccountType("COMPANY")
    expect(
      schema.safeParse({ organizationMode: "select", companyId: "" }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ organizationMode: "claim", companyId: "" }).success,
    ).toBe(false)
    expect(
      schema.safeParse({
        organizationMode: "select",
        companyId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true)
  })
})
