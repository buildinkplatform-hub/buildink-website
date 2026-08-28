import type { QueryClient, QueryKey } from "@tanstack/react-query"

import { portalQueryKeys } from "./portal-query-keys"

type CacheSnapshot = Array<[QueryKey, unknown]>
type PlainRecord = Record<string, unknown>

function isRecord(value: unknown): value is PlainRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function sameId(value: unknown, id: string) {
  return value !== undefined && value !== null && String(value) === id
}

function patchValue(
  value: unknown,
  id: string,
  patch: PlainRecord,
): { value: unknown; changed: boolean } {
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((entry) => {
      const result = patchValue(entry, id, patch)
      changed ||= result.changed
      return result.value
    })
    return { value: changed ? next : value, changed }
  }
  if (!isRecord(value)) return { value, changed: false }

  let changed = false
  let next: PlainRecord = value
  if (sameId(value.id, id)) {
    next = { ...value, ...patch }
    changed = true
  }
  for (const [key, child] of Object.entries(next)) {
    if (key === "id") continue
    if (!Array.isArray(child) && !isRecord(child)) continue
    const result = patchValue(child, id, patch)
    if (!result.changed) continue
    if (!changed) next = { ...next }
    next[key] = result.value
    changed = true
  }
  return { value: next, changed }
}

function removeValue(
  value: unknown,
  id: string,
): { value: unknown; changed: boolean } {
  if (Array.isArray(value)) {
    let changed = false
    const next: unknown[] = []
    for (const entry of value) {
      if (isRecord(entry) && sameId(entry.id, id)) {
        changed = true
        continue
      }
      const result = removeValue(entry, id)
      changed ||= result.changed
      next.push(result.value)
    }
    return { value: changed ? next : value, changed }
  }
  if (!isRecord(value)) return { value, changed: false }

  let changed = false
  let next: PlainRecord = value
  for (const [key, child] of Object.entries(value)) {
    if (!Array.isArray(child) && !isRecord(child)) continue
    const result = removeValue(child, id)
    if (!result.changed) continue
    if (!changed) next = { ...value }
    next[key] = result.value
    changed = true
  }
  return { value: next, changed }
}

function updatePortalQueries(
  queryClient: QueryClient,
  update: (value: unknown) => { value: unknown; changed: boolean },
): CacheSnapshot {
  const snapshots: CacheSnapshot = []
  for (const [queryKey, current] of queryClient.getQueriesData({
    queryKey: portalQueryKeys.all,
  })) {
    if (current === undefined) continue
    const result = update(current)
    if (!result.changed) continue
    snapshots.push([queryKey, current])
    queryClient.setQueryData(queryKey, result.value)
  }
  return snapshots
}

export function patchPortalEntityCache(
  queryClient: QueryClient,
  id: string,
  patch: PlainRecord,
) {
  return updatePortalQueries(queryClient, (value) =>
    patchValue(value, id, patch),
  )
}

export function removePortalEntityFromCache(
  queryClient: QueryClient,
  id: string,
) {
  return updatePortalQueries(queryClient, (value) => removeValue(value, id))
}

export function restorePortalQuerySnapshots(
  queryClient: QueryClient,
  snapshots: CacheSnapshot,
) {
  for (const [queryKey, value] of snapshots)
    queryClient.setQueryData(queryKey, value)
}

function mergePayloadEntities(
  queryClient: QueryClient,
  value: unknown,
  visited: Set<unknown>,
) {
  if (!value || typeof value !== "object" || visited.has(value)) return
  visited.add(value)

  if (Array.isArray(value)) {
    for (const entry of value) mergePayloadEntities(queryClient, entry, visited)
    return
  }

  const record = value as PlainRecord
  if (record.id !== undefined && record.id !== null) {
    patchPortalEntityCache(queryClient, String(record.id), record)
  }

  for (const child of Object.values(record)) {
    if (child && typeof child === "object") {
      mergePayloadEntities(queryClient, child, visited)
    }
  }
}

export function mergeMutationEntityIntoPortalCache(
  queryClient: QueryClient,
  result: unknown,
) {
  mergePayloadEntities(queryClient, result, new Set())
}
