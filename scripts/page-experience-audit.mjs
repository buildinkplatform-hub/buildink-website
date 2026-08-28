import { chromium } from "playwright"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const out = resolve(
  root,
  process.env.AUDIT_OUTPUT_DIR ?? "page-experience-audit",
)
const origins = {
  website: process.env.AUDIT_WEBSITE_URL ?? "http://localhost:3000",
  admin: process.env.AUDIT_ADMIN_URL ?? "http://localhost:3001",
}
const apiOrigin = process.env.AUDIT_API_URL ?? "http://localhost:4000"
const locales = (process.env.AUDIT_LOCALES ?? "en,it,ar,ro,sq")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean)
const screenshots = process.env.AUDIT_SCREENSHOTS !== "false"
const warmReload = process.env.AUDIT_WARM_RELOAD !== "false"
const transitionsEnabled = process.env.AUDIT_CLIENT_TRANSITIONS !== "false"
const maxRoutes = Number(process.env.AUDIT_MAX_DISCOVERED_ROUTES ?? 300)
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 720 },
]
const budgets = {
  load: 3000,
  lcp: 2500,
  cls: 0.1,
  longTasks: 200,
  transfer: 2 * 1024 * 1024,
  api: 1500,
  transition: 1500,
}

const uniq = (xs, n = 20) => [...new Set(xs.filter(Boolean))].slice(0, n)
const pct = (xs, p) => {
  const a = xs.filter(Number.isFinite).sort((x, y) => x - y)
  return a.length ? a[Math.min(a.length - 1, Math.ceil(a.length * p) - 1)] : 0
}
const envFailure = (e) =>
  /ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_RESET|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|socket hang up/i.test(
    String(e?.message ?? e ?? ""),
  )
const group = (s) => s.startsWith("(") && s.endsWith(")")
const dynamic = (s) => /^\[.*\]$/.test(s)

function expand(parts) {
  let routes = [[]]
  for (const part of parts) {
    if (part === "[locale]")
      routes = routes.flatMap((base) =>
        locales.map((locale) => [...base, locale]),
      )
    else if (dynamic(part)) return []
    else routes = routes.map((base) => [...base, part])
  }
  return routes.map((r) => `/${r.join("/")}`.replace(/\/$/, "") || "/")
}

async function inventory(app, appRoot) {
  const routes = [],
    patterns = []
  async function walk(dir, parts = [], groups = []) {
    const entries = await readdir(dir, { withFileTypes: true })
    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      const source = relative(root, join(dir, "page.tsx")).replaceAll("\\", "/")
      const access =
        app === "admin"
          ? groups.includes("(admin)") || source.includes("/access-unassigned/")
            ? "protected"
            : "public"
          : groups.includes("(portal)") || source.includes("/onboarding/")
            ? "protected"
            : "public"
      const concrete = expand(parts)
      if (concrete.length)
        concrete.forEach((route) =>
          routes.push({ app, route, access, source, discovered: "filesystem" }),
        )
      else
        patterns.push({ app, pattern: `/${parts.join("/")}`, access, source })
    }
    for (const entry of entries) {
      if (
        !entry.isDirectory() ||
        entry.name.startsWith("@") ||
        entry.name.startsWith("_") ||
        entry.name === "api"
      )
        continue
      if (group(entry.name))
        await walk(join(dir, entry.name), parts, [...groups, entry.name])
      else await walk(join(dir, entry.name), [...parts, entry.name], groups)
    }
  }
  await walk(appRoot)
  return { routes, patterns }
}

async function accounts() {
  const env = {
    websiteEmail: process.env.AUDIT_WEBSITE_EMAIL,
    websitePassword: process.env.AUDIT_WEBSITE_PASSWORD,
    adminEmail: process.env.AUDIT_ADMIN_EMAIL,
    adminPassword: process.env.AUDIT_ADMIN_PASSWORD,
  }
  if (Object.values(env).every(Boolean)) return env
  const text = await readFile(resolve(root, "test-accounts.md"), "utf8")
  const value = {
    adminPassword: text.match(/Admin dashboard password:\s*`([^`]+)`/i)?.[1],
    websitePassword: text.match(/Website password:\s*`([^`]+)`/i)?.[1],
    adminEmail: text.match(
      /Platform administrator\s*\|\s*([^|\s]+@[^|\s]+)/i,
    )?.[1],
    websiteEmail: text.match(
      /Individual \(E2E default\)\s*\|\s*([^|\s]+@[^|\s]+)/i,
    )?.[1],
  }
  if (!Object.values(value).every(Boolean))
    throw new Error("Audit accounts unavailable")
  return value
}

