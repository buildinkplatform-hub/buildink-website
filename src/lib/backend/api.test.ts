import { beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken,
}))

import { backendApi } from "./api"

function okResponse<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

function failedResponse(status = 503) {
  return new Response(
    JSON.stringify({
      success: false,
      data: null,
      error: { code: "TEMPORARY_FAILURE", message: "Try again" },
    }),
    {
      status,
      headers: { "content-type": "application/json" },
    },
  )
}

beforeEach(() => {
  getAccessToken.mockReset()
  getAccessToken.mockResolvedValue("test-token")
  vi.unstubAllGlobals()
})

describe("backendApi GET resilience", () => {
  it("retries a transient network failure", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(okResponse({ ready: true }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      backendApi<{ ready: boolean }>("/api/v1/portal/bootstrap"),
    ).resolves.toEqual({ ready: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("creates a fresh timeout signal for the retry after a 5xx response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(failedResponse())
      .mockResolvedValueOnce(okResponse({ ready: true }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      backendApi<{ ready: boolean }>("/api/v1/portal/bootstrap"),
    ).resolves.toEqual({ ready: true })

    const firstSignal = (
      fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    )?.signal
    const secondSignal = (
      fetchMock.mock.calls[1]?.[1] as RequestInit | undefined
    )?.signal
    expect(firstSignal).toBeTruthy()
    expect(secondSignal).toBeTruthy()
    expect(secondSignal).not.toBe(firstSignal)
  })
})
