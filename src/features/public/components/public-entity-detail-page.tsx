import {
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TabsNav } from "@/components/ui/tabs"
import { PublicEntityCard } from "@/features/public/components/public-cards"
import { PublicEntityVisual } from "@/features/public/components/public-visuals"
import { PublicAbuseForm } from "@/features/public/components/public-abuse-form"
import { PublicReviewsPanel } from "@/features/public/components/public-reviews-panel"
import {
  SaveItemButton,
} from "@/features/public/components/save-item-button"
import { entityTypeForModule } from "@/features/saved/saved-items.utils"
import { EntityDetailShell } from "@/features/public/components/public-shells"
import {
  getCompanySubpageFromEntity,
  getPublicEntity,
  getPublicReviews,
  getRelatedEntities,
} from "@/features/public/data/public-repository"
import { getReviewEligibility } from "@/features/dashboard/data/portal-client"
import { moduleRouteMap } from "@/features/public/config/public-site.config"
import { Link } from "@/i18n/navigation"
import { getPublicViewer } from "@/lib/auth/session"
import type { Locale } from "@/shared/types/platform"
import type {
  PublicEntityRecord,
  PublicModule,
  PublicReviewTarget,
} from "@/features/public/types/public.types"

function resolveReviewTarget(
  module: PublicModule,
  item: { id?: string; reviewTarget?: PublicReviewTarget | null },
): PublicReviewTarget | null {
  if (item.reviewTarget) return item.reviewTarget
  if (!item.id) return null
  switch (module) {
    case "companies":
    case "suppliers":
      return { type: "COMPANY", id: item.id }
    case "projects":
      return { type: "PROJECT", id: item.id }
    case "profiles":
      return { type: "WORKER", id: item.id }
    case "equipment":
    case "tenders":
    case "opportunities-companies":
    case "opportunities-workers":
      return null
    default: {
      const exhaustive: never = module
      return exhaustive
    }
  }
}

export async function PublicEntityDetailPage({
  module,
  slug,
  companySection,
  record,
}: {
  module: PublicModule
  slug: string
  companySection?: string
  record?: PublicEntityRecord
}) {
  const t = await getTranslations("publicSite")
  const locale = (await getLocale()) as Locale
  const item = record ?? (await getPublicEntity(module, slug, locale))
  if (!item) notFound()

  const related = await getRelatedEntities(module, item, locale)
  const isReviewsTab = module === "companies" && companySection === "reviews"
  const companySubpage =
    module === "companies" && companySection
      ? await getCompanySubpageFromEntity(item, companySection)
      : null
  const title = isReviewsTab
    ? t("tabs.reviews")
    : (companySubpage?.title ?? item.title)
  const description = isReviewsTab
    ? t("userReviews.subtitle")
    : (companySubpage?.description ?? item.subtitle)
  const sections = isReviewsTab
    ? []
    : (companySubpage?.sections ?? item.sections)
  const reviewTarget = resolveReviewTarget(module, item)
  const showReviews =
    Boolean(reviewTarget) && (module !== "companies" || isReviewsTab)
  const saveEntityType = entityTypeForModule(module)
  const viewer =
    showReviews || saveEntityType
      ? await getPublicViewer(locale)
      : null
  const reviews =
    showReviews && reviewTarget
      ? await getPublicReviews(reviewTarget, locale)
      : null
  const eligibility =
    showReviews && reviewTarget && viewer
      ? await getReviewEligibility({
          targetType: reviewTarget.type,
          targetId: reviewTarget.id,
        }).catch(() => null)
      : null
  const loginHref = `/${locale}${moduleRouteMap[module]}/${slug}${
    isReviewsTab ? "/reviews" : ""
  }`

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
              ...(["services", "projects", "catalogue", "equipment", "reviews", "certifications", "contact"] as const)
                .filter((tab) => {
                  if (tab === "catalogue" || tab === "equipment") {
                    return Boolean(item.subpages?.some((page) => page.slug === tab))
                  }
                  return true
                })
                .map((tab) => ({
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
              {item.contact?.email ? (
                <Button asChild>
                  <a href={`mailto:${item.contact.email}`}>{t("actions.primaryContact")}</a>
                </Button>
              ) : null}
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
              {saveEntityType ? (
                <SaveItemButton
                  entityType={saveEntityType}
                  entityId={item.id}
                  label={item.title}
                  slug={item.slug}
                  module={module}
                  kind={
                    module === "opportunities-workers"
                      ? "WORKFORCE_REQUEST"
                      : undefined
                  }
                  isAuthenticated={Boolean(viewer)}
                  loginHref={`/login?next=${encodeURIComponent(loginHref)}`}
                />
              ) : null}
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
          {item.id ? (
            <div className="mt-3">
              <PublicAbuseForm
                entityType={module}
                entityId={item.id}
                action={t("forms.report")}
                success={t("forms.reportSuccess")}
              />
            </div>
          ) : null}
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
              {section.itemLinks?.length ? (
                <ul className="mt-5 space-y-2 text-sm leading-7 text-muted">
                  {section.itemLinks.map((entry) => (
                    <li key={entry.href} className="flex gap-3">
                      <span className="mt-2 size-1.5 rounded-full bg-primary" />
                      <Link href={entry.href} className="text-primary font-semibold">
                        {entry.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : section.items?.length ? (
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

      {showReviews && reviewTarget ? (
        <PublicReviewsPanel
          target={reviewTarget}
          locale={locale}
          signedIn={Boolean(viewer)}
          loginHref={loginHref}
          reviews={reviews}
          eligibility={eligibility}
        />
      ) : null}

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