async function observers(context) {
  await context.addInitScript(() => {
    window.__px = { cls: 0, lcp: 0, longTaskMs: 0, routeLongTaskMs: 0 }
    try {
      new PerformanceObserver((list) =>
        list.getEntries().forEach((e) => {
          if (!e.hadRecentInput) window.__px.cls += e.value
        }),
      ).observe({ type: "layout-shift", buffered: true })
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1)
        if (e) window.__px.lcp = e.startTime
      }).observe({ type: "largest-contentful-paint", buffered: true })
      new PerformanceObserver((list) =>
        list.getEntries().forEach((e) => {
          window.__px.longTaskMs += e.duration
          window.__px.routeLongTaskMs += e.duration
        }),
      ).observe({ type: "longtask", buffered: true })
    } catch {}
  })
}

async function settle(page) {
  await page.waitForLoadState("load", { timeout: 3000 }).catch(() => {})
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {})
  await page
    .waitForFunction(
      () =>
        ![
          ...document.querySelectorAll(
            '[aria-busy="true"],[data-loading="true"]',
          ),
        ].some((e) => {
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e)
          return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden"
          )
        }),
      { timeout: 2000 },
    )
    .catch(() => {})
  await page.waitForTimeout(200)
}

const cache = (response) => {
  const h = response?.headers() ?? {}
  return {
    cacheControl: h["cache-control"] ?? null,
    age: h.age ?? null,
    etag: h.etag ?? null,
    next: h["x-nextjs-cache"] ?? null,
    vercel: h["x-vercel-cache"] ?? null,
    cf: h["cf-cache-status"] ?? null,
  }
}

async function docMetrics(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0]
    const resources = performance.getEntriesByType("resource")
    const fcp =
      performance
        .getEntriesByType("paint")
        .find((e) => e.name === "first-contentful-paint")?.startTime ?? null
    return {
      title: document.title,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      ttfb: nav ? Math.round(nav.responseStart) : null,
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      fcp: fcp ? Math.round(fcp) : null,
      transfer: Math.round(
        (nav?.transferSize ?? 0) +
          resources.reduce((n, e) => n + (e.transferSize ?? 0), 0),
      ),
      resources: resources.length,
      cachedResources: resources.filter(
        (e) => e.transferSize === 0 && e.decodedBodySize > 0,
      ).length,
      vitals: window.__px ?? null,
      loading: [
        ...document.querySelectorAll(
          '[aria-busy="true"],[data-loading="true"],[data-slot="skeleton"],.animate-pulse',
        ),
      ].filter((e) => {
        const r = e.getBoundingClientRect(),
          s = getComputedStyle(e)
        return (
          r.width > 0 &&
          r.height > 0 &&
          s.display !== "none" &&
          s.visibility !== "hidden"
        )
      }).length,
      links: [...document.querySelectorAll("a[href]")]
        .map((a) => a.href)
        .filter((href) => href.startsWith(location.origin)),
    }
  })
}

