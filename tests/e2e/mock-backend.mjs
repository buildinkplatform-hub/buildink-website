import { createServer } from "node:http"

const port = Number(process.env.E2E_BACKEND_PORT ?? 4100)
const requestId = "e2e-request"
const now = new Date().toISOString()

const baseModules = [
  "overview",
  "profile",
  "verification",
  "notifications",
  "messages",
  "saved",
  "settings",
  "support",
]

const allModules = [
  ...baseModules,
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
  "workspace",
  "members",
]

const pageInfo = {
  page: 1,
  pageSize: 10,
  total: 0,
  pageCount: 0,
  hasNextPage: false,
}

const tender = {
  id: "e2e-tender",
  title: "Community library renovation",
  description: "Renovation works for the community library.",
  reference: "TND-E2E-001",
  sourceKind: "PRIVATE",
  submissionChannel: "PLATFORM",
  sourceUrl: null,
  sourceAuthority: null,
  noticeType: "WORKS",
  cityId: null,
  categoryId: null,
  publicationStatus: "PUBLISHED",
  visibility: "PUBLIC",
  status: "OPEN",
  organizationCompanyId: "buyer-company",
  createdById: "buyer-user",
  valueMinor: "15000000",
  currency: "EUR",
  procurementMethod: "OPEN_TENDER",
  inquiryDeadlineAt: null,
  submissionDeadlineAt: "2030-12-31T23:59:59.000Z",
  evaluationAt: null,
  awardAt: null,
  submissionMethod: "PLATFORM",
  eligibility: null,
  awardCriteria: null,
  tagIds: [],
  media: [],
  eligibleForOffer: true,
  lotCount: 1,
  version: 1,
  lots: [
    {
      id: "e2e-tender-lot",
      title: "General renovation works",
      reference: "LOT-001",
      description: null,
      categoryId: null,
      currency: "EUR",
      valueMinor: "15000000",
    },
  ],
  lotsPage: { ...pageInfo, total: 1, pageCount: 1 },
  criteria: [],
}

const catalogueItem = {
  id: "e2e-catalogue-item",
  name: "Rebar 12mm coil",
  offeringType: "PRODUCT",
  categoryId: "e2e-category",
  description: "Structural steel reinforcement coil.",
  sku: "RB12-COIL",
  unitOfMeasure: "coil",
  moq: 1,
  leadTimeDays: 7,
  priceOnRequest: false,
  indicativePriceMinor: "78000",
  currency: "EUR",
  version: 1,
}

function personaFor(email) {
  const normalized = email.toLowerCase()
  if (normalized.includes("+worker-test@")) {
    return {
      name: "Worker",
      profileType: "WORKER",
      accountType: "WORKER",
      modules: [
        ...baseModules,
        "applications",
        "workforce",
        "operations",
        "opportunities",
        "engagements",
      ],
      capabilities: [],
      workspace: false,
    }
  }
  if (normalized.includes("+subcontractor-test@")) {
    return {
      name: "Subcontractor",
      profileType: "CONTRACTOR",
      accountType: "SUBCONTRACTOR",
      modules: [
        ...baseModules,
        "offers",
        "opportunities",
        "tenders",
        "engagements",
      ],
      capabilities: ["SUBCONTRACTOR"],
      workspace: false,
    }
  }
  if (normalized.includes("+supplier-test@")) {
    return {
      name: "Supplier",
      profileType: "SUPPLIER_CONTACT",
      accountType: "COMPANY",
      modules: [
        ...baseModules,
        "workspace",
        "catalogue",
        "offers",
        "engagements",
      ],
      capabilities: ["SUPPLIER"],
      workspace: true,
    }
  }
  if (normalized.includes("+service-test@")) {
    return {
      name: "Service Provider",
      profileType: "SERVICE_PROVIDER",
      accountType: "SERVICE_PROVIDER",
      modules: [...baseModules, "offers", "tenders", "engagements"],
      capabilities: ["PROFESSIONAL_SERVICES"],
      workspace: false,
    }
  }
  if (normalized.includes("+project-owner-test@")) {
    return {
      name: "Project Owner",
      profileType: "INDIVIDUAL",
      accountType: "PROJECT_OWNER",
      modules: [
        ...baseModules,
        "workspace",
        "members",
        "projects",
        "opportunities",
        "offers",
        "tenders",
        "workforce",
        "operations",
        "engagements",
      ],
      capabilities: ["PROJECT_PUBLISHER"],
      workspace: true,
    }
  }
  if (normalized.includes("+contractor-test@")) {
    return {
      name: "Contractor",
      profileType: "CONTRACTOR",
      accountType: "COMPANY",
      modules: [
        ...baseModules,
        "workspace",
        "members",
        "projects",
        "opportunities",
        "offers",
        "tenders",
        "workforce",
        "operations",
        "engagements",
      ],
      capabilities: ["GENERAL_CONTRACTOR", "PROJECT_PUBLISHER"],
      workspace: true,
    }
  }
  if (normalized.includes("+website-test@")) {
    return {
      name: "Individual",
      profileType: "INDIVIDUAL",
      accountType: "PROJECT_OWNER",
      modules: baseModules,
      capabilities: [],
      workspace: false,
    }
  }
  return {
    name: "Buildink E2E User",
    profileType: "CONTRACTOR",
    accountType: "COMPANY",
    modules: allModules,
    capabilities: ["GENERAL_CONTRACTOR", "PROJECT_PUBLISHER", "SUPPLIER"],
    workspace: true,
  }
}

