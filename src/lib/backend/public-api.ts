import "server-only"

import { BackendApiError, type BackendEnvelope } from "@/lib/backend/api"

export async function publicBackendApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${process.env.BACKEND_API_URL ?? "http://localhost:4000"}${path}`,
    {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(8_000),
    },
  )

  const payload = (await response.json()) as BackendEnvelope<T> & {
    error?: { code?: string; message?: string; details?: unknown }
  }

  if (!response.ok || !payload.success) {
    throw new BackendApiError(
      response.status,
      payload.error?.code ?? `HTTP_${response.status}`,
      payload.error?.message ?? "The backend request failed",
      payload.error?.details,
    )
  }

  return payload.data
}
