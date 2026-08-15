import { getAccessToken } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 2 * 1024 * 1024
const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/

function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    { success: false, error: { code, message } },
    { status, headers: { "cache-control": "no-store" } },
  )
}

function isAllowedPath(segments: string[]): boolean {
  if (
    !segments.length ||
    segments.some((segment) => !SAFE_SEGMENT.test(segment))
  ) {
    return false
  }

  if (segments[0] === "me" || segments[0] === "workspaces") return true
  return (
    segments.length === 2 &&
    segments[0] === "portal" &&
    segments[1] === "bootstrap"
  )
}

async function forward(
  request: Request,
  context: { params: Promise<{ segments: string[] }> },
) {
  if (!METHODS.has(request.method)) {
    return errorResponse(
      405,
      "METHOD_NOT_ALLOWED",
      "The HTTP method is not allowed",
    )
  }

  const { segments } = await context.params
  if (!isAllowedPath(segments)) {
    return errorResponse(
      404,
      "PORTAL_ROUTE_NOT_FOUND",
      "The portal route was not found",
    )
  }

  const token = await getAccessToken()
  if (!token) {
    return errorResponse(401, "AUTH_REQUIRED", "Authentication is required")
  }

  const requestUrl = new URL(request.url)
  const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:4000"
  const backendUrl = new URL(
    `/api/v1/${segments.join("/")}${requestUrl.search}`,
    backendBaseUrl,
  )
  const headers = new Headers({ authorization: `Bearer ${token}` })
  for (const name of ["content-type", "if-match", "idempotency-key"]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  let body: ArrayBuffer | undefined
  if (request.method !== "GET") {
    const declaredLength = Number(request.headers.get("content-length") ?? 0)
    if (declaredLength > MAX_BODY_BYTES) {
      return errorResponse(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request payload is too large",
      )
    }
    body = await request.arrayBuffer()
    if (body.byteLength > MAX_BODY_BYTES) {
      return errorResponse(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request payload is too large",
      )
    }
  }

  let response: Response
  try {
    response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(
        Number(process.env.BACKEND_API_TIMEOUT_MS ?? 25_000),
      ),
    })
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError"
    return errorResponse(
      timedOut ? 504 : 502,
      timedOut ? "BACKEND_TIMEOUT" : "BACKEND_UNAVAILABLE",
      timedOut
        ? "The backend request timed out"
        : "The backend service is unavailable",
    )
  }

  const responseHeaders = new Headers({ "cache-control": "no-store" })
  for (const name of ["content-type", "etag", "retry-after", "x-request-id"]) {
    const value = response.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