async function uiMetrics(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await page.waitForTimeout(60)
  return page.evaluate((v) => {
    const visible = (e) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e)
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.display !== "none" &&
        s.visibility !== "hidden"
      )
    }
    const text = (e) =>
      (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 90)
    const name = (e) =>
      e.getAttribute("aria-label")?.trim() ||
      e
        .getAttribute("aria-labelledby")
        ?.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean)
        .join(" ") ||
      (e.labels?.length ? [...e.labels].map(text).join(" ") : "") ||
      e.getAttribute("placeholder") ||
      text(e) ||
      e.getAttribute("title") ||
      ""
    const controls = [
      ...document.querySelectorAll(
        'input:not([type="hidden"]),textarea,select',
      ),
    ].filter(visible)
    const ids = [...document.querySelectorAll("[id]")]
      .map((e) => e.id)
      .filter(Boolean)
    const clipped = [
      ...document.querySelectorAll(
        "main p,main span,main td,main th,main h1,main h2,main h3,main label,main button",
      ),
    ]
      .filter(visible)
      .filter((e) => {
        if (text(e).length < 12) return false
        const s = getComputedStyle(e)
        return (
          (e.scrollWidth > e.clientWidth + 2 &&
            ["hidden", "clip"].includes(s.overflowX)) ||
          (e.scrollHeight > e.clientHeight + 2 &&
            ["hidden", "clip"].includes(s.overflowY))
        )
      })
      .slice(0, 8)
      .map(text)
    return {
      viewport: v.name,
      overflow: Math.max(
        0,
        document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
      unnamedButtons: [...document.querySelectorAll('button,[role="button"]')]
        .filter(visible)
        .filter((e) => !name(e))
        .slice(0, 8)
        .map((e) => e.outerHTML.slice(0, 150)),
      unlabeledControls: controls
        .filter((e) => !name(e))
        .slice(0, 8)
        .map((e) => e.outerHTML.slice(0, 150)),
      missingAlt: [...document.querySelectorAll("img")]
        .filter(visible)
        .filter((e) => !e.hasAttribute("alt"))
        .slice(0, 8)
        .map((e) => e.getAttribute("src") ?? "img"),
      duplicateIds: [
        ...new Set(ids.filter((id, i) => ids.indexOf(id) !== i)),
      ].slice(0, 8),
      smallControls: [
        ...document.querySelectorAll(
          'button,[role="button"],[role="checkbox"],[role="switch"],input[type="checkbox"],input[type="radio"]',
        ),
      ]
        .filter(visible)
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 36 || r.height < 36)
        .slice(0, 8)
        .map(({ e, r }) => ({
          name: name(e).slice(0, 60),
          w: Math.round(r.width),
          h: Math.round(r.height),
        })),
      clipped,
    }
  }, viewport)
}

function internal(href, origin) {
  try {
    if (!href) return null
    const u = new URL(href, origin)
    if (
      u.origin !== origin ||
      u.pathname.startsWith("/api/") ||
      u.pathname.includes("/auth/callback") ||
      /\/(logout|signout)(\/|$)/i.test(u.pathname)
    )
      return null
    if (
      /\.(png|jpe?g|webp|avif|svg|gif|pdf|zip|csv|xlsx?|docx?)$/i.test(
        u.pathname,
      )
    )
      return null
    return `${u.pathname}${u.search}`
  } catch {
    return null
  }
}

const accessFor = (app, path) =>
  app === "admin"
    ? path === "/login"
      ? "public"
      : "protected"
    : /^\/(en|it|ar|ro|sq)\/(dashboard|onboarding)(\/|$)/.test(path)
      ? "protected"
      : "public"
const shotPath = (app, path, viewport) =>
  join(
    out,
    "screenshots",
    app,
    viewport,
    `${
      path
        .replace(/^\/+/, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .slice(0, 140) || "root"
    }.png`,
  )

function findings(r) {
  const f = []
  const d = r.metrics.document
  if (r.failure) f.push(`failure:${r.failure}`)
  if (r.metrics.wall > budgets.load) f.push("slow-cold-load")
  if ((d?.vitals?.lcp ?? 0) > budgets.lcp) f.push("slow-lcp")
  if ((d?.vitals?.cls ?? 0) > budgets.cls) f.push("layout-shift")
  if ((d?.vitals?.longTaskMs ?? 0) > budgets.longTasks) f.push("long-tasks")
  if ((d?.transfer ?? 0) > budgets.transfer) f.push("large-transfer")
  if (r.metrics.maxApi > budgets.api) f.push("slow-api")
  if (d?.loading) f.push("loading-left-visible")
  if (d && d.h1 !== 1) f.push("h1-count")
  if (d && d.main !== 1) f.push("main-count")
  r.ui.forEach((u) => {
    if (u.overflow > 1) f.push(`overflow:${u.viewport}`)
    if (u.unnamedButtons.length) f.push(`unnamed-buttons:${u.viewport}`)
    if (u.unlabeledControls.length) f.push(`unlabelled-controls:${u.viewport}`)
    if (u.missingAlt.length) f.push(`missing-alt:${u.viewport}`)
    if (u.duplicateIds.length) f.push("duplicate-ids")
    if (u.clipped.length) f.push(`clipped-text:${u.viewport}`)
  })
  if (
    r.access === "public" &&
    /no-store|private/i.test(r.cache.cold.cacheControl ?? "")
  )
    f.push("public-not-cacheable")
  return uniq(f, 30)
}

