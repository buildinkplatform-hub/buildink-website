import { chromium, request as playwrightRequest } from "playwright"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, "../..")
const reportFile = process.env.AUDIT_REPORT_FILE ?? "playwright-live-audit.json"
const reportPath = resolve(repositoryRoot, reportFile)
const partialReportPath = resolve(
  repositoryRoot,
  reportFile.replace(/\.json$/i, ".partial.json"),
)
const websiteOrigin = process.env.AUDIT_WEBSITE_URL ?? "http://127.0.0.1:3000"
const adminOrigin = process.env.AUDIT_ADMIN_URL ?? "http://127.0.0.1:3001"
const apiOrigin = process.env.AUDIT_API_URL ?? "http://127.0.0.1:4000"
const corsWebsiteOrigin =
  process.env.AUDIT_CORS_WEBSITE_ORIGIN ?? "http://localhost:3000"
const corsAdminOrigin =
  process.env.AUDIT_CORS_ADMIN_ORIGIN ?? "http://localhost:3001"
const skipPublic = process.env.AUDIT_SKIP_PUBLIC === "true"
const skipPageCrawls = process.env.AUDIT_AUTH_ONLY === "true"
const routeFilter = new Set(
  (process.env.AUDIT_ROUTE_FILTER ?? "")
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean),
)

const shouldAuditRoute = (route) =>
  routeFilter.size === 0 || routeFilter.has(route)

const websiteRoutes = [
  "/en",
  "/en/about",
  "/en/blog",
  "/en/companies",
  "/en/contact",
  "/en/cookies",
  "/en/equipment",
  "/en/faq",
  "/en/forgot-password",
  "/en/help",
  "/en/how-it-works",
  "/en/login",
  "/en/opportunities",
  "/en/opportunities/companies",
  "/en/opportunities/services",
  "/en/opportunities/workers",
  "/en/privacy",
  "/en/profiles",
  "/en/project-owners",
  "/en/projects",
  "/en/register",
  "/en/reset-password",
  "/en/search",
  "/en/service-providers",
  "/en/subcontractors",
  "/en/suppliers",
  "/en/tenders",
  "/en/terms",
  "/en/trades",
  "/en/verification",
  "/en/verify-email",
  "/en/workers",
]

const localeRoutes = ["/it", "/ar", "/ro", "/sq"]
const adminRoutes = [
  "/dashboard",
  "/audit-logs",
  "/bids",
  "/bids/compare",
  "/bids/create",
  "/categories",
  "/companies",
  "/companies/import",
  "/companies/new",
  "/content",
  "/content/new",
  "/equipment",
  "/equipment/new",
  "/locations",
  "/marketplace-activity",
  "/notifications",
  "/projects",
  "/projects/new",
  "/reports",
  "/reviews",
  "/roles",
  "/roles/new",
  "/settings",
  "/suppliers",
  "/suppliers/new",
  "/support",
  "/system-health",
  "/tags",
  "/tenders",
  "/tenders/new",
  "/users",
  "/users/new",
  "/verification",
  "/workforce",
  "/workforce/attendance",
]

function percentile(values, fraction) {
  if (!values.length) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)
  ]
}

async function bounded(promise, timeoutMs, fallback) {
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((resolvePromise) => {
        timeout = setTimeout(() => resolvePromise(fallback), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

function isEnvironmentFailure(error) {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return /ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_RESET|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|socket hang up/i.test(
    message,
  )
}

function parseAccounts(markdown) {
  const adminPassword = markdown.match(
    /Admin dashboard password:\s*`([^`]+)`/i,
  )?.[1]
  const websitePassword = markdown.match(/Website password:\s*`([^`]+)`/i)?.[1]
  const adminEmail = markdown.match(
    /Platform administrator\s*\|\s*([^|\s]+@[^|\s]+)/i,
  )?.[1]
  const websiteEmail = markdown.match(
    /Individual \(E2E default\)\s*\|\s*([^|\s]+@[^|\s]+)/i,
  )?.[1]
  if (!adminPassword || !websitePassword || !adminEmail || !websiteEmail) {
    throw new Error("Unable to parse the seeded audit accounts")
  }
  return { adminPassword, websitePassword, adminEmail, websiteEmail }
}

async function installVitals(context) {
  await context.addInitScript(() => {
    window.__buildinkAuditVitals = {
      cls: 0,
      lcp: 0,
      longTasks: 0,
      longTaskMs: 0,
    }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput)
            window.__buildinkAuditVitals.cls += entry.value
        }
      }).observe({ type: "layout-shift", buffered: true })
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries.at(-1)
        if (last) window.__buildinkAuditVitals.lcp = last.startTime
      }).observe({ type: "largest-contentful-paint", buffered: true })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__buildinkAuditVitals.longTasks += 1
          window.__buildinkAuditVitals.longTaskMs += entry.duration
        }
      }).observe({ type: "longtask", buffered: true })
    } catch {
      // Older browser builds may not expose every observer type.
    }
  })
}

