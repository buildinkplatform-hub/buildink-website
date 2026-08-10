import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { demoDashboardRepository } from "@/features/dashboard/data/dashboard.repository"
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
  requestWorkers: "worker-requests",
  browseTenders: "tenders",
  createProposal: "proposals",
  updateAvailability: "availability",
  addCertificate: "documents",
  addCatalogItem: "catalog",
  reviewRequests: "requests",
  addEquipment: "equipment",
  reviewEnquiries: "enquiries",
}

export async function DashboardPage({ session }: { session: SessionClaims }) {
  const t = await getTranslations()
  const data = await demoDashboardRepository.getOverview(session.profileType)
  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-sm font-bold tracking-widest uppercase">
            {t("common.dashboard")}
          </p>
          <h1 className="text-brand-navy mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("dashboard.greeting", { name: session.name })}
          </h1>
          <p className="text-muted mt-2">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.quickActionKeys.map((action, index) => (
            <Button
              key={action}
              asChild
              variant={index ? "secondary" : "primary"}
              size="sm"
            >
              <Link href={`/dashboard/${actionRoutes[action]}`}>
                {t(`dashboard.actions.${action}`)}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <section
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Metrics"
      >
        {data.metrics.map((metric) => (
          <Card key={metric.labelKey} className="p-5 shadow-sm">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                toneClasses[metric.tone],
              )}
            >
              <Sparkles className="size-5" />
            </div>
            <p className="text-brand-navy ltr-content mt-5 text-3xl font-bold">
              {metric.value}
            </p>
            <p className="text-muted mt-1 text-sm">{t(metric.labelKey)}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="overflow-hidden shadow-sm">
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
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link href="/dashboard/profile">
                {t("dashboard.completeProfile")}
              </Link>
            </Button>
          </div>
        </Card>
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-brand-navy text-sm font-bold">
                {t("dashboard.tasks")}
              </p>
              <p className="text-muted mt-1 text-sm">
                {data.tasks.length} matched items
              </p>
            </div>
            <Clock3 className="text-primary size-5" />
          </div>
          <div className="divide-line mt-5 divide-y">
            {data.tasks.map((item) => (
              <article
                key={item.titleKey}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-brand-navy font-semibold">
                    {t(item.titleKey)}
                  </h2>
                  <p className="text-muted mt-1 text-sm leading-6">
                    {t(item.descriptionKey)}
                  </p>
                  <p className="text-primary mt-2 text-xs font-semibold">
                    {t(item.metaKey)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-6 shadow-sm">
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
            {data.notifications.map((item) => (
              <article
                key={item.titleKey}
                className="bg-canvas flex gap-4 rounded-xl p-4"
              >
                <div className="bg-light-blue text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <BellRing className="size-5" />
                </div>
                <div>
                  <h3 className="text-brand-navy text-sm font-semibold">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-muted mt-1 text-sm leading-6">
                    {t(item.descriptionKey)}
                  </p>
                  <p className="text-muted mt-2 text-xs">{t(item.metaKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