async function auditPage(context, record) {
  const origin = origins[record.app]
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1000 })
  const errors = [],
    pageErrors = [],
    failed = [],
    api = []
  let started = performance.now()
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 400))
  })
  page.on("pageerror", (e) => pageErrors.push(e.message.slice(0, 400)))
  page.on("requestfailed", (r) =>
    failed.push({ url: r.url(), error: r.failure()?.errorText ?? "unknown" }),
  )
  page.on("response", (response) => {
    const req = response.request()
    if (!["fetch", "xhr"].includes(req.resourceType())) return
    if (
      !response.url().includes("/api/") &&
      !response.url().startsWith(apiOrigin)
    )
      return
    const t = req.timing()
    api.push({
      url: response.url(),
      method: req.method(),
      status: response.status(),
      duration: t.responseEnd >= 0 ? Math.round(t.responseEnd) : null,
    })
  })
  let response = null,
    navError = null
  started = performance.now()
  try {
    response = await page.goto(`${origin}${record.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    await settle(page)
  } catch (e) {
    navError = e instanceof Error ? e.message : String(e)
  }
  const wall = Math.round(performance.now() - started)
  const failure = navError
    ? envFailure(navError)
      ? "environment"
      : "navigation"
    : !response?.ok()
      ? "http"
      : pageErrors.length
        ? "page"
        : null
  const document = await docMetrics(page).catch(() => null)
  const path = (() => {
    try {
      const u = new URL(page.url())
      return `${u.pathname}${u.search}`
    } catch {
      return record.route
    }
  })()
  const ui = [],
    shots = {}
  if (failure !== "environment" && failure !== "navigation") {
    for (const viewport of viewports) {
      ui.push(await uiMetrics(page, viewport))
      if (screenshots && ["desktop", "mobile"].includes(viewport.name)) {
        const p = shotPath(record.app, path, viewport.name)
        await mkdir(dirname(p), { recursive: true })
        await page
          .screenshot({ path: p, fullPage: true, animations: "disabled" })
          .catch(() => {})
        shots[viewport.name] = relative(out, p).replaceAll("\\", "/")
      }
    }
  }
  const coldApi = [...api]
  let warm = null
  if (warmReload && !failure) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const before = api.length
    started = performance.now()
    try {
      const res = await page.reload({
        waitUntil: "domcontentloaded",
        timeout: 30000,
      })
      await settle(page)
      const d = await docMetrics(page)
      warm = {
        wall: Math.round(performance.now() - started),
        transfer: d.transfer,
        cachedResources: d.cachedResources,
        api: api.slice(before),
        cache: cache(res),
      }
    } catch (e) {
      warm = { error: String(e?.message ?? e) }
    }
  }
  const result = {
    ...record,
    requested: `${origin}${record.route}`,
    final: page.url(),
    finalPath: path,
    redirected: path !== record.route,
    status: response?.status() ?? null,
    failure,
    cache: { cold: cache(response), warm: warm?.cache ?? null },
    metrics: {
      wall,
      document,
      maxApi: Math.max(0, ...coldApi.map((x) => x.duration ?? 0)),
      api: coldApi,
      warm,
    },
    ui,
    screenshots: shots,
    consoleErrors: uniq(errors),
    pageErrors: uniq(pageErrors),
    failedRequests: failed.slice(0, 15),
    links: uniq(document?.links ?? [], 300),
  }
  result.findings = findings(result)
  await page.close().catch(() => {})
  return result
}

async function login(context, app, a) {
  const page = await context.newPage(),
    origin = origins[app]
  const loginUrl = app === "website" ? `${origin}/en/login` : `${origin}/login`
  try {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 20000 })
    await page
      .getByLabel("Email address")
      .fill(app === "website" ? a.websiteEmail : a.adminEmail)
    if (app === "website")
      await page.locator("#password").fill(a.websitePassword)
    else
      await page.getByLabel("Password", { exact: true }).fill(a.adminPassword)
    await page
      .getByRole("button", { name: app === "website" ? /log in/i : /sign in/i })
      .click()
    await page.waitForURL(
      app === "website"
        ? /\/(dashboard|onboarding)(\/|$)/
        : /\/(dashboard|access-unassigned|access-denied)(\/|$)/,
      { timeout: 30000 },
    )
    await settle(page)
    const destination = page.url()
    await page.close()
    return { destination, error: null }
  } catch (e) {
    const error = String(e?.message ?? e)
    const destination = page.url()
    await page.close().catch(() => {})
    return {
      destination,
      error,
      failure: envFailure(error) ? "environment" : "authentication",
    }
  }
}

async function crawl(context, app, records, access) {
  const queue = records.filter((r) => r.access === access),
    seen = new Set(queue.map((r) => r.route)),
    results = []
  for (let i = 0; i < queue.length; i++) {
    const r = await auditPage(context, queue[i])
    results.push(r)
    console.log(
      `[${app}:${access} ${i + 1}/${queue.length}] ${queue[i].route} ${r.findings.length ? `WARN ${r.findings.join(",")}` : "OK"}`,
    )
    if (r.failure === "environment") break
    if (queue.length >= maxRoutes) continue
    for (const href of r.links) {
      const path = internal(href, origins[app])
      if (!path || seen.has(path) || accessFor(app, path) !== access) continue
      seen.add(path)
      queue.push({
        app,
        route: path,
        access,
        source: null,
        discovered: "rendered-link",
        from: r.finalPath,
      })
      if (queue.length >= maxRoutes) break
    }
  }
  return results
}

function graph(results, app) {
  const m = new Map()
  for (const r of results)
    for (const href of r.links ?? []) {
      const p = internal(href, origins[app])
      if (p && p !== r.finalPath && !m.has(p)) m.set(p, r.finalPath)
    }
  return m
}

async function transition(context, app, source, target) {
  const page = await context.newPage(),
    origin = origins[app],
    api = [],
    errors = []
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 300)))
  let active = false
  page.on("response", (res) => {
    const req = res.request()
    if (active && ["fetch", "xhr"].includes(req.resourceType())) {
      const t = req.timing()
      api.push({
        url: res.url(),
        status: res.status(),
        duration: t.responseEnd >= 0 ? Math.round(t.responseEnd) : null,
      })
    }
  })
  try {
    await page.goto(`${origin}${source}`, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    })
    await settle(page)
    await page.evaluate(() => {
      performance.clearResourceTimings()
      if (window.__px) window.__px.routeLongTaskMs = 0
    })
    const links = page.locator("a[href]")
    let chosen = null
    for (let i = 0; i < (await links.count()); i++) {
      const l = links.nth(i)
      if (!(await l.isVisible().catch(() => false))) continue
      const href = await l.getAttribute("href")
      if (internal(href, origin) === target) {
        chosen = l
        break
      }
    }
    if (!chosen)
      return { app, source, target, audited: false, reason: "link-not-visible" }
    active = true
    const started = performance.now()
    await Promise.all([
      page.waitForURL((u) => `${u.pathname}${u.search}` === target, {
        timeout: 20000,
      }),
      chosen.click(),
    ])
    await settle(page)
    const wall = Math.round(performance.now() - started)
    const extra = await page.evaluate(() => ({
      longTasks: window.__px?.routeLongTaskMs ?? 0,
      overflow: Math.max(
        0,
        document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    }))
    return {
      app,
      source,
      target,
      audited: true,
      wall,
      maxApi: Math.max(0, ...api.map((x) => x.duration ?? 0)),
      api,
      ...extra,
      pageErrors: uniq(errors),
      findings: uniq([
        wall > budgets.transition && "slow-client-transition",
        Math.max(0, ...api.map((x) => x.duration ?? 0)) > budgets.api &&
          "slow-api",
        extra.longTasks > budgets.longTasks && "long-tasks",
        extra.overflow > 1 && "overflow",
        errors.length && "page-error",
      ]),
    }
  } catch (e) {
    return {
      app,
      source,
      target,
      audited: false,
      reason: envFailure(e) ? "environment" : "transition-error",
      error: String(e?.message ?? e),
    }
  } finally {
    await page.close().catch(() => {})
  }
}

function summary(pages, transitions) {
  const ok = pages.filter((p) => !p.failure)
  return {
    total: pages.length,
    successful: ok.length,
    failed: pages.length - ok.length,
    findings: pages.filter((p) => p.findings.length).length,
    p50Load: pct(
      ok.map((p) => p.metrics.wall),
      0.5,
    ),
    p95Load: pct(
      ok.map((p) => p.metrics.wall),
      0.95,
    ),
    p95Lcp: pct(
      ok.map((p) => p.metrics.document?.vitals?.lcp ?? 0),
      0.95,
    ),
    overflowPages: pages.filter((p) => p.ui.some((u) => u.overflow > 1)).length,
    transitionP95: pct(
      transitions.filter((t) => t.audited).map((t) => t.wall),
      0.95,
    ),
  }
}

function markdown(report) {
  const lines = [
    "# Page Experience Audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Pages: **${report.summary.total}**, successful: **${report.summary.successful}**, findings: **${report.summary.findings}**.`,
    `Cold p95: **${report.summary.p95Load} ms**, LCP p95: **${report.summary.p95Lcp} ms**, client-transition p95: **${report.summary.transitionP95} ms**.`,
    "",
    "| App | Access | Route | Cold | Warm | LCP | Transfer | API max | Findings |",
    "|---|---|---|---:|---:|---:|---:|---:|---|",
  ]
  for (const p of report.pages)
    lines.push(
      `| ${p.app} | ${p.access} | \`${p.route}\` | ${p.metrics.wall} | ${p.metrics.warm?.wall ?? "-"} | ${Math.round(p.metrics.document?.vitals?.lcp ?? 0)} | ${Math.round((p.metrics.document?.transfer ?? 0) / 1024)} KB | ${p.metrics.maxApi} | ${p.findings.join(", ") || "OK"} |`,
    )
  lines.push(
    "",
    "## Client transitions",
    "",
    "| App | Source | Target | ms | Findings |",
    "|---|---|---|---:|---|",
  )
  for (const t of report.transitions)
    lines.push(
      `| ${t.app} | \`${t.source}\` | \`${t.target}\` | ${t.audited ? t.wall : "-"} | ${(t.findings ?? [t.reason]).filter(Boolean).join(", ") || "OK"} |`,
    )
  return `${lines.join("\n")}\n`
}