function securityHeaders(response) {
  const headers = response?.headers() ?? {}
  return {
    contentSecurityPolicy: Boolean(headers["content-security-policy"]),
    frameProtection: Boolean(
      headers["x-frame-options"] ||
      headers["content-security-policy"]?.includes("frame-ancestors"),
    ),
    noSniff: headers["x-content-type-options"] === "nosniff",
    referrerPolicy: Boolean(headers["referrer-policy"]),
    permissionsPolicy: Boolean(headers["permissions-policy"]),
    crossOriginOpenerPolicy: Boolean(headers["cross-origin-opener-policy"]),
  }
}

function pageFailureKind({ response, navigationError, pageErrors }) {
  if (navigationError && isEnvironmentFailure(navigationError))
    return "environment"
  if (navigationError) return "navigation"
  if (!response?.ok()) return "http"
  if (pageErrors.length) return "page"
  return null
}

async function auditPage(context, url, application) {
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []
  const browserApiCalls = []
  page.on("console", (message) => {
    if (message.type() === "error")
      consoleErrors.push(message.text().slice(0, 500))
  })
  page.on("pageerror", (error) => pageErrors.push(error.message.slice(0, 500)))
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? "unknown",
    })
  })
  page.on("response", async (response) => {
    if (!response.url().includes("/api/")) return
    const timing = response.request().timing()
    browserApiCalls.push({
      url: response.url(),
      status: response.status(),
      durationMs:
        timing.responseEnd >= 0 && timing.startTime >= 0
          ? Math.round(timing.responseEnd)
          : null,
    })
  })

  const startedAt = performance.now()
  let response = null
  let navigationError = null
  try {
    response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    await page
      .waitForLoadState("load", { timeout: 2_000 })
      .catch(() => undefined)
    await page.waitForTimeout(250)
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error)
  }
  const wallMs = Math.round(performance.now() - startedAt)
  const emptyDocumentMetrics = {
    title: "",
    lang: "",
    dir: "",
    h1: null,
    hasMain: false,
    horizontalOverflowPx: 0,
    domContentLoadedMs: null,
    loadEventMs: null,
    ttfbMs: null,
    transferBytes: 0,
    resourceCount: 0,
    vitals: null,
    links: [],
  }
  const documentMetrics = await bounded(
    page
      .evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0]
        const resources = performance.getEntriesByType("resource")
        const root = document.documentElement
        return {
          title: document.title,
          lang: root.lang,
          dir: root.dir,
          h1:
            document.querySelector("h1")?.textContent?.trim().slice(0, 160) ??
            null,
          hasMain: Boolean(document.querySelector("main")),
          horizontalOverflowPx: Math.max(
            0,
            root.scrollWidth - root.clientWidth,
          ),
          domContentLoadedMs: navigation
            ? Math.round(navigation.domContentLoadedEventEnd)
            : null,
          loadEventMs: navigation ? Math.round(navigation.loadEventEnd) : null,
          ttfbMs: navigation ? Math.round(navigation.responseStart) : null,
          transferBytes: Math.round(
            (navigation?.transferSize ?? 0) +
              resources.reduce(
                (total, entry) => total + (entry.transferSize ?? 0),
                0,
              ),
          ),
          resourceCount: resources.length,
          vitals: window.__buildinkAuditVitals ?? null,
          links: [...document.querySelectorAll("a[href]")]
            .map((anchor) => anchor.href)
            .filter((href) => href.startsWith(location.origin)),
        }
      })
      .catch(() => emptyDocumentMetrics),
    5_000,
    emptyDocumentMetrics,
  )

  const failureKind = pageFailureKind({ response, navigationError, pageErrors })
  const result = {
    application,
    requestedUrl: url,
    finalUrl: page.url(),
    status: response?.status() ?? null,
    ok: failureKind === null,
    failureKind,
    wallMs,
    ...documentMetrics,
    security: securityHeaders(response),
    navigationError,
    consoleErrors: [...new Set(consoleErrors)],
    pageErrors: [...new Set(pageErrors)],
    failedRequests,
    browserApiCalls,
  }
  await bounded(page.close(), 5_000, undefined)
  return result
}

