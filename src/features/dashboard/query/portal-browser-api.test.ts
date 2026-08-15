import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { portalBrowserRequest } from "./portal-browser-api"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("portalBrowserRequest", () => {
  it("uses the same-origin portal boundary and validates successful data", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ success: true, data: { count: 3 } }),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      portalBrowserRequest(
        "/api/v1/me/notifications/unread-count",
        z.object({ count: z.number() }),
      ),
    ).resolves.toEqual({ count: 3 })
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/me/notifications/unread-count",
      expect.objectContaining({ cache: "no-store" }),
    )
  })

  it("normalizes permission failures without replacing them with empty data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            success: false,
            error: { code: "WORKSPACE_FORBIDDEN", message: "Forbidden" },
          },
          { status: 403 },
        ),
      ),
    )

    const request = portalBrowserRequest(
      "/api/v1/workspaces/company-1/overview",
      z.object({}),
    )
    await expect(request).rejects.toMatchObject({
      status: 403,
      code: "WORKSPACE_FORBIDDEN",
      kind: "permission",
    })
  })

  it("rejects response data that violates its domain contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ success: true, data: { count: "three" } }),
      ),
    )

    await expect(
      portalBrowserRequest(
        "/api/v1/me/notifications/unread-count",
        z.object({ count: z.number() }),
      ),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE_DATA" })
  })

  it("fails closed before fetching disallowed backend paths", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      portalBrowserRequest("/api/v1/admin/users", z.object({})),
    ).rejects.toMatchObject({ code: "INVALID_PORTAL_PATH" })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
