import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import { overviewFromAccount } from "@/features/dashboard/data/dashboard.repository"
import {
  getPortalBootstrap,
  getPortalDashboardMetrics,
  listPortalNotifications,
} from "@/features/dashboard/data/portal-client"
import { portalNotificationTitle } from "@/features/dashboard/notifications/notification-copy"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import type { SessionClaims } from "@/shared/types/platform"

const toneClasses = {
  blue: "bg-light-blue text-primary border-primary/8",
  green: "bg-success/10 text-success border-success/10",
  orange: "bg-warning/10 text-warning border-warning/10",
  navy: "bg-brand-navy/8 text-brand-navy border-brand-navy/8",
}

const actionRoutes: Record<string, string> = {
  publishProject: "projects",
  requestWorkers: "workforce",
  browseTenders: "tenders",
  createProposal: "offers/create",
  updateAvailability: "workforce",
  addCertificate: "verification",
  addCatalogItem: "catalogue",
  reviewRequests: "offers",
  addEquipment: "equipment",
  reviewEnquiries: "messages",
}

function humanize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase())
}

export async function DashboardPage({ session }: { session: SessionClaims }) {
  const t = await getTranslations()
  const eventT = await getTranslations("dashboard.notificationEvents")
  const format = await getFormatter()
  const [bootstrap, notifications, dashboard] = await Promise.all([
    getPortalBootstrap(),
    // Notification preview and metric aggregation are auxiliary dashboard data.
    // They must not remove the primary quick actions when a cold backend request
    // misses its latency budget.
    listPortalNotifications(
      { pageSize: 4 },
      { signal: AbortSignal.timeout(6_000) },
    ).catch(() => ({ items: [], unreadCount: 0 })),
    getPortalDashboardMetrics({ signal: AbortSignal.timeout(6_000) }).catch(
      () => null,
    ),
  ])

  const data = overviewFromAccount({
    profileType: session.profileType,
    primaryAccountType: session.primaryAccountType,
    modules: bootstrap?.entitlements.modules ?? session.modules,
    counts: bootstrap?.counts ?? session.counts,
    metrics: dashboard?.metrics,
    completion: dashboard?.completion,
    verificationStatus: bootstrap?.profile.verificationStatus,
    displayName: bootstrap?.profile.displayName,
    phone: bootstrap?.profile.phone,
  })
  const recent = notifications.items.slice(0, 4)

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.greeting", { name: session.name })}
        description={`${t("dashboard.subtitle")} ${t("dashboard.accountOnly")}`}
        actions={
          data.quickActionKeys.length ? (
            <>
              {data.quickActionKeys.map((action, index) => (
                <Button
                  key={action}
                  asChild
                  variant={index ? "secondary" : "primary"}
                  size="sm"
                >
                  <Link
                    href={`/dashboard/${actionRoutes[action] ?? "profile"}`}
                  >
                    {t(`dashboard.actions.${action}`)}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
              ))}
            </>
          ) : undefined
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={t("common.metrics")}
      >
        {data.metrics.map((metric) => (
          <Card
            key={metric.labelKey}
            className="group hover:border-primary/15 overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] motion-reduce:hover:translate-y-0"
          >
            <div className="flex min-h-[112px] items-start justify-between gap-4 p-5">
              <div className="min-w-0 space-y-1.5">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.01em]">
                  {t(metric.labelKey)}
                </p>
                <p className="text-brand-navy ltr-content text-[1.75rem] leading-8 font-bold tracking-[-0.035em] tabular-nums">
                  {metric.value}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:transition-none",
                  toneClasses[metric.tone],
                )}
              >
                <Sparkles className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <Card className="overflow-hidden">
          <div className="border-line/70 border-b bg-[linear-gradient(135deg,rgba(7,26,51,.98),rgba(11,36,80,.94))] p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-interactive text-xs font-bold tracking-[0.12em] uppercase">
                  {t("dashboard.completion")}
                </p>
                <p className="ltr-content mt-2 text-4xl font-bold tracking-[-0.04em]">
                  {data.completion}%
                </p>
              </div>
              <div className="grid size-11 place-items-center rounded-2xl border border-white/12 bg-white/8">
                <CheckCircle2 className="text-interactive size-5" />
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-500"
                style={{ width: `${data.completion}%` }}
              />
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-muted-foreground text-sm leading-6">
              {t("dashboard.completionBody")}
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mt-5 w-full sm:w-auto"
            >
              <Link href="/dashboard/profile">
                {t("dashboard.completeProfile")}
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-brand-navy font-bold tracking-[-0.02em]">
                {t("dashboard.workspaceTitle")}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {bootstrap?.workspaces.length
                  ? t("dashboard.workspaceCount", {
                      count: bootstrap.workspaces.length,
                    })
                  : t("dashboard.noWorkspace")}
              </p>
            </div>
            <div className="bg-primary/8 text-primary border-primary/8 grid size-10 shrink-0 place-items-center rounded-2xl border">
              <Clock3 className="size-4" />
            </div>
          </div>

          <div className="divide-line mt-5 divide-y">
            {(bootstrap?.workspaces ?? []).slice(0, 4).map((workspace) => (
              <article
                key={workspace.membershipId}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-brand-navy truncate text-sm font-semibold">
                    {workspace.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {humanize(workspace.role)}
                  </p>
                </div>
                <StatusBadge status={workspace.status} />
              </article>
            ))}
            {!bootstrap?.workspaces.length ? (
              <div className="border-line/70 bg-canvas/70 mt-4 rounded-2xl border border-dashed p-5">
                <p className="text-muted-foreground text-sm leading-6">
                  {t("dashboard.moduleReady")}
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-brand-navy font-bold tracking-[-0.02em]">
                {t("dashboard.recent")}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("dashboard.accountOnly")}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/notifications">
                {t("dashboard.viewAll")}
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recent.length ? (
              recent.map((item) => (
                <article
                  key={item.id}
                  className="border-line/70 bg-canvas/65 hover:bg-light-blue/45 flex gap-4 rounded-2xl border p-4 transition-colors"
                >
                  <div className="bg-light-blue text-primary border-primary/8 flex size-10 shrink-0 items-center justify-center rounded-2xl border">
                    <BellRing className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-brand-navy text-sm font-semibold">
                      {portalNotificationTitle(eventT, item.type)}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {format.dateTime(new Date(item.createdAt), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-line/70 bg-canvas/65 col-span-full rounded-2xl border border-dashed p-8 text-center">
                <BellRing className="text-primary/60 mx-auto size-5" />
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("dashboard.notificationsEmpty")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
