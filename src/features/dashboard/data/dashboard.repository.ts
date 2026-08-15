import type {
  DashboardViewModel,
  PortalAccountCounts,
  PortalModule,
  PrimaryAccountType,
  ProfileType,
} from "@/shared/types/platform"

const emptyCounts: PortalAccountCounts = {
  projects: 0,
  opportunities: 0,
  offers: 0,
  applications: 0,
  engagements: 0,
  unreadNotifications: 0,
  savedItems: 0,
}

export interface DashboardCompletion {
  percent: number
  completed: number
  total: number
  items: Array<{ key: string; done: boolean }>
}

export function overviewFromAccount(input: {
  profileType: ProfileType
  primaryAccountType?: PrimaryAccountType | null
  modules: PortalModule[]
  counts?: PortalAccountCounts
  /** Grouped, status-aware counts from GET /me/dashboard. */
  metrics?: Record<string, number>
  completion?: DashboardCompletion
  verificationStatus?: string
  displayName?: string | null
  phone?: string | null
}): DashboardViewModel {
  const counts = input.counts ?? emptyCounts
  const modules = new Set(input.modules)
  const metrics = input.metrics
    ? groupedMetricsFor(input.metrics, input.primaryAccountType)
    : metricsFor(modules, counts, input.primaryAccountType)
  return {
    profileType: input.profileType,
    primaryAccountType: input.primaryAccountType,
    completion: input.completion?.percent ?? profileCompletion(input),
    metrics,
    quickActionKeys: actionsFor(modules, input.primaryAccountType),
    accountOnly: true,
    tasks: [
      {
        titleKey: "dashboard.items.taskTwoTitle",
        descriptionKey: "dashboard.items.taskTwoBody",
        metaKey: "dashboard.items.taskTwoMeta",
      },
    ],
    notifications: [],
  }
}

function profileCompletion(input: {
  verificationStatus?: string
  displayName?: string | null
  phone?: string | null
  primaryAccountType?: PrimaryAccountType | null
  modules?: PortalModule[]
}) {
  let score = 20
  if (input.primaryAccountType) score += 15
  if (input.displayName) score += 20
  if (input.phone) score += 15
  if (
    input.verificationStatus === "VERIFIED" ||
    input.verificationStatus === "verified"
  ) {
    score += 20
  }
  if ((input.modules?.length ?? 0) > 6) score += 10
  return Math.min(100, score)
}

const groupedMetricKeys: Record<
  NonNullable<PrimaryAccountType>,
  Array<{ key: string; tone: "blue" | "green" | "navy" | "orange" }>
> = {
  COMPANY: [
    { key: "activeProjects", tone: "blue" },
    { key: "openTenders", tone: "navy" },
    { key: "submittedOffers", tone: "green" },
    { key: "receivedOffers", tone: "orange" },
  ],
  PROJECT_OWNER: [
    { key: "activeProjects", tone: "blue" },
    { key: "openTenders", tone: "navy" },
    { key: "receivedOffers", tone: "green" },
    { key: "shortlistedReceivedOffers", tone: "orange" },
  ],
  SUBCONTRACTOR: [
    { key: "tenderInvitations", tone: "blue" },
    { key: "submittedOffers", tone: "navy" },
    { key: "shortlistedOffers", tone: "green" },
    { key: "wonOffers", tone: "orange" },
  ],
  SERVICE_PROVIDER: [
    { key: "openOpportunities", tone: "blue" },
    { key: "submittedOffers", tone: "navy" },
    { key: "shortlistedOffers", tone: "green" },
    { key: "wonOffers", tone: "orange" },
  ],
  WORKER: [
    { key: "submittedApplications", tone: "blue" },
    { key: "shortlistedApplications", tone: "navy" },
    { key: "interviewApplications", tone: "green" },
    { key: "hiredApplications", tone: "orange" },
  ],
}

