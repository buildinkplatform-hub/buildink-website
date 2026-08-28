import { createServer } from "node:http"

const port = Number(process.env.E2E_BACKEND_PORT ?? 4100)
const requestId = "e2e-request"
const now = new Date().toISOString()

const modules = [
  "overview",
  "profile",
  "verification",
  "notifications",
  "messages",
  "saved",
  "settings",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "workforce",
  "operations",
  "catalogue",
  "equipment",
  "engagements",
  "support",
]

function decodeBearerClaims(request) {
  const authorization = request.headers.authorization ?? ""
  const token = authorization.replace(/^Bearer\s+/i, "")
  if (!token) return {}
  try {
    const payload = token.split(".")[1]
    if (!payload) return {}
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"))
  } catch {
    return {}
  }
}

function currentIdentity(request) {
  const claims = decodeBearerClaims(request)
  const email =
    claims.email ?? process.env.E2E_USER_EMAIL ?? "buildink-e2e@example.com"
  const displayName =
    claims.user_metadata?.name ??
    claims.user_metadata?.full_name ??
    (email.startsWith("buildink-e2e-switch-")
      ? `E2E Switch ${email.split("buildink-e2e-switch-")[1]?.[0] ?? "User"}`
      : "Buildink E2E User")
  return {
    id: claims.sub ?? "e2e-user",
    email,
    displayName,
  }
}

function sendData(response, data, statusCode = 200) {
  response.statusCode = statusCode
  response.end(JSON.stringify({ success: true, data, requestId }))
}

const server = createServer((request, response) => {
  response.setHeader("content-type", "application/json")
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`)

  if (url.pathname === "/health/live") {
    response.end(JSON.stringify({ status: "ok" }))
    return
  }

  if (
    request.method === "POST" &&
    [
      "/api/v1/public/contact",
      "/api/v1/public/newsletter",
      "/api/v1/public/abuse-reports",
      "/api/v1/public/newsletter/unsubscribe",
    ].includes(url.pathname)
  ) {
    sendData(response, { accepted: true }, 201)
    return
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/v1/public/newsletter/confirm"
  ) {
    sendData(response, { confirmed: true })
    return
  }

  const identity = currentIdentity(request)

  if (url.pathname === "/api/v1/auth/me") {
    sendData(response, {
      identity: { id: identity.id, email: identity.email },
      account: {
        status: "ACTIVE",
        onboardingStatus: "APPROVED",
        nextAction: "enter_portal",
      },
      profile: {
        displayName: identity.displayName,
        profileType: "CONTRACTOR",
        primaryAccountType: "PROJECT_OWNER",
        verificationStatus: "VERIFIED",
        profileImageAssetId: null,
        version: 1,
      },
      companyMemberships: [],
    })
    return
  }

  if (url.pathname === "/api/v1/portal/bootstrap") {
    sendData(response, {
      access: {
        kind: "portal",
        nextAction: "enter_portal",
        canWriteMarketplace: true,
        canMutateProfile: true,
        canSubmitOnboarding: false,
        restrictions: [],
      },
      profile: {
        id: identity.id,
        email: identity.email,
        displayName: identity.displayName,
        phone: null,
        preferredLocale: "en",
        timezone: "UTC",
        contactPreference: "EMAIL",
        primaryAccountType: "PROJECT_OWNER",
        accountStatus: "ACTIVE",
        onboardingStatus: "APPROVED",
        verificationStatus: "VERIFIED",
        publicationStatus: "PUBLISHED",
        profileImageAssetId: null,
        version: 1,
        updatedAt: now,
      },
      workspaces: [],
      membershipInvitations: [],
      activeWorkspace: null,
      entitlements: {
        modules,
        permissions: [],
        capabilities: [],
        allowedActions: [],
      },
      counts: {
        projects: 0,
        opportunities: 0,
        offers: 0,
        applications: 0,
        engagements: 0,
        unreadNotifications: 0,
        savedItems: 0,
      },
    })
    return
  }

  if (url.pathname === "/api/v1/me/dashboard") {
    sendData(response, {
      accountType: "PROJECT_OWNER",
      companyId: null,
      metrics: {},
      completion: {
        percent: 0,
        completed: 0,
        total: 0,
        items: [],
      },
    })
    return
  }

  if (url.pathname === "/api/v1/me/notifications") {
    sendData(response, { items: [], unreadCount: 0 })
    return
  }

  if (url.pathname === "/api/v1/me/notifications/unread-count") {
    sendData(response, { count: 0 })
    return
  }

  response.statusCode = 404
  response.end(
    JSON.stringify({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `E2E mock route not found: ${url.pathname}`,
      },
      requestId,
    }),
  )
})

server.listen(port, "127.0.0.1")

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
