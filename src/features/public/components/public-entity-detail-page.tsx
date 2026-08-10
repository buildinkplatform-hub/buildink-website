import {
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TabsNav } from "@/components/ui/tabs"
import { PublicEntityCard } from "@/features/public/components/public-cards"
import { PublicEntityVisual } from "@/features/public/components/public-visuals"
import { EntityDetailShell } from "@/features/public/components/public-shells"
import {
  getCompanySubpage,
  getPublicEntity,
  getRelatedEntities,
} from "@/features/public/data/public-repository"
import { moduleRouteMap } from "@/features/public/config/public-site.config"
import { Link } from "@/i18n/navigation"
import type { PublicModule } from "@/features/public/types/public.types"

export async function PublicEntityDetailPage({
  module,
  slug,
  companySection,
}: {
  module: PublicModule
  slug: string
  companySection?: string
}) {
  const t = await getTranslations("publicSite")
  const item = getPublicEntity(module, slug)
  if (!item) notFound()

  const related = getRelatedEntities(module, item)
  const companySubpage =
    module === "companies" && companySection
      ? getCompanySubpage(slug, companySection)
      : null
  const title = companySubpage?.title ?? item.title
  const description = companySubpage?.description ?? item.subtitle
  const sections = companySubpage?.sections ?? item.sections

  const tabs =
    module === "companies"
      ? (
          <TabsNav
            items={[
              {
                value: "overview",
                label: t("tabs.overview"),
                href: `${moduleRouteMap.companies}/${slug}`,
                active: !companySection,
              },
              ...["services", "projects", "reviews", "certifications", "contact"].map((tab) => ({
                value: tab,
                label: t(`tabs.${tab}`),
                href: `${moduleRouteMap.companies}/${slug}/${tab}`,
                active: companySection === tab,
              })),
            ]}
          />
        )
      : undefined

  return (
    <EntityDetailShell
      hero={
        <Card className="overflow-hidden rounded-[34px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <Breadcrumb
            items={[
              { label: t("nav.items.home"), href: "/" },
              {
                label: t(`modules.${module}`),
                href: moduleRouteMap[module],
              },
              { label: item.title },
            ]}
          />
          <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-light-blue text-primary flex size-18 shrink-0 items-center justify-center rounded-[28px]">
                <Building2 className="size-9" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.verification}</Badge>
                  <div className="text-muted inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="size-4 fill-current text-amber-400" />
                    {t("detail.reviewSummary", { rating: "4.8", count: "128" })}
                  </div>
                </div>
                <h1 className="text-brand-navy mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                  {title}
                </h1>
                <p className="text-muted mt-3 max-w-3xl text-base leading-7 sm:text-lg">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href={moduleRouteMap[module]}>{t("actions.viewDetails")}</Link>
              </Button>
              <Button>{t("actions.primaryContact")}</Button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-brand-navy"
              >
                {category}
              </span>
            ))}
          </div>
        </Card>
      }
      tabs={tabs}
      aside={
        <div className="space-y-4">
          <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-brand-navy text-lg font-bold">
              {t("detail.aboutTitle", { name: item.title })}
            </h2>
            <p className="text-muted mt-3 text-sm leading-7">{item.summary}</p>
            <div className="mt-5 space-y-3 text-sm text-muted">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-primary" />
                <span>{item.location}</span>
              </div>
              {item.contact.website ? (
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 size-4 text-primary" />
                  <span className="ltr-content">{item.contact.website}</span>
                </div>
              ) : null}
              {item.contact.email ? (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-primary" />
                  <span className="ltr-content">{item.contact.email}</span>
                </div>
              ) : null}
              {item.contact.phone ? (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-primary" />
                  <span className="ltr-content">{item.contact.phone}</span>
                </div>
              ) : null}
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-primary" />
                <span>{item.verification}</span>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <Button>{t("actions.primaryContact")}</Button>
              <Button variant="secondary">{t("actions.saveItem")}</Button>
            </div>
          </Card>

          <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-brand-navy text-base font-bold">
              {t("detail.keyMetricsTitle")}
            </h3>
            <div className="mt-4 space-y-3">
              {item.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f6f9ff_100%)] p-4"
                >
                  <p className="text-brand-navy text-lg font-bold">{metric.value}</p>
                  <p className="text-muted mt-1 text-xs leading-5">{metric.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {item.contact.website ? (
            <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-brand-navy text-base font-bold">
                {t("detail.officialWebsiteTitle")}
              </h3>
              <p className="text-muted mt-3 text-sm leading-7">
                {t("detail.officialWebsiteBody")}
              </p>
              <div className="mt-4">
                <Button asChild variant="secondary">
                  <a
                    href={item.contact.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    {t("detail.visitWebsite")}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            </Card>
          ) : null}

          <Alert>{t("detail.reportHint")}</Alert>
        </div>
      }
    >
      <Card className="overflow-hidden rounded-[32px] border-white/70 p-0 shadow-[var(--shadow-card)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-6 sm:p-8">
            <Badge>{item.verification}</Badge>
            <h2 className="text-brand-navy mt-4 text-3xl font-bold tracking-[-0.03em]">
              {title}
            </h2>
            <p className="text-muted mt-4 text-base leading-8">
              {item.summary}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {item.metrics.slice(0, 3).map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f6f9ff_100%)] p-4"
                >
                  <p className="text-brand-navy text-xl font-bold">{metric.value}</p>
                  <p className="text-muted mt-1 text-xs leading-5">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <PublicEntityVisual
              module={module}
              title={title}
              className="h-full min-h-80 rounded-[28px]"
            />
          </div>
        </div>
      </Card>

      {sections.map((section, index) => (
        <Card
          key={section.id}
          className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              <h2 className="text-brand-navy text-2xl font-bold">{section.title}</h2>
              <p className="text-muted mt-4 text-base leading-8">{section.body}</p>
              {section.items?.length ? (
                <ul className="mt-5 space-y-2 text-sm leading-7 text-muted">
                  {section.items.map((entry) => (
                    <li key={entry} className="flex gap-3">
                      <span className="mt-2 size-1.5 rounded-full bg-primary" />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <PublicEntityVisual
              module={module}
              title={`${title}-${section.id}`}
              compact
              className={index % 2 === 0 ? "h-48 lg:h-full" : "h-48 lg:h-full"}
            />
          </div>
        </Card>
      ))}

      {related.length ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-brand-navy text-2xl font-bold">
                {t("detail.relatedTitle")}
              </h2>
              <p className="text-muted mt-2 text-base leading-7">
                {t("detail.relatedBody")}
              </p>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {related.map((relatedItem) => (
              <PublicEntityCard
                key={relatedItem.slug}
                item={relatedItem}
                href={`${moduleRouteMap[module]}/${relatedItem.slug}`}
                actionLabel={t("actions.viewDetails")}
              />
            ))}
          </div>
        </section>
      ) : null}
    </EntityDetailShell>
  )
}