function workspaceFor(persona) {
  if (!persona.workspace) return null
  return {
    membershipId: "e2e-membership",
    companyId: "e2e-company",
    name: `${persona.name} Workspace`,
    slug: "e2e-workspace",
    companyStatus: "ACTIVE",
    role: "OWNER",
    status: "ACTIVE",
    isPrimary: true,
    title: null,
    department: null,
    joinedAt: now,
    lastAccessedAt: now,
    version: 1,
    capabilities: persona.capabilities.map((capability, index) => ({
      id: `e2e-capability-${index}`,
      capability,
      status: "ACTIVE",
      requestedAt: now,
      reviewedAt: now,
    })),
  }
}

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

function encodeBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "")
}

function mockUser(email) {
  const id = `e2e-${encodeBase64Url(email).slice(0, 32)}`
  const timestamp = new Date().toISOString()
  return {
    id,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: timestamp,
    phone: "",
    confirmed_at: timestamp,
    last_sign_in_at: timestamp,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { name: personaFor(email).name },
    identities: [],
    created_at: timestamp,
    updated_at: timestamp,
    is_anonymous: false,
  }
}

function mockSession(email) {
  const user = mockUser(email)
  const issuedAt = Math.floor(Date.now() / 1000)
  const claims = {
    aud: "authenticated",
    exp: issuedAt + 3600,
    iat: issuedAt,
    sub: user.id,
    email,
    role: "authenticated",
    user_metadata: user.user_metadata,
  }
  const accessToken = `${encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify(claims))}.e2e-signature`
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: claims.exp,
    refresh_token: `e2e-refresh-${encodeBase64Url(email)}`,
    user,
  }
}

function emailFromRefreshToken(token) {
  const encoded = String(token ?? "").replace(/^e2e-refresh-/, "")
  if (!encoded) return null
  try {
    const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/")
    return Buffer.from(normalized, "base64").toString("utf8")
  } catch {
    return null
  }
}

