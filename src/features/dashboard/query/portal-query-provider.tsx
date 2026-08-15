"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { portalBootstrapContract } from "./portal-contracts"
import { PortalApiError } from "./portal-browser-api"
import { portalQueryKeys } from "./portal-query-keys"

function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false
  if (error instanceof PortalApiError) {
    return ![
      "authentication",
      "permission",
      "not_found",
      "validation",
      "conflict",
    ].includes(error.kind)
  }
  return true
}

export function PortalQueryProvider({
  children,
  initialBootstrap,
}: {
  children: React.ReactNode
  initialBootstrap: unknown
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          gcTime: 10 * 60_000,
          refetchOnWindowFocus: false,
          retry: shouldRetry,
        },
        mutations: { retry: false },
      },
    })
    const parsed = portalBootstrapContract.safeParse(initialBootstrap)
    if (parsed.success) {
      client.setQueryData(portalQueryKeys.bootstrap(), parsed.data)
    }
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