async function loginWebsite(context, accounts) {
  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  page.setDefaultNavigationTimeout(30_000)
  let error = null
  try {
    await page.goto(`${websiteOrigin}/en/login`, {
      waitUntil: "domcontentloaded",
    })
    await page.getByLabel("Email address").fill(accounts.websiteEmail)
    await page.locator("#password").fill(accounts.websitePassword)
    await page
      .getByRole("button", { name: /log in/i })
      .click({ timeout: 10_000 })
    await page.waitForURL(/\/en\/(dashboard|onboarding)/, { timeout: 30_000 })
  } catch (caught) {
    error = {
      kind: isEnvironmentFailure(caught) ? "environment" : "authentication",
      message:
        caught instanceof Error
          ? caught.message.split("\n")[0]
          : String(caught),
      visibleText: (
        await page
          .locator("main")
          .innerText()
          .catch(() => "")
      ).slice(0, 1_000),
    }
  }
  const destination = page.url()
  await page.close()
  return { destination, error }
}

async function loginAdmin(context, accounts) {
  await context.addCookies([
    { name: "buildink-locale", value: "en", url: adminOrigin, sameSite: "Lax" },
  ])
  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  page.setDefaultNavigationTimeout(30_000)
  let error = null
  try {
    await page.goto(`${adminOrigin}/login`, { waitUntil: "domcontentloaded" })
    await page.getByLabel("Email address").fill(accounts.adminEmail)
    await page
      .getByLabel("Password", { exact: true })
      .fill(accounts.adminPassword)
    await page
      .getByRole("button", { name: /sign in/i })
      .click({ timeout: 10_000 })
    await page.waitForURL(/\/(dashboard|access-unassigned|access-denied)$/, {
      timeout: 30_000,
    })
  } catch (caught) {
    error = {
      kind: isEnvironmentFailure(caught) ? "environment" : "authentication",
      message:
        caught instanceof Error
          ? caught.message.split("\n")[0]
          : String(caught),
      visibleText: (
        await page
          .locator("main")
          .innerText()
          .catch(() => "")
      ).slice(0, 1_000),
    }
  }
  const destination = page.url()
  await page.close()
  return { destination, error }
}

function eligibleDiscoveredLinks(results, origin, prefix = "") {
  const paths = new Set()
  for (const result of results) {
    for (const link of result.links ?? []) {
      const parsed = new URL(link)
      if (parsed.origin !== origin || !parsed.pathname.startsWith(prefix))
        continue
      if (parsed.pathname.includes("/auth/callback")) continue
      paths.add(`${parsed.pathname}${parsed.search}`)
    }
  }
  return [...paths]
}

async function auditApi() {
  const api = await playwrightRequest.newContext({ baseURL: apiOrigin })
  const probes = [
    { method: "GET", path: "/health/live", expected: [200] },
    { method: "GET", path: "/health/ready", expected: [200, 503] },
    { method: "GET", path: "/health/services", expected: [200, 404] },
    { method: "GET", path: "/api/v1/auth/me", expected: [401] },
    { method: "GET", path: "/api/v1/does-not-exist", expected: [404] },
    { method: "GET", path: "/docs-json", expected: [200, 404] },
  ]
  const results = []
  for (const probe of probes) {
    const startedAt = performance.now()
    try {
      const response = await api.fetch(probe.path, {
        method: probe.method,
        failOnStatusCode: false,
      })
      results.push({
        ...probe,
        status: response.status(),
        ok: probe.expected.includes(response.status()),
        failureKind: probe.expected.includes(response.status()) ? null : "http",
        latencyMs: Math.round(performance.now() - startedAt),
        security: securityHeaders(response),
        requestId: response.headers()["x-request-id"] ?? null,
      })
    } catch (error) {
      results.push({
        ...probe,
        status: null,
        ok: false,
        failureKind: isEnvironmentFailure(error) ? "environment" : "request",
        latencyMs: Math.round(performance.now() - startedAt),
        security: securityHeaders(null),
        requestId: null,
        error: error instanceof Error ? error.message : String(error),
      })
      if (isEnvironmentFailure(error)) break
    }
  }

  if (!results.some((result) => result.failureKind === "environment")) {
    for (const origin of [
      corsWebsiteOrigin,
      corsAdminOrigin,
      "https://attacker.invalid",
    ]) {
      const startedAt = performance.now()
      try {
        const response = await api.fetch("/health/live", {
          method: "OPTIONS",
          headers: {
            origin,
            "access-control-request-method": "GET",
            "access-control-request-headers": "authorization,content-type",
          },
          failOnStatusCode: false,
        })
        const ok =
          origin === "https://attacker.invalid"
            ? response.headers()["access-control-allow-origin"] !== origin
            : response.headers()["access-control-allow-origin"] === origin
        results.push({
          method: "OPTIONS",
          path: "/health/live",
          origin,
          status: response.status(),
          latencyMs: Math.round(performance.now() - startedAt),
          allowOrigin:
            response.headers()["access-control-allow-origin"] ?? null,
          ok,
          failureKind: ok ? null : "cors",
        })
      } catch (error) {
        results.push({
          method: "OPTIONS",
          path: "/health/live",
          origin,
          status: null,
          latencyMs: Math.round(performance.now() - startedAt),
          allowOrigin: null,
          ok: false,
          failureKind: isEnvironmentFailure(error) ? "environment" : "request",
          error: error instanceof Error ? error.message : String(error),
        })
        if (isEnvironmentFailure(error)) break
      }
    }
  }
  await api.dispose()
  return results
}