async function readJson(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
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

const server = createServer(async (request, response) => {
  response.setHeader("content-type", "application/json")
  response.setHeader("access-control-allow-origin", "*")
  response.setHeader(
    "access-control-allow-headers",
    "authorization, apikey, content-type, x-client-info",
  )
  response.setHeader(
    "access-control-allow-methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  )
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`)
  if (process.env.E2E_DEBUG === "true") {
    process.stderr.write(`[mock] ${request.method} ${url.pathname}\n`)
  }

  if (request.method === "OPTIONS") {
    response.statusCode = 204
    response.end()
    return
  }

  if (url.pathname === "/auth/v1/health") {
    response.end(JSON.stringify({ version: "e2e", name: "GoTrue" }))
    return
  }

  if (url.pathname === "/auth/v1/token" && request.method === "POST") {
    const body = await readJson(request)
    const email =
      url.searchParams.get("grant_type") === "refresh_token"
        ? emailFromRefreshToken(body.refresh_token)
        : body.email
    if (!email) {
      response.statusCode = 400
      response.end(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Email is required",
        }),
      )
      return
    }
    response.end(JSON.stringify(mockSession(String(email))))
    return
  }

  if (url.pathname === "/auth/v1/user" && request.method === "GET") {
    const identity = currentIdentity(request)
    response.end(JSON.stringify(mockUser(identity.email)))
    return
  }

  if (url.pathname === "/auth/v1/logout" && request.method === "POST") {
    response.statusCode = 204
    response.end()
    return
  }

  if (url.pathname === "/auth/v1/authorize") {
    response.statusCode = 302
    response.setHeader(
      "location",
      "https://accounts.google.com/o/oauth2/v2/auth",
    )
    response.end()
    return
  }

  if (url.pathname === "/auth/v1/signup" && request.method === "POST") {
    const body = await readJson(request)
    response.end(JSON.stringify(mockSession(String(body.email))))
    return
  }

  if (url.pathname === "/auth/v1/recover" && request.method === "POST") {
    response.end(JSON.stringify({}))
    return
  }

  if (url.pathname === "/auth/v1/admin/users" && request.method === "POST") {
    const body = await readJson(request)
    response.end(JSON.stringify(mockUser(String(body.email))))
    return
  }

  if (url.pathname === "/auth/v1/admin/users" && request.method === "GET") {
    response.end(JSON.stringify({ users: [], aud: "authenticated" }))
    return
  }

  if (/^\/auth\/v1\/admin\/users\/[^/]+$/.test(url.pathname)) {
    if (request.method === "DELETE") {
      response.end(JSON.stringify({}))
      return
    }
    const body = await readJson(request)
    response.end(
      JSON.stringify(
        mockUser(String(body.email ?? "buildink-e2e@example.com")),
      ),
    )
    return
  }

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
  const persona = personaFor(identity.email)
  const workspace = workspaceFor(persona)

  if (url.pathname === "/api/v1/auth/me") {
    sendData(response, {
      identity: { id: identity.id, email: identity.email },
      account: {
        status: "ACTIVE",
        onboardingStatus: "APPROVED",
        nextAction: "enter_portal",
      },
      profile: {
        displayName: persona.name || identity.displayName,
        profileType: persona.profileType,
        primaryAccountType: persona.accountType,
        verificationStatus: "VERIFIED",
        profileImageAssetId: null,
        version: 1,
      },
      companyMemberships: workspace
        ? [
            {
              id: workspace.membershipId,
              role: workspace.role,
              status: workspace.status,
              isPrimary: true,
              company: {
                id: workspace.companyId,
                name: workspace.name,
                slug: workspace.slug,
                status: workspace.companyStatus,
              },
              capabilities: workspace.capabilities.map((item) => ({
                capability: item.capability,
                status: item.status,
              })),
            },
          ]
        : [],
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
        displayName: persona.name || identity.displayName,
        phone: null,
        preferredLocale: "en",
        timezone: "UTC",
        contactPreference: "EMAIL",
        primaryAccountType: persona.accountType,
        accountStatus: "ACTIVE",
        onboardingStatus: "APPROVED",
        verificationStatus: "VERIFIED",
        publicationStatus: "PUBLISHED",
        profileImageAssetId: null,
        version: 1,
        updatedAt: now,
      },
      workspaces: workspace ? [workspace] : [],
      membershipInvitations: [],
      activeWorkspace: workspace,
      entitlements: {
        modules: persona.modules,
        permissions: workspace
          ? [
              "projects.view",
              "projects.create",
              "tenders.view",
              "offers.view",
              "members.view",
            ]
          : [],
        capabilities: persona.capabilities,
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
      accountType: persona.accountType,
      companyId: workspace?.companyId ?? null,
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

  if (url.pathname === "/api/v1/me/offers" && request.method === "GET") {
    sendData(response, { items: [] })
    return
  }

  if (/^\/api\/v1\/workspaces\/[^/]+\/offers$/.test(url.pathname)) {
    sendData(response, { items: [] })
    return
  }

  if (url.pathname === "/api/v1/me/applications") {
    sendData(response, { items: [] })
    return
  }

  if (url.pathname === "/api/v1/me/offer-targets") {
    const kind = url.searchParams.get("kind") ?? "opportunity"
    sendData(response, {
      items: [
        {
          id: `e2e-${kind}`,
          kind,
          title: `E2E ${kind}`,
          currency: "EUR",
          eligible: true,
        },
      ],
      pageInfo: { ...pageInfo, total: 1, pageCount: 1 },
    })
    return
  }

  if (url.pathname === "/api/v1/me/application-targets") {
    sendData(response, { items: [], pageInfo })
    return
  }

  if (url.pathname === "/api/v1/me/tenders") {
    const items = persona.accountType === "SERVICE_PROVIDER" ? [tender] : []
    sendData(response, {
      items,
      pageInfo: items.length
        ? { ...pageInfo, total: 1, pageCount: 1 }
        : pageInfo,
    })
    return
  }

  if (url.pathname === `/api/v1/me/tenders/${tender.id}`) {
    sendData(response, tender)
    return
  }

  if (url.pathname === "/api/v1/me/taxonomy") {
    sendData(response, {
      items:
        url.searchParams.get("kind") === "categories"
          ? [
              {
                id: "e2e-category",
                slug: "building-materials",
                name: "Building materials",
                translations: { en: { name: "Building materials" } },
              },
            ]
          : [],
    })
    return
  }

  if (/^\/api\/v1\/workspaces\/[^/]+\/catalogue$/.test(url.pathname)) {
    sendData(response, {
      items: [catalogueItem],
      pageInfo: { ...pageInfo, total: 1, pageCount: 1 },
    })
    return
  }

  if (
    /^\/api\/v1\/workspaces\/[^/]+\/catalogue\/e2e-catalogue-item$/.test(
      url.pathname,
    )
  ) {
    sendData(response, catalogueItem)
    return
  }

  if (
    [
      "/api/v1/me/engagements",
      "/api/v1/me/conversations",
      "/api/v1/me/documents",
      "/api/v1/me/saved-items",
      "/api/v1/me/saved-searches",
      "/api/v1/me/company-claims",
    ].includes(url.pathname)
  ) {
    sendData(response, { items: [] })
    return
  }

  if (
    request.method === "GET" &&
    /^\/api\/v1\/(?:me|workspaces\/[^/]+)\/(?:projects|opportunities|equipment|members)$/.test(
      url.pathname,
    )
  ) {
    sendData(response, { items: [], pageInfo })
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
