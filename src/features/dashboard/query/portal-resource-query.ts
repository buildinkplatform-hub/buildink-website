"use client"

import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query"
import type { z } from "zod"

import { portalBrowserRequest } from "./portal-browser-api"
import { portalQueryKeys } from "./portal-query-keys"

export function portalResourceQueryOptions<T>(
  resource: string,
  backendPath: string,
  schema: z.ZodType<T>,
  parameters?: Readonly<Record<string, unknown>>,
  options?: {
    initialData?: T
    staleTime?: number
  },
) {
  return queryOptions({
    queryKey: portalQueryKeys.resource(resource, parameters),
    queryFn: ({ signal }) =>
      portalBrowserRequest(backendPath, schema, { signal }),
    initialData: options?.initialData,
    placeholderData: keepPreviousData,
    staleTime: options?.staleTime,
  })
}

export function usePortalResourceQuery<T>(
  resource: string,
  backendPath: string,
  schema: z.ZodType<T>,
  parameters?: Readonly<Record<string, unknown>>,
  options?: {
    initialData?: T
    staleTime?: number
  },
) {
  return useQuery(
    portalResourceQueryOptions(
      resource,
      backendPath,
      schema,
      parameters,
      options,
    ),
  )
}

export function prefetchPortalResource<T>(
  queryClient: QueryClient,
  resource: string,
  backendPath: string,
  schema: z.ZodType<T>,
  parameters?: Readonly<Record<string, unknown>>,
) {
  return queryClient.prefetchQuery(
    portalResourceQueryOptions(resource, backendPath, schema, parameters),
  )
}
