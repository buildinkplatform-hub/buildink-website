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
  blue: "bg-light-blue text-primary",
  green: "bg-success/10 text-success",
  orange: "bg-warning/10 text-warning",
  navy: "bg-brand-navy/8 text-brand-navy",
}

const actionRoutes: Record<string, string> = {
  publishProject: "projects",
  requestWorkers: "workforce",
  browseTenders: "tenders",
  createProposal: "offers",
  updateAvailability: "workforce",
  addCertificate: "verification",
  addCatalogItem: "catalogue",
  reviewRequests: "offers",
  addEquipment: "equipment",
  reviewEnquiries: "messages",
}

export async function DashboardPage({ session }: { session: SessionClaims }) {
  const t = await getTranslations()
  const eventT = await getTranslations("dashboard.notificationEvents")
  const format = await getFormatter()
  const [bootstrap, notifications, dashboard] = await Promise.all([
    getPortalBootstrap(),
    listPortalNotifications(
      { pageSize: 4 },
      { signal: AbortSignal.timeout(6_000) },
    ),
    getPortalDashboardMetrics({ signal: AbortSignal.timeout(6_000) }),
  ])

  const data = overviewFromAccount({
    profileType: session.profileType,
    primaryAccountType: session.primaryAccountType,
    modules: bootstrap?.entitlements.modules ?? session.modules,
    counts: bootstrap?.counts ?? session.counts,
    metrics: dashboard.metrics,
    completion: dashboard.completion,
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
                  className={index ? "bg-white/90" : ""}
                >
                  <Link href={`/dashboard/${actionRoutes[action] ?? "profile"}`}>
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
            className="rounded-xl border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-muted text-sm">{t(metric.labelKey)}</p>
                <p className="text-brand-navy ltr-content text-3xl font-bold">
                  {metric.value}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl",
                  toneClasses[metric.tone],
                )}
              >
                <Sparkles className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="overflow-hidden rounded-xl border-slate-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="bg-[linear-gradient(135deg,#071A33,#0B2450)] p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-interactive text-sm font-semibold">
                  {t("dashboard.completion")}
                </p>
                <p className="ltr-content mt-2 text-4xl font-bold">
                  {data.completion}%
                </p>
              </div>
              <CheckCircle2 className="text-interactive size-8" />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="bg-interactive h-full rounded-full"
                style={{ width: `${data.completion}%` }}
              />
            </div>
          </div>
          <div className="p-6">
            <p className="text-muted leading-7">
              {t("dashboard.completionBody")}
            </p>
            <Button asChild variant="secondary" className="mt-5 w-full bg-white">
              <Link href="/dashboard/profile">
                {t("dashboard.completeProfile")}
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="rounded-xl border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-brand-navy text-sm font-bold">
                {t("dashboard.workspaceTitle")}
              </p>
              <p className="text-muted mt-1 text-sm">
                {bootstrap?.workspaces.length
                  ? t("dashboard.workspaceCount", {
                      count: bootstrap.workspaces.length,
                    })
                  : t("dashboard.noWorkspace")}
              </p>
            </div>
            <Clock3 className="text-primary size-5" />
          </div>
          <div className="divide-line mt-5 divide-y">
            {(bootstrap?.workspaces ?? []).slice(0, 4).map((workspace) => (
              <article
                key={workspace.membershipId}
                className="py-4 first:pt-0 last:pb-0"
              >
                <h2 className="text-brand-navy font-semibold">
                  {workspace.name}
                </h2>
                <p className="text-muted mt-1 text-sm leading-6">
                  {workspace.role} - {workspace.status}
                </p>
              </article>
            ))}
            {!bootstrap?.workspaces.length ? (
              <p className="text-muted text-sm">{t("dashboard.moduleReady")}</p>
            ) : null}
          </div>
        </Card>
      </section>

      <section>
        <Card className="rounded-xl border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-brand-navy font-bold">
              {t("dashboard.recent")}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/notifications">
                {t("dashboard.viewAll")}
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {recent.length ? (
              recent.map((item) => (
                <article
                  key={item.id}
                  className="bg-canvas flex gap-4 rounded-xl border border-slate-200/70 p-4"
                >
                  <div className="bg-light-blue text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <BellRing className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-brand-navy text-sm font-semibold">
                      {portalNotificationTitle(eventT, item.type)}
                    </h3>
                    <p className="text-muted mt-2 text-xs">
                      {format.dateTime(new Date(item.createdAt), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-muted text-sm">
                {t("dashboard.notificationsEmpty")}
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
