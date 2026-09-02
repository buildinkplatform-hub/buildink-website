type OfferAmountLike = {
  totalPriceMinor?: string | null
  proposedPriceMinor?: string | null
  currency?: string | null
}

export function formatOfferAmount(offer: OfferAmountLike, locale: string) {
  const minor = offer.totalPriceMinor ?? offer.proposedPriceMinor
  if (minor === null || minor === undefined || minor === "") return "-"

  const numericMinor = Number(minor)
  if (!Number.isFinite(numericMinor)) return "-"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: offer.currency ?? "EUR",
  }).format(numericMinor / 100)
}