function groupedMetricsFor(
  metrics: Record<string, number>,
  accountType?: PrimaryAccountType | null,
): DashboardViewModel["metrics"] {
  const keys = accountType
    ? groupedMetricKeys[accountType]
    : [
        { key: "activeProjects", tone: "blue" as const },
        { key: "submittedOffers", tone: "navy" as const },
        { key: "unreadMessages", tone: "green" as const },
        { key: "unreadNotifications", tone: "orange" as const },
      ]
  return keys
    .filter(({ key }) => metrics[key] !== undefined)
    .map(({ key, tone }) => ({
      labelKey: `dashboard.metric.${key}`,
      value: String(metrics[key]),
      tone,
    }))
}

function metricsFor(
  modules: Set<PortalModule>,
  counts: PortalAccountCounts,
  accountType?: PrimaryAccountType | null,
) {
  const metrics: DashboardViewModel["metrics"] = []
  if (accountType === "WORKER" && modules.has("applications")) {
    metrics.push({
      labelKey: "dashboard.metric.applications",
      value: String(counts.applications),
      tone: "green",
    })
  }
  if (modules.has("projects")) {
    metrics.push({
      labelKey: "dashboard.metric.activeProjects",
      value: String(counts.projects),
      tone: "blue",
    })
  }
  if (modules.has("offers")) {
    metrics.push({
      labelKey: "dashboard.metric.offers",
      value: String(counts.offers),
      tone: "green",
    })
  }
  if (accountType !== "WORKER" && modules.has("applications")) {
    metrics.push({
      labelKey: "dashboard.metric.applications",
      value: String(counts.applications),
      tone: "green",
    })
  }
  if (modules.has("opportunities")) {
    metrics.push({
      labelKey: "dashboard.metric.opportunities",
      value: String(counts.opportunities),
      tone: "navy",
    })
  }
  if (modules.has("engagements")) {
    metrics.push({
      labelKey: "dashboard.metric.engagements",
      value: String(counts.engagements),
      tone: "orange",
    })
  }
  metrics.push({
    labelKey: "dashboard.metric.savedItems",
    value: String(counts.savedItems),
    tone: "navy",
  })
  metrics.push({
    labelKey: "dashboard.metric.unreadNotifications",
    value: String(counts.unreadNotifications),
    tone: "orange",
  })
  return metrics.slice(0, 4)
}

function actionsFor(
  modules: Set<PortalModule>,
  accountType?: PrimaryAccountType | null,
) {
  const actions: string[] = []
  switch (accountType) {
    case "COMPANY":
      if (modules.has("projects")) actions.push("publishProject")
      if (modules.has("tenders")) actions.push("browseTenders")
      if (modules.has("workforce")) actions.push("requestWorkers")
      break
    case "PROJECT_OWNER":
      if (modules.has("projects")) actions.push("publishProject")
      if (modules.has("tenders")) actions.push("browseTenders")
      if (modules.has("offers")) actions.push("createProposal")
      break
    case "SUBCONTRACTOR":
      if (modules.has("tenders")) actions.push("browseTenders")
      if (modules.has("offers")) actions.push("createProposal")
      if (modules.has("verification")) actions.push("addCertificate")
      break
    case "SERVICE_PROVIDER":
      if (modules.has("offers")) actions.push("createProposal")
      if (modules.has("tenders")) actions.push("browseTenders")
      if (modules.has("verification")) actions.push("addCertificate")
      break
    case "WORKER":
      if (modules.has("workforce")) actions.push("updateAvailability")
      if (modules.has("opportunities")) actions.push("browseTenders")
      if (modules.has("verification")) actions.push("addCertificate")
      break
    case undefined:
    case null:
      if (modules.has("projects")) actions.push("publishProject")
      if (modules.has("offers")) actions.push("createProposal")
      if (modules.has("tenders")) actions.push("browseTenders")
      break
    default: {
      const exhaustive: never = accountType
      return exhaustive
    }
  }
  if (!actions.length && modules.has("verification"))
    actions.push("addCertificate")
  return actions.slice(0, 3)
}
