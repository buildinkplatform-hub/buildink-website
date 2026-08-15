"use client"

import { z } from "zod"

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  details: z.unknown().optional(),
})

const envelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: errorSchema.optional(),
  requestId: z.string().optional(),
})

export type PortalErrorKind =
  | "authentication"
  | "permission"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limit"
  | "server"
  | "network"
  | "invalid_response"

export class PortalApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly kind: PortalErrorKind,
    message: string,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message)
    this.name = "PortalApiError"
  }
}

function errorKind(status: number): PortalErrorKind {
  if (status === 401) return "authentication"
  if (status === 403) return "permission"
  if (status === 404) return "not_found"
  if (status === 409 || status === 412) return "conflict"
  if (status === 400 || status === 422) return "validation"
  if (status === 429) return "rate_limit"
  return "server"
}

function browserPath(backendPath: string): string {
  if (!/^\/api\/v1\/(me|portal|workspaces)(\/|\?|$)/.test(backendPath)) {
    throw new PortalApiError(
      500,
      "INVALID_PORTAL_PATH",
      "validation",
      "The portal repository requested a disallowed path",
    )
  }
  return backendPath.replace(/^\/api\/v1\//, "/api/portal/")
}

export async function portalBrowserRequest<T>(
  backendPath: string,
  schema: z.ZodType<T>,
  init: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(browserPath(backendPath), {
      ...init,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      headers: {
        ...(init.body === undefined
          ? {}
          : { "content-type": "application/json" }),
        ...init.headers,
      },
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof PortalApiError) throw error
    throw new PortalApiError(
      0,
      "NETWORK_ERROR",
      "network",
      "The request could not reach the portal service",
      error,
    )
  }

  const raw = await response.text()
  let payload: z.infer<typeof envelopeSchema>
  try {
    payload = envelopeSchema.parse(JSON.parse(raw))
  } catch (error) {
    throw new PortalApiError(
      response.status || 502,
      "INVALID_RESPONSE",
      "invalid_response",
      "The portal service returned an invalid response",
      error,
    )
  }

  if (!response.ok || !payload.success) {
    throw new PortalApiError(
      response.status,
      payload.error?.code ?? `HTTP_${response.status}`,
      errorKind(response.status),
      payload.error?.message ?? "The portal request failed",
      payload.error?.details,
      payload.requestId,
    )
  }

  const parsed = schema.safeParse(payload.data)
  if (!parsed.success) {
    throw new PortalApiError(
      502,
      "INVALID_RESPONSE_DATA",
      "invalid_response",
      "The portal response did not match its contract",
      parsed.error.flatten(),
      payload.requestId,
    )
  }
  return parsed.data
}
