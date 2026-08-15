import { z } from "zod";

const uuid = z.string().uuid();
const nullableText = z.string().trim().nullable().optional();
const nullableUuid = uuid.nullable().optional();
const money = z
  .string()
  .regex(/^\d+$/, "Money must be a decimal-string of minor units")
  .nullable()
  .optional();

const criterionKind = z.enum(["COMPLIANCE", "TECHNICAL", "COMMERCIAL"]);

export const projectPackageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: nullableText,
  categoryId: nullableUuid,
  quantity: z.number().positive().nullable().optional(),
  unit: nullableText,
  budgetMinor: money,
  currency: z.string().trim().length(3).nullable().optional(),
});

export const projectCriterionSchema = z.object({
  label: z.string().trim().min(2).max(250),
  description: nullableText,
  kind: criterionKind,
  weight: z.number().min(0).max(100),
  required: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export const projectMediaSchema = z.object({
  assetId: uuid,
  usage: z.enum(["IMAGE", "DOCUMENT", "LOGO", "COVER"]),
  position: z.number().int().nonnegative(),
});

export const projectWebsiteObject = z.object({
  ownerCompanyId: nullableUuid,
  ownerProfileId: nullableUuid,
  title: z.string().trim().min(3).max(250),
  description: z.string().trim().min(10).max(20000),
  categoryId: uuid,
  cityId: uuid,
  countryCode: z.string().trim().length(2).optional(),
  addressLine1: nullableText,
  postalCode: nullableText,
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  budgetMinor: money,
  budgetPublic: z.boolean().optional(),
  currency: z.string().trim().length(3).nullable().optional(),
  startsAt: nullableText,
  estimatedEndAt: nullableText,
  deadlineAt: nullableText,
  projectStage: nullableText,
  procurementStage: nullableText,
  sustainabilityTargets: z.record(z.string(), z.unknown()).optional(),
  accessibilityRequirements: z.record(z.string(), z.unknown()).optional(),
  tagIds: z.array(uuid).max(20).optional(),
  packages: z.array(projectPackageSchema).max(40).optional(),
  criteria: z.array(projectCriterionSchema).max(20).optional(),
  media: z.array(projectMediaSchema).max(30).optional(),
  publish: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

function refineProjectFields(
  value: {
    latitude?: number | null;
    longitude?: number | null;
    startsAt?: string | null;
    estimatedEndAt?: string | null;
    criteria?: Array<{ kind: string; weight: number }>;
  },
  context: z.RefinementCtx,
) {
  if ((value.latitude == null) !== (value.longitude == null)) {
    context.addIssue({
      code: "custom",
      message: "Latitude and longitude must be provided together",
      path: [value.latitude == null ? "latitude" : "longitude"],
    });
  }
  if (
    value.startsAt &&
    value.estimatedEndAt &&
    new Date(value.estimatedEndAt) < new Date(value.startsAt)
  ) {
    context.addIssue({
      code: "custom",
      message: "Estimated end date must follow the start date",
      path: ["estimatedEndAt"],
    });
  }
  const scoredWeight = (value.criteria ?? [])
    .filter((criterion) => criterion.kind !== "COMPLIANCE")
    .reduce((total, criterion) => total + criterion.weight, 0);
  if (scoredWeight !== 0 && Math.abs(scoredWeight - 100) > 0.001) {
    context.addIssue({
      code: "custom",
      message: "Scored criteria must total 100",
      path: ["criteria"],
    });
  }
}

export const projectWebsiteSchema = projectWebsiteObject.superRefine(
  refineProjectFields,
);

export const tenderLotSchema = z.object({
  title: z.string().trim().min(2).max(200),
  reference: z.string().trim().max(100).optional().nullable(),
  description: nullableText,
  categoryId: nullableUuid,
  valueMinor: money,
  currency: z.string().trim().length(3).nullable().optional(),
});

export const tenderCriterionSchema = projectCriterionSchema;

export const tenderWebsiteObject = z.object({
  organizationCompanyId: nullableUuid,
  title: z.string().trim().min(3).max(250),
  description: z.string().trim().min(10).max(20000),
  sourceKind: z.enum(["BUILDINK", "EXTERNAL_OFFICIAL"]).default("BUILDINK"),
  submissionChannel: z
    .enum(["BUILDINK_OFFER", "EXTERNAL_REDIRECT"])
    .optional()
    .nullable(),
  noticeType: nullableText,
  sourceUrl: z.string().trim().url().max(1000).optional().nullable(),
  sourceAuthority: nullableText,
  cityId: nullableUuid,
  categoryId: nullableUuid,
  visibility: z.enum(["PUBLIC", "INVITED"]).optional(),
  valueMinor: money,
  currency: z.string().trim().length(3).nullable().optional(),
  procurementMethod: z
    .enum(["OPEN", "SELECTIVE", "LIMITED", "DIRECT"])
    .optional()
    .nullable(),
  inquiryDeadlineAt: nullableText,
  submissionDeadlineAt: z.string().min(1),
  evaluationAt: nullableText,
  awardAt: nullableText,
  submissionMethod: nullableText,
  eligibility: z.record(z.string(), z.unknown()).optional(),
  awardCriteria: z.record(z.string(), z.unknown()).optional(),
  lots: z.array(tenderLotSchema).max(40).optional(),
  criteria: z.array(tenderCriterionSchema).max(20).optional(),
  publish: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

export const tenderWebsiteSchema = tenderWebsiteObject.superRefine(
  (value, context) => {
    if (value.sourceKind === "EXTERNAL_OFFICIAL" && !value.sourceUrl) {
      context.addIssue({
        code: "custom",
        message: "Official notices require a source URL",
        path: ["sourceUrl"],
      });
    }
    const scoredWeight = (value.criteria ?? [])
      .filter((criterion) => criterion.kind !== "COMPLIANCE")
      .reduce((total, criterion) => total + criterion.weight, 0);
    if (scoredWeight !== 0 && Math.abs(scoredWeight - 100) > 0.001) {
      context.addIssue({
        code: "custom",
        message: "Scored criteria must total 100",
        path: ["criteria"],
      });
    }
  },
);

export const equipmentWebsiteObject = z.object({
  ownerCompanyId: nullableUuid,
  ownerProfileId: nullableUuid,
  name: z.string().trim().min(2).max(250),
  description: nullableText,
  listingType: z.enum(["RENT", "SALE", "RENT_AND_SALE"]).default("RENT"),
  condition: z
    .enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "NEEDS_REPAIR"])
    .optional()
    .nullable(),
  categoryId: nullableUuid,
  cityId: nullableUuid,
  brand: nullableText,
  model: nullableText,
  serialNumber: nullableText,
  yearManufactured: z.number().int().min(1900).max(2100).nullable().optional(),
  dailyRateMinor: money,
  weeklyRateMinor: money,
  monthlyRateMinor: money,
  salePriceMinor: money,
  ratePublic: z.boolean().optional(),
  operatorIncluded: z.boolean().optional(),
  deliveryAvailable: z.boolean().optional(),
  currency: z.string().trim().length(3).nullable().optional(),
  publish: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

export const equipmentWebsiteSchema = equipmentWebsiteObject;

export const opportunityWebsiteObject = z.object({
  kind: z.enum([
    "SUBCONTRACT_WORK",
    "PROFESSIONAL_SERVICE",
    "MATERIAL_SUPPLY",
    "EQUIPMENT_REQUEST",
    "WORKFORCE_REQUEST",
  ]),
  companyId: nullableUuid,
  ownerProfileId: nullableUuid,
  title: z.string().trim().min(3).max(250),
  description: z.string().trim().min(10).max(20000),
  summary: nullableText,
  categoryId: nullableUuid,
  professionId: nullableUuid,
  cityId: nullableUuid,
  deadlineAt: nullableText,
  durationDays: z.number().int().min(1).max(3650).nullable().optional(),
  budgetMinMinor: money,
  budgetMaxMinor: money,
  currency: z.string().trim().length(3).nullable().optional(),
  quantity: z.number().positive().nullable().optional(),
  unit: nullableText,
  employmentType: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "TEMPORARY",
      "CONTRACT",
      "SEASONAL",
      "APPRENTICE",
      "DAY_LABOUR",
    ])
    .optional()
    .nullable(),
  workArrangement: z
    .enum(["ON_SITE", "HYBRID", "REMOTE", "MOBILE"])
    .optional()
    .nullable(),
  workersNeeded: z.number().int().min(1).max(500).nullable().optional(),
  materialSpecifications: nullableText,
  equipmentSpecifications: nullableText,
  attachmentAssetIds: z.array(uuid).max(10).optional(),
  publish: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

export const opportunityWebsiteSchema = opportunityWebsiteObject;

const OWNERSHIP_OR_CONTROL_KEYS = new Set([
  "ownerCompanyId",
  "ownerProfileId",
  "organizationCompanyId",
  "companyId",
  "publish",
  "version",
  "attachmentAssetIds",
  "submissionChannel",
]);

export function websiteSchemaKeys(shape: Record<string, unknown>) {
  return Object.keys(shape);
}

export function websiteAuthoringKeys(shape: Record<string, unknown>) {
  return Object.keys(shape).filter(
    (key) => !OWNERSHIP_OR_CONTROL_KEYS.has(key),
  );
}

export type ProjectWebsiteInput = z.infer<typeof projectWebsiteSchema>;
export type TenderWebsiteInput = z.infer<typeof tenderWebsiteSchema>;
export type EquipmentWebsiteInput = z.infer<typeof equipmentWebsiteSchema>;
export type OpportunityWebsiteInput = z.infer<typeof opportunityWebsiteSchema>;
