import "server-only"

import { getAccessToken } from "@/lib/supabase/server"

export interface BackendEnvelope<T> {
  success: boolean
  data: T
  requestId?: string
}

export class BackendApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
  }
}

type BackendErrorPayload = {
  error?: { code?: string; message?: string; details?: unknown }
}

export async function readBackendEnvelope<T>(
  response: Response,
): Promise<BackendEnvelope<T> & BackendErrorPayload> {
  const text = await response.text()
  if (!text.trim()) {
    throw new BackendApiError(
      response.status || 502,
      "EMPTY_RESPONSE",
      "The backend returned an empty response",
    )
  }
  try {
    return JSON.parse(text) as BackendEnvelope<T> & BackendErrorPayload
  } catch {
    throw new BackendApiError(
      response.status || 502,
      "INVALID_JSON",
      "The backend returned an invalid response",
    )
  }
}

export async function backendApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  if (!token)
    throw new BackendApiError(
      401,
      "AUTH_REQUIRED",
      "Authentication is required",
    )
  const useDataCache = Boolean(init.next)
  const method = (init.method ?? "GET").toUpperCase()
  const attempts = method === "GET" || method === "HEAD" ? 2 : 1
  const timeout = AbortSignal.timeout(
    Number(process.env.BACKEND_API_TIMEOUT_MS ?? 10_000),
  )
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  let response: Response | undefined
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await fetch(
      `${process.env.BACKEND_API_URL ?? "http://localhost:4000"}${path}`,
      {
        ...init,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          ...init.headers,
        },
        // Only force no-store when the caller has not opted into the Next.js data cache.
        ...(useDataCache ? {} : { cache: init.cache ?? ("no-store" as const) }),
        signal,
      },
    )
    if (response.status < 500 || attempt === attempts - 1) break
    await response.body?.cancel().catch(() => undefined)
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  if (!response) {
    throw new BackendApiError(
      503,
      "BACKEND_UNAVAILABLE",
      "The backend is unavailable",
    )
  }
  const payload = await readBackendEnvelope<T>(response)
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
