import type { DashboardViewModel, ProfileType } from "@/shared/types/platform"

const profileTypeData: Record<
  ProfileType,
  Pick<DashboardViewModel, "completion" | "metrics" | "quickActionKeys">
> = {
  contractor: {
    completion: 78,
    metrics: [
      { labelKey: "dashboard.metric.activeProjects", value: "4", tone: "blue" },
      { labelKey: "dashboard.metric.newProposals", value: "12", tone: "green" },
      {
        labelKey: "dashboard.metric.matchedWorkers",
        value: "28",
        tone: "navy",
      },
      {
        labelKey: "dashboard.metric.profileViews",
        value: "184",
        tone: "orange",
      },
    ],
    quickActionKeys: ["publishProject", "requestWorkers"],
  },
  service_provider: {
    completion: 84,
    metrics: [
      { labelKey: "dashboard.metric.openTenders", value: "19", tone: "blue" },
      {
        labelKey: "dashboard.metric.submittedProposals",
        value: "7",
        tone: "green",
      },
      { labelKey: "dashboard.metric.savedItems", value: "14", tone: "navy" },
      {
        labelKey: "dashboard.metric.responseRate",
        value: "92%",
        tone: "orange",
      },
    ],
    quickActionKeys: ["browseTenders", "createProposal"],
  },
  worker: {
    completion: 68,
    metrics: [
      { labelKey: "dashboard.metric.matchedJobs", value: "9", tone: "blue" },
      { labelKey: "dashboard.metric.applications", value: "3", tone: "green" },
      {
        labelKey: "dashboard.metric.profileSearches",
        value: "47",
        tone: "navy",
      },
      {
        labelKey: "dashboard.metric.availability",
        value: "Open",
        tone: "orange",
      },
    ],
    quickActionKeys: ["updateAvailability", "addCertificate"],
  },
  supplier_contact: {
    completion: 72,
    metrics: [
      { labelKey: "dashboard.metric.catalogItems", value: "36", tone: "blue" },
      { labelKey: "dashboard.metric.newRequests", value: "8", tone: "green" },
      { labelKey: "dashboard.metric.productViews", value: "216", tone: "navy" },
      {
        labelKey: "dashboard.metric.responseRate",
        value: "88%",
        tone: "orange",
      },
    ],
    quickActionKeys: ["addCatalogItem", "reviewRequests"],
  },
  individual: {
    completion: 76,
    metrics: [
      {
        labelKey: "dashboard.metric.savedItems",
        value: "11",
        tone: "blue",
      },
      { labelKey: "dashboard.metric.matchedJobs", value: "6", tone: "green" },
      {
        labelKey: "dashboard.metric.profileSearches",
        value: "42",
        tone: "navy",
      },
      {
        labelKey: "dashboard.metric.profileViews",
        value: "129",
        tone: "orange",
      },
    ],
    quickActionKeys: ["updateAvailability", "addCertificate"],
  },
}

const sharedItems = {
  tasks: [
    {
      titleKey: "dashboard.items.taskOneTitle",
      descriptionKey: "dashboard.items.taskOneBody",
      metaKey: "dashboard.items.taskOneMeta",
    },
    {
      titleKey: "dashboard.items.taskTwoTitle",
      descriptionKey: "dashboard.items.taskTwoBody",
      metaKey: "dashboard.items.taskTwoMeta",
    },
  ],
  notifications: [
    {
      titleKey: "dashboard.items.noticeOneTitle",
      descriptionKey: "dashboard.items.noticeOneBody",
      metaKey: "dashboard.items.noticeOneMeta",
    },
    {
      titleKey: "dashboard.items.noticeTwoTitle",
      descriptionKey: "dashboard.items.noticeTwoBody",
      metaKey: "dashboard.items.noticeTwoMeta",
    },
  ],
}

export interface DashboardRepository {
  getOverview(profileType: ProfileType): Promise<DashboardViewModel>
}

export const demoDashboardRepository: DashboardRepository = {
  async getOverview(profileType) {
    return {
      profileType,
      ...profileTypeData[profileType],
      ...sharedItems,
    }
  },
}
