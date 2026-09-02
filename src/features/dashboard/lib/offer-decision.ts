export type OfferDecision =
  "ACCEPTED" | "REJECTED" | "SHORTLISTED" | "CHANGES_REQUESTED"

const openOfferDecisionStatuses = new Set([
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "SHORTLISTED",
])

/**
 * Mirrors the backend marketplace offer decision policy. UI controls must only
 * expose transitions the API accepts for the offer's current status.
 */
export function canDecideOffer(current: string, next: OfferDecision) {
  if (next === "CHANGES_REQUESTED") {
    return ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED"].includes(current)
  }
  if (next === "SHORTLISTED") {
    return openOfferDecisionStatuses.has(current) && current !== "SHORTLISTED"
  }
  return openOfferDecisionStatuses.has(current)
}

export function hasOfferDecisionActions(status: string) {
  return (
    canDecideOffer(status, "ACCEPTED") ||
    canDecideOffer(status, "REJECTED") ||
    canDecideOffer(status, "SHORTLISTED") ||
    canDecideOffer(status, "CHANGES_REQUESTED")
  )
}
