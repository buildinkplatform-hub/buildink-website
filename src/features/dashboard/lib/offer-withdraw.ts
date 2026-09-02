const nonWithdrawableOfferStatuses = new Set([
  "ACCEPTED",
  "WITHDRAWN",
  "EXPIRED",
  "CANCELLED",
])

export function canWithdrawOffer(status: string) {
  return !nonWithdrawableOfferStatuses.has(status)
}
