"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  mergeMutationEntityIntoPortalCache,
  patchPortalEntityCache,
  removePortalEntityFromCache,
  restorePortalQuerySnapshots,
} from "./portal-query-cache"

type PortalMutationResult = {
  ok: boolean
  message?: string
  [key: string]: unknown
}

type OptimisticChange =
  | { id: string; patch: Record<string, unknown>; remove?: false }
  | { id: string; remove: true; patch?: never }

export function usePortalMutationRunner() {
  const queryClient = useQueryClient()

  return useCallback(
    async <T extends PortalMutationResult>(
      action: () => Promise<T>,
      options?: {
        optimistic?: OptimisticChange | OptimisticChange[]
        onSuccess?: (result: T) => void | Promise<void>
        onError?: (result?: T) => void | Promise<void>
      },
    ) => {
      const changes = options?.optimistic
        ? Array.isArray(options.optimistic)
          ? options.optimistic
          : [options.optimistic]
        : []
      const snapshots = changes.flatMap((change) =>
        change.remove
          ? removePortalEntityFromCache(queryClient, change.id)
          : patchPortalEntityCache(queryClient, change.id, change.patch),
      )

      let result: T | undefined
      try {
        result = await action()
        if (!result.ok) {
          restorePortalQuerySnapshots(queryClient, [...snapshots].reverse())
          await options?.onError?.(result)
          return result
        }
        mergeMutationEntityIntoPortalCache(queryClient, result)
        await options?.onSuccess?.(result)
        return result
      } catch (error) {
        restorePortalQuerySnapshots(queryClient, [...snapshots].reverse())
        await options?.onError?.(result)
        throw error
      }
    },
    [queryClient],
  )
}
