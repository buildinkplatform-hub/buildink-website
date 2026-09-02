export type OfferTargetKind = "opportunity" | "package" | "lot"

type TargetResult<T> = { items: T[] }

type TargetLoader<T> = (kind: OfferTargetKind) => Promise<TargetResult<T>>

async function loadSafely<T>(loader: TargetLoader<T>, kind: OfferTargetKind) {
  try {
    return await loader(kind)
  } catch {
    return { items: [] as T[] }
  }
}

export async function loadOfferCreateTargets<T>(loader: TargetLoader<T>) {
  const [opportunities, packages, lots] = await Promise.all([
    loadSafely(loader, "opportunity"),
    loadSafely(loader, "package"),
    loadSafely(loader, "lot"),
  ])

  return { opportunities, packages, lots }
}