function summarizePages(pages) {
  const environmentFailures = pages.filter(
    (page) => page.failureKind === "environment",
  )
  const productPages = pages.filter(
    (page) => page.failureKind !== "environment",
  )
  const successful = productPages.filter((page) => page.ok)
  const wallTimes = productPages.map((page) => page.wallMs)
  const ttfbTimes = productPages
    .map((page) => page.ttfbMs)
    .filter(Number.isFinite)
  return {
    totalAttempts: pages.length,
    productAttempts: productPages.length,
    successful: successful.length,
    failed: productPages.length - successful.length,
    environmentFailures: environmentFailures.length,
    p50WallMs: percentile(wallTimes, 0.5),
    p95WallMs: percentile(wallTimes, 0.95),
    maxWallMs: Math.max(0, ...wallTimes),
    p50TtfbMs: percentile(ttfbTimes, 0.5),
    p95TtfbMs: percentile(ttfbTimes, 0.95),
    consoleErrorPages: productPages.filter((page) => page.consoleErrors.length)
      .length,
    pageErrorPages: productPages.filter((page) => page.pageErrors.length)
      .length,
    failedRequestPages: productPages.filter(
      (page) => page.failedRequests.length,
    ).length,
    overflowPages: productPages.filter((page) => page.horizontalOverflowPx > 1)
      .length,
  }
}

const accounts = parseAccounts(
  await readFile(resolve(repositoryRoot, "test-accounts.md"), "utf8"),
)
const browser = await chromium.launch({ headless: true })
const publicContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
})
const websiteContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
})
const adminContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
})
await Promise.all([
  installVitals(publicContext),
  installVitals(websiteContext),
  installVitals(adminContext),
])

const checkpoint =
  process.env.AUDIT_RESUME === "true"
    ? await readFile(partialReportPath, "utf8")
        .then((value) => JSON.parse(value))
        .catch(() => ({}))
    : {}
const websitePublic = (checkpoint.websitePublic ?? []).filter(
  (result) =>
    result.status !== null &&
    !result.navigationError &&
    new URL(result.requestedUrl).origin === websiteOrigin,
)
const saveCheckpoint = (adminPages = checkpoint.adminPages ?? []) =>
  writeFile(
    partialReportPath,
    `${JSON.stringify({ websitePublic, adminPages }, null, 2)}\n`,
    "utf8",
  )
if (!skipPublic && !skipPageCrawls) {
  for (const route of [...websiteRoutes, ...localeRoutes].filter(
    shouldAuditRoute,
  )) {
    if (
      websitePublic.some(
        (result) => result.requestedUrl === `${websiteOrigin}${route}`,
      )
    )
      continue
    const result = await auditPage(
      publicContext,
      `${websiteOrigin}${route}`,
      "website-public",
    )
    websitePublic.push(result)
    await saveCheckpoint()
    process.stdout.write(
      `[website-public ${websitePublic.length}/${websiteRoutes.length + localeRoutes.length}] ${route}\n`,
    )
    if (result.failureKind === "environment") {
      process.stdout.write(
        "[website-public] service became unreachable; stopping this route crawl\n",
      )
      break
    }
  }
}

process.stdout.write("[auth] website login\n")
const websiteLogin = await loginWebsite(websiteContext, accounts)
const websiteAuthenticated = websiteLogin.error
  ? []
  : shouldAuditRoute(new URL(websiteLogin.destination).pathname)
    ? [
        await auditPage(
          websiteContext,
          websiteLogin.destination,
          "website-authenticated",
        ),
      ]
    : []
