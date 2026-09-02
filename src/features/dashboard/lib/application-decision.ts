export const applicationHiringStages = [
  "UNDER_REVIEW",
  "SHORTLISTED",
  "CONTACTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
] as const

export type ApplicationHiringStage = (typeof applicationHiringStages)[number]
export type ApplicationDecision =
  ApplicationHiringStage | "ACCEPTED" | "REJECTED"

const openStatuses = new Set([
  "SUBMITTED",
  "VIEWED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "CONTACTED",
  "INTERVIEW",
  "OFFERED",
])

const stageOrder = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "CONTACTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
] as const

export function canDecideApplication(
  current: string,
  next: ApplicationDecision,
) {
  if (!openStatuses.has(current)) return false
  if (next === "REJECTED") return true
  if (next === "ACCEPTED") return current !== "SUBMITTED"

  return (
    stageOrder.indexOf(next) >
    stageOrder.indexOf(current as (typeof stageOrder)[number])
  )
}

export function availableApplicationStages(current: string) {
  return applicationHiringStages.filter((stage) =>
    canDecideApplication(current, stage),
  )
}

export function canWithdrawApplication(status: string) {
  return !["ACCEPTED", "HIRED", "WITHDRAWN", "EXPIRED"].includes(status)
}