await mkdir(out, { recursive: true })
const [websiteInv, adminInv, a] = await Promise.all([
  inventory("website", resolve(root, "website/src/app")),
  inventory("admin", resolve(root, "admin-dashboard/src/app")),
  accounts(),
])
const browser = await chromium.launch({ headless: true })
const contexts = {
  websitePublic: await browser.newContext(),
  websiteProtected: await browser.newContext(),
  adminPublic: await browser.newContext(),
  adminProtected: await browser.newContext(),
}
await Promise.all(Object.values(contexts).map(observers))
const websitePublic = await crawl(
  contexts.websitePublic,
  "website",
  websiteInv.routes,
  "public",
)
const websiteLogin = await login(contexts.websiteProtected, "website", a)
const websiteProtected = websiteLogin.error
  ? []
  : await crawl(
      contexts.websiteProtected,
      "website",
      websiteInv.routes,
      "protected",
    )
const adminPublic = await crawl(
  contexts.adminPublic,
  "admin",
  adminInv.routes,
  "public",
)
const adminLogin = await login(contexts.adminProtected, "admin", a)
const adminProtected = adminLogin.error
  ? []
  : await crawl(contexts.adminProtected, "admin", adminInv.routes, "protected")
const pages = [
  ...websitePublic,
  ...websiteProtected,
  ...adminPublic,
  ...adminProtected,
]
const transitions = []
if (transitionsEnabled) {
  for (const [app, access, context, results] of [
    ["website", "public", contexts.websitePublic, websitePublic],
    ["website", "protected", contexts.websiteProtected, websiteProtected],
    ["admin", "protected", contexts.adminProtected, adminProtected],
  ]) {
    const g = graph(results, app)
    for (const target of new Set(
      results
        .filter((r) => !r.failure && r.access === access)
        .map((r) => r.finalPath),
    )) {
      const source = g.get(target)
      if (source)
        transitions.push(await transition(context, app, source, target))
    }
  }
}
const report = {
  generatedAt: new Date().toISOString(),
  environment: { ...origins, apiOrigin, locales },
  budgets,
  auth: { website: websiteLogin, admin: adminLogin },
  inventory: { website: websiteInv, admin: adminInv },
  pages,
  transitions,
  summary: summary(pages, transitions),
}
await Promise.all([
  writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`),
  writeFile(join(out, "report.md"), markdown(report)),
])
await Promise.all(Object.values(contexts).map((c) => c.close()))
await browser.close()
console.log(JSON.stringify(report.summary, null, 2))
console.log(
  `Reports: ${join(out, "report.json")} and ${join(out, "report.md")}`,
)
