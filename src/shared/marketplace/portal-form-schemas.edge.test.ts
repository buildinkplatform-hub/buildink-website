import { describe, expect, it } from "vitest"

import {
  equipmentWebsiteSchema,
  opportunityWebsiteSchema,
  projectWebsiteSchema,
  tenderWebsiteSchema,
} from "./portal-form-schemas"

const uuidA = "11111111-1111-4111-8111-111111111111"
const uuidB = "22222222-2222-4222-8222-222222222222"

const validProject = {
  title: "Office renovation",
  description: "Complete renovation of a commercial office floor.",
  categoryId: uuidA,
  cityId: uuidB,
}

const validTender = {
  title: "Electrical installation tender",
  description: "Supply and installation of complete electrical systems.",
  submissionDeadlineAt: "2030-06-30T12:00:00.000Z",
}

const validOpportunity = {
  kind: "SUBCONTRACT_WORK" as const,
  title: "Drywall subcontract package",
  description:
    "Install drywall partitions across the active construction site.",
}

describe("portal marketplace form edge cases", () => {
  describe("project", () => {
    it("requires meaningful title, description, category and city", () => {
      expect(projectWebsiteSchema.safeParse(validProject).success).toBe(true)
      expect(
        projectWebsiteSchema.safeParse({ ...validProject, title: "A" }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          description: "short",
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          categoryId: "bad-id",
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({ ...validProject, cityId: "bad-id" })
          .success,
      ).toBe(false)
    })

    it("requires latitude and longitude as a pair and enforces geographic bounds", () => {
      expect(
        projectWebsiteSchema.safeParse({ ...validProject, latitude: 45.46 })
          .success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({ ...validProject, longitude: 9.19 })
          .success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          latitude: 45.46,
          longitude: 9.19,
        }).success,
      ).toBe(true)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          latitude: 91,
          longitude: 9.19,
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          latitude: 45.46,
          longitude: 181,
        }).success,
      ).toBe(false)
    })

    it("rejects an end date before the start date", () => {
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          startsAt: "2030-07-10T00:00:00.000Z",
          estimatedEndAt: "2030-07-01T00:00:00.000Z",
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          startsAt: "2030-07-01T00:00:00.000Z",
          estimatedEndAt: "2030-07-10T00:00:00.000Z",
        }).success,
      ).toBe(true)
    })

    it("requires non-compliance scoring criteria to total 100", () => {
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          criteria: [
            {
              label: "Price",
              kind: "COMMERCIAL",
              weight: 60,
              required: true,
              sortOrder: 0,
            },
            {
              label: "Quality",
              kind: "TECHNICAL",
              weight: 30,
              required: true,
              sortOrder: 1,
            },
          ],
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          criteria: [
            {
              label: "Price",
              kind: "COMMERCIAL",
              weight: 60,
              required: true,
              sortOrder: 0,
            },
            {
              label: "Quality",
              kind: "TECHNICAL",
              weight: 40,
              required: true,
              sortOrder: 1,
            },
            {
              label: "Insurance",
              kind: "COMPLIANCE",
              weight: 0,
              required: true,
              sortOrder: 2,
            },
          ],
        }).success,
      ).toBe(true)
    })

    it("rejects malformed money values and collection overflow", () => {
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          budgetMinor: "120000",
        }).success,
      ).toBe(true)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          budgetMinor: "1200.00",
        }).success,
      ).toBe(false)
      expect(
        projectWebsiteSchema.safeParse({
          ...validProject,
          tagIds: Array.from({ length: 21 }, () => uuidA),
        }).success,
      ).toBe(false)
    })
  })

  describe("tender", () => {
    it("requires an official source URL for external official notices", () => {
      expect(tenderWebsiteSchema.safeParse(validTender).success).toBe(true)
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          sourceKind: "EXTERNAL_OFFICIAL",
          sourceUrl: null,
        }).success,
      ).toBe(false)
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          sourceKind: "EXTERNAL_OFFICIAL",
          sourceUrl: "https://authority.example/tenders/123",
        }).success,
      ).toBe(true)
    })

    it("requires a submission deadline and valid URL/currency fields", () => {
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          submissionDeadlineAt: "",
        }).success,
      ).toBe(false)
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          sourceUrl: "not-a-url",
        }).success,
      ).toBe(false)
      expect(
        tenderWebsiteSchema.safeParse({ ...validTender, currency: "EU" })
          .success,
      ).toBe(false)
    })

    it("requires scored tender criteria to total 100 and caps lots", () => {
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          criteria: [
            {
              label: "Price",
              kind: "COMMERCIAL",
              weight: 70,
              required: true,
              sortOrder: 0,
            },
            {
              label: "Method",
              kind: "TECHNICAL",
              weight: 20,
              required: true,
              sortOrder: 1,
            },
          ],
        }).success,
      ).toBe(false)
      expect(
        tenderWebsiteSchema.safeParse({
          ...validTender,
          lots: Array.from({ length: 41 }, (_, index) => ({
            title: `Lot ${index + 1}`,
          })),
        }).success,
      ).toBe(false)
    })
  })

  describe("equipment", () => {
    it("validates year, currency and integer minor-unit money values", () => {
      expect(
        equipmentWebsiteSchema.safeParse({ name: "Tower crane" }).success,
      ).toBe(true)
      expect(equipmentWebsiteSchema.safeParse({ name: "A" }).success).toBe(
        false,
      )
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          yearManufactured: 1899,
        }).success,
      ).toBe(false)
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          yearManufactured: 2101,
        }).success,
      ).toBe(false)
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          currency: "EUR",
        }).success,
      ).toBe(true)
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          currency: "EURO",
        }).success,
      ).toBe(false)
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          dailyRateMinor: "25000",
        }).success,
      ).toBe(true)
      expect(
        equipmentWebsiteSchema.safeParse({
          name: "Tower crane",
          dailyRateMinor: "250.00",
        }).success,
      ).toBe(false)
    })
  })

  describe("opportunity", () => {
    it("requires valid title/description and respects duration/worker bounds", () => {
      expect(opportunityWebsiteSchema.safeParse(validOpportunity).success).toBe(
        true,
      )
      expect(
        opportunityWebsiteSchema.safeParse({ ...validOpportunity, title: "A" })
          .success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          description: "short",
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          durationDays: 0,
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          durationDays: 3651,
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          workersNeeded: 0,
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          workersNeeded: 501,
        }).success,
      ).toBe(false)
    })

    it("rejects malformed budget values, invalid UUIDs and oversized attachment lists", () => {
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          budgetMinMinor: "50000",
        }).success,
      ).toBe(true)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          budgetMinMinor: "500.00",
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          categoryId: "bad-id",
        }).success,
      ).toBe(false)
      expect(
        opportunityWebsiteSchema.safeParse({
          ...validOpportunity,
          attachmentAssetIds: Array.from({ length: 11 }, () => uuidA),
        }).success,
      ).toBe(false)
    })
  })
})
