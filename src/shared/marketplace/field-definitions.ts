export type FieldInputType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "date"
  | "datetime"
  | "boolean"
  | "enum"
  | "uuid"
  | "url"
  | "email"
  | "collection";

export type MarketplaceEntity =
  | "project"
  | "opportunity"
  | "tender"
  | "equipment"
  | "offer"
  | "application"
  | "catalogue"
  | "company"
  | "engagement";

export interface FieldSurface {
  create: boolean;
  edit: boolean;
  read: boolean;
}

export interface EntityFieldDefinition {
  key: string;
  labelKey: string;
  inputType: FieldInputType;
  portal: FieldSurface;
  admin: FieldSurface;
}

export const marketplaceEntityFields: Record<
  MarketplaceEntity,
  EntityFieldDefinition[]
> = {
  project: [
    {
      key: "title",
      labelKey: "fields.title",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "reference",
      labelKey: "fields.reference",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "categoryId",
      labelKey: "fields.category",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "cityId",
      labelKey: "fields.city",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "countryCode",
      labelKey: "fields.country",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "budgetMinor",
      labelKey: "fields.budget",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "budgetPublic",
      labelKey: "fields.budgetPublic",
      inputType: "boolean",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "currency",
      labelKey: "fields.currency",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "deadlineAt",
      labelKey: "fields.deadline",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "startsAt",
      labelKey: "fields.startsAt",
      inputType: "date",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "estimatedEndAt",
      labelKey: "fields.estimatedEndAt",
      inputType: "date",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "actualEndAt",
      labelKey: "fields.actualEndAt",
      inputType: "date",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: false },
    },
    {
      key: "addressLine1",
      labelKey: "fields.addressLine1",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "postalCode",
      labelKey: "fields.postalCode",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "latitude",
      labelKey: "fields.latitude",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "longitude",
      labelKey: "fields.longitude",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "projectStage",
      labelKey: "fields.projectStage",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "procurementStage",
      labelKey: "fields.procurementStage",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "sustainabilityTargets",
      labelKey: "fields.sustainabilityTargets",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "accessibilityRequirements",
      labelKey: "fields.accessibilityRequirements",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "tagIds",
      labelKey: "fields.tags",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "packages",
      labelKey: "fields.packages",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "criteria",
      labelKey: "fields.criteria",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "media",
      labelKey: "fields.media",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "publicationStatus",
      labelKey: "fields.publicationStatus",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "status",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "updatedAt",
      labelKey: "fields.updatedAt",
      inputType: "datetime",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
  ],
  opportunity: [
    {
      key: "title",
      labelKey: "fields.title",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: true, read: true },
    },
    {
      key: "kind",
      labelKey: "fields.kind",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "summary",
      labelKey: "fields.summary",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "categoryId",
      labelKey: "fields.category",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "professionId",
      labelKey: "fields.profession",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "cityId",
      labelKey: "fields.city",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "deadlineAt",
      labelKey: "fields.deadline",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: true, read: true },
    },
    {
      key: "durationDays",
      labelKey: "fields.durationDays",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "budgetMinMinor",
      labelKey: "fields.budgetMin",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "budgetMaxMinor",
      labelKey: "fields.budgetMax",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "employmentType",
      labelKey: "fields.employmentType",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "workArrangement",
      labelKey: "fields.workArrangement",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "workersNeeded",
      labelKey: "fields.workersNeeded",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "statusV1",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: true, read: true },
    },
    {
      key: "publicationStatus",
      labelKey: "fields.publicationStatus",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: true, read: true },
    },
  ],
  tender: [
    {
      key: "title",
      labelKey: "fields.title",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "reference",
      labelKey: "fields.reference",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "sourceKind",
      labelKey: "fields.sourceKind",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "submissionChannel",
      labelKey: "fields.submissionChannel",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "noticeType",
      labelKey: "fields.noticeType",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "sourceUrl",
      labelKey: "fields.sourceUrl",
      inputType: "url",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "sourceAuthority",
      labelKey: "fields.sourceAuthority",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "visibility",
      labelKey: "fields.visibility",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "cityId",
      labelKey: "fields.city",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "valueMinor",
      labelKey: "fields.value",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "procurementMethod",
      labelKey: "fields.procurementMethod",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "inquiryDeadlineAt",
      labelKey: "fields.inquiryDeadline",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "submissionDeadlineAt",
      labelKey: "fields.submissionDeadline",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "evaluationAt",
      labelKey: "fields.evaluationAt",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "awardAt",
      labelKey: "fields.awardAt",
      inputType: "datetime",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "submissionMethod",
      labelKey: "fields.submissionMethod",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "eligibility",
      labelKey: "fields.eligibility",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "awardCriteria",
      labelKey: "fields.awardCriteria",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "lots",
      labelKey: "fields.lots",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "criteria",
      labelKey: "fields.criteria",
      inputType: "collection",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "publicationStatus",
      labelKey: "fields.publicationStatus",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "status",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
  ],
  equipment: [
    {
      key: "name",
      labelKey: "fields.name",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "listingType",
      labelKey: "fields.listingType",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "categoryId",
      labelKey: "fields.category",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "cityId",
      labelKey: "fields.city",
      inputType: "uuid",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "condition",
      labelKey: "fields.condition",
      inputType: "enum",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "brand",
      labelKey: "fields.brand",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "model",
      labelKey: "fields.model",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "serialNumber",
      labelKey: "fields.serialNumber",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "yearManufactured",
      labelKey: "fields.yearManufactured",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "dailyRateMinor",
      labelKey: "fields.dailyRate",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "weeklyRateMinor",
      labelKey: "fields.weeklyRate",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "monthlyRateMinor",
      labelKey: "fields.monthlyRate",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "salePriceMinor",
      labelKey: "fields.salePrice",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "operatorIncluded",
      labelKey: "fields.operatorIncluded",
      inputType: "boolean",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "deliveryAvailable",
      labelKey: "fields.deliveryAvailable",
      inputType: "boolean",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "ratePublic",
      labelKey: "fields.ratePublic",
      inputType: "boolean",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "publicationStatus",
      labelKey: "fields.publicationStatus",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: true, edit: true, read: true },
    },
  ],
  offer: [
    {
      key: "reference",
      labelKey: "fields.reference",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "title",
      labelKey: "fields.title",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "coverMessage",
      labelKey: "fields.coverMessage",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "scopeDescription",
      labelKey: "fields.scope",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "assumptions",
      labelKey: "fields.assumptions",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "exclusions",
      labelKey: "fields.exclusions",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "proposedPriceMinor",
      labelKey: "fields.proposedPrice",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "totalPriceMinor",
      labelKey: "fields.totalPrice",
      inputType: "money",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "currency",
      labelKey: "fields.currency",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "status",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: true, read: true },
    },
    {
      key: "revisionCount",
      labelKey: "fields.revisionCount",
      inputType: "number",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
  ],
  application: [
    {
      key: "reference",
      labelKey: "fields.reference",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "coverMessage",
      labelKey: "fields.coverMessage",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "availabilityDate",
      labelKey: "fields.availabilityDate",
      inputType: "date",
      portal: { create: true, edit: true, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "status",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
  ],
  catalogue: [
    {
      key: "name",
      labelKey: "fields.name",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "offeringType",
      labelKey: "fields.offeringType",
      inputType: "enum",
      portal: { create: true, edit: false, read: true },
      admin: { create: true, edit: false, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "sku",
      labelKey: "fields.sku",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "unitOfMeasure",
      labelKey: "fields.unitOfMeasure",
      inputType: "text",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "moq",
      labelKey: "fields.moq",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "leadTimeDays",
      labelKey: "fields.leadTimeDays",
      inputType: "number",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "priceOnRequest",
      labelKey: "fields.priceOnRequest",
      inputType: "boolean",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "indicativePriceMinor",
      labelKey: "fields.indicativePrice",
      inputType: "money",
      portal: { create: true, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
  ],
  company: [
    {
      key: "name",
      labelKey: "fields.name",
      inputType: "text",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "legalName",
      labelKey: "fields.legalName",
      inputType: "text",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "registrationNumber",
      labelKey: "fields.registrationNumber",
      inputType: "text",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "vatNumber",
      labelKey: "fields.vatNumber",
      inputType: "text",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "description",
      labelKey: "fields.description",
      inputType: "textarea",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "email",
      labelKey: "fields.email",
      inputType: "email",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "phone",
      labelKey: "fields.phone",
      inputType: "text",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
    {
      key: "website",
      labelKey: "fields.website",
      inputType: "url",
      portal: { create: false, edit: true, read: true },
      admin: { create: true, edit: true, read: true },
    },
  ],
  engagement: [
    {
      key: "reference",
      labelKey: "fields.reference",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "title",
      labelKey: "fields.title",
      inputType: "text",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "scopeSummary",
      labelKey: "fields.scope",
      inputType: "textarea",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "agreedPriceMinor",
      labelKey: "fields.agreedPrice",
      inputType: "money",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
    {
      key: "status",
      labelKey: "fields.status",
      inputType: "enum",
      portal: { create: false, edit: false, read: true },
      admin: { create: false, edit: false, read: true },
    },
  ],
};

export function getReadableFields(
  entity: MarketplaceEntity,
  surface: "portal" | "admin",
): EntityFieldDefinition[] {
  return marketplaceEntityFields[entity].filter((field) =>
    surface === "portal" ? field.portal.read : field.admin.read,
  );
}

export function getEditableFields(
  entity: MarketplaceEntity,
  surface: "portal" | "admin",
): EntityFieldDefinition[] {
  return marketplaceEntityFields[entity].filter((field) =>
    surface === "portal" ? field.portal.edit : field.admin.edit,
  );
}

export function getFormFields(
  entity: MarketplaceEntity,
  surface: "portal" | "admin",
  mode: "create" | "edit",
): EntityFieldDefinition[] {
  return marketplaceEntityFields[entity].filter((field) =>
    surface === "portal" ? field.portal[mode] : field.admin[mode],
  );
}
