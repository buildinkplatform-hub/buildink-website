"use client"

import { queryOptions, useQuery } from "@tanstack/react-query"
import { z } from "zod"

import type {
  PortalSavedItem,
  PortalSavedSearch,
} from "@/features/dashboard/data/portal-client"
import { portalBrowserRequest } from "./portal-browser-api"
import { portalQueryKeys } from "./portal-query-keys"

const savedItemSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  label: z.string().nullable(),
  metadata: z
    .object({
      slug: z.string().optional(),
      module: z.string().optional(),
      kind: z.string().optional(),
    })
    .optional(),
  createdAt: z.string(),
})

const savedSearchSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  query: z.string().nullable(),
  version: z.number(),
  alert: z.object({
    enabled: z.boolean(),
    frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY", "MONTHLY"]),
    emailEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
  }),
})

const savedItemsSchema = z.object({ items: z.array(savedItemSchema) })
const savedSearchesSchema = z.object({ items: z.array(savedSearchSchema) })

export function savedItemsQueryOptions(initialData?: {
  items: PortalSavedItem[]
}) {
  return queryOptions({
    queryKey: portalQueryKeys.resource("saved-items"),
    queryFn: ({ signal }) =>
      portalBrowserRequest("/api/v1/me/saved-items", savedItemsSchema, {
        signal,
      }) as Promise<{
        items: PortalSavedItem[]
      }>,
    initialData,
    staleTime: 5 * 60_000,
  })
}

export function useSavedItemsQuery(initialData?: { items: PortalSavedItem[] }) {
  return useQuery(savedItemsQueryOptions(initialData))
}

export function savedSearchesQueryOptions(initialData?: {
  items: PortalSavedSearch[]
}) {
  return queryOptions({
    queryKey: portalQueryKeys.resource("saved-searches"),
    queryFn: ({ signal }) =>
      portalBrowserRequest("/api/v1/me/saved-searches", savedSearchesSchema, {
        signal,
      }) as Promise<{
        items: PortalSavedSearch[]
      }>,
    initialData,
    staleTime: 5 * 60_000,
  })
}

export function useSavedSearchesQuery(initialData?: {
  items: PortalSavedSearch[]
}) {
  return useQuery(savedSearchesQueryOptions(initialData))
}
