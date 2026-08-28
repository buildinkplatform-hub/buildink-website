"use client"

import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query"
import { z } from "zod"

import type {
  PortalPaged,
  PortalSupportTicket,
} from "@/features/dashboard/data/portal-client"
import { portalBrowserRequest } from "@/features/dashboard/query/portal-browser-api"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"

const supportMessageSchema = z.object({
  id: z.string(),
  author: z.string(),
  body: z.string(),
  createdAt: z.string(),
})

export const portalSupportTicketSchema = z.object({
  id: z.string(),
  reference: z.string(),
  subject: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  assigneeName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dueAt: z.string(),
  resolutionNote: z.string().optional(),
  slaState: z.string(),
  messages: z.array(supportMessageSchema).optional(),
})

const portalSupportListSchema = z.object({
  items: z.array(portalSupportTicketSchema),
  pageInfo: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    hasNextPage: z.boolean(),
  }),
})

export function portalSupportListQueryOptions(
  page: number,
  initialData?: PortalPaged<PortalSupportTicket>,
) {
  const safePage = Math.max(1, page)
  return queryOptions({
    queryKey: portalQueryKeys.resource("support-tickets", { page: safePage }),
    queryFn: ({ signal }) =>
      portalBrowserRequest(
        `/api/v1/me/support/tickets?page=${safePage}&pageSize=10`,
        portalSupportListSchema,
        { signal },
      ) as Promise<PortalPaged<PortalSupportTicket>>,
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  })
}

export function usePortalSupportTickets(
  page: number,
  initialData?: PortalPaged<PortalSupportTicket>,
) {
  return useQuery(portalSupportListQueryOptions(page, initialData))
}

export function prefetchPortalSupportTickets(
  queryClient: QueryClient,
  page: number,
) {
  return queryClient.prefetchQuery(portalSupportListQueryOptions(page))
}

export function portalSupportDetailQueryOptions(
  id: string,
  initialData?: PortalSupportTicket,
) {
  return queryOptions({
    queryKey: portalQueryKeys.resource("support-ticket", { id }),
    queryFn: ({ signal }) =>
      portalBrowserRequest(
        `/api/v1/me/support/tickets/${id}`,
        portalSupportTicketSchema,
        { signal },
      ) as Promise<PortalSupportTicket>,
    initialData,
    staleTime: 2 * 60_000,
  })
}

export function usePortalSupportTicket(
  id: string,
  initialData?: PortalSupportTicket,
) {
  return useQuery(portalSupportDetailQueryOptions(id, initialData))
}

export function prefetchPortalSupportTicket(
  queryClient: QueryClient,
  id: string,
) {
  return queryClient.prefetchQuery(portalSupportDetailQueryOptions(id))
}