if (!skipPageCrawls) {
  for (const route of eligibleDiscoveredLinks(
    websiteAuthenticated,
    websiteOrigin,
    "/en/dashboard",
  )
    .filter(shouldAuditRoute)
    .slice(0, 120)) {
    if (
      websiteAuthenticated.some(
        (result) => new URL(result.requestedUrl).pathname === route,
      )
    )
      continue
    const result = await auditPage(
      websiteContext,
      `${websiteOrigin}${route}`,
      "website-authenticated",
    )
    websiteAuthenticated.push(result)
    process.stdout.write(
      `[website-authenticated ${websiteAuthenticated.length}] ${route}\n`,
    )
    if (result.failureKind === "environment") {
      process.stdout.write(
        "[website-authenticated] service became unreachable; stopping this route crawl\n",
      )
      break
    }
  }
}

process.stdout.write("[auth] admin login\n")
const adminLogin = await loginAdmin(adminContext, accounts)
const adminPages = (checkpoint.adminPages ?? []).filter(
  (result) =>
    result.status !== null &&
    !result.navigationError &&
    new URL(result.requestedUrl).origin === adminOrigin &&
    new URL(result.finalUrl).pathname !== "/login" &&
    result.finalUrl !== "about:blank",
)
if (!adminLogin.error && !skipPageCrawls) {
  for (const route of adminRoutes.filter(shouldAuditRoute)) {
    if (
      adminPages.some(
        (result) => result.requestedUrl === `${adminOrigin}${route}`,
      )
    )
      continue
    const result = await auditPage(
      adminContext,
      `${adminOrigin}${route}`,
      "admin",
    )
    adminPages.push(result)
    await saveCheckpoint(adminPages)
    process.stdout.write(
      `[admin ${adminPages.length}/${adminRoutes.length}] ${route}\n`,
    )
    if (result.failureKind === "environment") {
      process.stdout.write(
        "[admin] service became unreachable; stopping this route crawl\n",
      )
      break
    }
  }
}
if (
  !adminLogin.error &&
  !skipPageCrawls &&
  !adminPages.some((result) => result.failureKind === "environment")
) {
  for (const route of eligibleDiscoveredLinks(adminPages, adminOrigin)
    .filter(shouldAuditRoute)
    .slice(0, 160)) {
    if (adminRoutes.includes(route) || route === "/login") continue
    if (
      adminPages.some(
        (result) => result.requestedUrl === `${adminOrigin}${route}`,
      )
    )
      continue
    const result = await auditPage(
      adminContext,
      `${adminOrigin}${route}`,
      "admin",
    )
    adminPages.push(result)
    await saveCheckpoint(adminPages)
    process.stdout.write(`[admin-discovered ${adminPages.length}] ${route}\n`)
    if (result.failureKind === "environment") {
      process.stdout.write(
        "[admin-discovered] service became unreachable; stopping discovered crawl\n",
      )
      break
    }
  }
}

const api = await auditApi()
const pages = [...websitePublic, ...websiteAuthenticated, ...adminPages]
const report = {
  generatedAt: new Date().toISOString(),
  environment: {
    websiteOrigin,
    adminOrigin,
    apiOrigin,
    note: "Local running services; timings include local development/runtime overhead and are not production SLO measurements. Environment-level connection failures are classified separately from product failures.",
  },
  authentication: {
    websiteDestination: new URL(websiteLogin.destination).pathname,
    websiteError: websiteLogin.error,
    adminDestination: new URL(adminLogin.destination).pathname,
    adminError: adminLogin.error,
  },
  summary: {
    allPages: summarizePages(pages),
    websitePublic: summarizePages(websitePublic),
    websiteAuthenticated: summarizePages(websiteAuthenticated),
    admin: summarizePages(adminPages),
    api: {
      total: api.length,
      successful: api.filter((probe) => probe.ok).length,
      failed: api.filter(
        (probe) => !probe.ok && probe.failureKind !== "environment",
      ).length,
      environmentFailures: api.filter(
        (probe) => probe.failureKind === "environment",
      ).length,
      p50LatencyMs: percentile(
        api
          .filter((probe) => probe.failureKind !== "environment")
          .map((probe) => probe.latencyMs),
        0.5,
      ),
      p95LatencyMs: percentile(
        api
          .filter((probe) => probe.failureKind !== "environment")
          .map((probe) => probe.latencyMs),
        0.95,
      ),
    },
  },
  pages,
  api,
}

await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
await Promise.all([
  publicContext.close(),
  websiteContext.close(),
  adminContext.close(),
])
await browser.close()

process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`)
process.stdout.write(`Report: ${reportPath}\n`)
