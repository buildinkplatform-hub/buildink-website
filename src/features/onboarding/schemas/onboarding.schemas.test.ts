import { describe, expect, it } from "vitest"

import { documentMetadataSchema, profileSchemas } from "./onboarding.schemas"

const common = {
  phone: "+393331234567",
  country: "Italy",
  region: "Lombardy",
  city: "Milan",
  preferredLocale: "en",
  contactPreference: "platform_only",
}

describe("onboarding schemas", () => {
  it("validates the five final profile types", () => {
    expect(
      profileSchemas.individual.safeParse({
        ...common,
        bio: "",
        profileVisibility: "public",
        interests: "Renovation",
      }).success,
    ).toBe(true)
    expect(
      profileSchemas.worker.safeParse({
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
      profileSchemas.contractor.safeParse({
        ...common,
        contractorIdentity: "Rossi Contracting",
        primaryTrade: "General construction",
        categories: "Renovation",
        yearsExperience: "12",
        serviceRegions: "Lombardy",
        capabilityStatement: "Commercial renovation contractor.",
        availability: "Four-week lead time",
      }).success,
    ).toBe(true)
    expect(
      profileSchemas.supplier_contact.safeParse({
        ...common,
        jobTitle: "Sales manager",
        organizationMode: "create",
        supplierName: "Build Supply SRL",
        vatNumber: "IT12345678901",
        categories: "Concrete, steel",
        serviceRegions: "Northern Italy",
        businessDescription: "Construction material supplier.",
      }).success,
    ).toBe(true)
    expect(
      profileSchemas.service_provider.safeParse({
        ...common,
        providerIdentity: "Bianchi Engineering",
        categories: "Structural engineering",
        yearsExperience: "10",
        professionalBackground: "Licensed structural engineer.",
        serviceRegions: "Italy",
        capabilityStatement: "Design and site consulting.",
        availability: "Available next month",
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
  })
})
