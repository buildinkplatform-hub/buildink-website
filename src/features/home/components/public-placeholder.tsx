import Image from "next/image"
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  HardHat,
  Search,
  ShieldCheck,
} from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PublicNewsletterCard } from "@/features/public/components/public-newsletter-card"
import {
  PublicEntityVisual,
  PublicMetricStrip,
} from "@/features/public/components/public-visuals"
import {
  PublicLandingShell,
  PublicPageSection,
} from "@/features/public/components/public-shells"
import {
  getDirectoryFacets,
  getHomeView,
} from "@/features/public/data/public-repository"
import { Link } from "@/i18n/navigation"
import { getPublicViewer } from "@/lib/auth/session"
import type { PublicEntityRecord } from "@/features/public/types/public.types"
import type { Locale } from "@/shared/types/platform"

const journeySteps = [
  { key: "featureOne", icon: Search },
  { key: "featureTwo", icon: BriefcaseBusiness },
  { key: "featureThree", icon: BadgeCheck },
] as const

function CompactRecord({
  item,
  href,
  metric,
}: {
  item: PublicEntityRecord
  href: string
  metric: string
}) {
  return (
    <Link
      href={href}
      className="hover:bg-light-blue flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors"
    >
      <PublicEntityVisual
        module={item.module}
        title={item.title}
        compact
        className="h-16 w-16 shrink-0 rounded-2xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-brand-navy truncate text-sm font-semibold">{item.title}</p>
        <p className="text-muted truncate text-xs">{item.location}</p>
      </div>
      <div className="text-end text-xs font-semibold text-brand-navy">{metric}</div>
    </Link>
  )
}

function ExploreColumn({
  title,
  href,
  items,
  viewAllLabel,
}: {
  title: string
  href: string
  items: Array<{ item: PublicEntityRecord; metric: string }>
  viewAllLabel: string
}) {
  return (
    <Card className="rounded-[28px] border-white/70 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-brand-navy text-lg font-bold">{title}</h3>
        <Link href={href} className="text-primary text-sm font-semibold hover:underline">
          {viewAllLabel}
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {items.map(({ item, metric }) => (
          <CompactRecord
            key={item.slug}
            item={item}
            href={`${href}/${item.slug}`.replace("/companies/", "/companies/").replace("//", "/")}
            metric={metric}
          />
        ))}
      </div>
    </Card>
  )
}

export async function PublicPlaceholder() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations({ locale, namespace: "public" })
  const common = await getTranslations({ locale, namespace: "common" })
  const site = await getTranslations({ locale, namespace: "publicSite" })
  const viewer = await getPublicViewer(locale)
  const home = getHomeView(locale)
  const companyFacets = getDirectoryFacets("companies")
  const heroCategories = companyFacets.categories.slice(0, 8)
  const secondaryCategories = [
    t("categoryGeneralContractor"),
    t("categoryElectrical"),
    t("categoryPlumbing"),
    t("categoryHvac"),
    t("categoryEquipment"),
    t("categoryWorkersLabor"),
    t("categorySuppliers"),
    t("categoryEngineering"),
  ]
  const highlightColumns = [
    {
      title: t("featuredCompanies"),
      href: "/companies",
      items: home.featured.companies.map((item) => ({
        item,
        metric: item.metrics[2]?.value ?? "4.8",
      })),
    },
    {
      title: t("topRatedWorkers"),
      href: "/profiles",
      items: home.featured.profiles.map((item) => ({
        item,
        metric: item.metrics[0]?.value ?? "4.9",
      })),
    },
    {
      title: t("latestTenders"),
      href: "/tenders",
      items: home.featured.tenders.map((item) => ({
        item,
        metric: item.metrics[0]?.value ?? "24d",
      })),
    },
    {
      title: t("latestProjects"),
      href: "/projects",
      items: home.featured.projects.map((item) => ({
        item,
        metric: item.metrics[1]?.value ?? "95%",
      })),
    },
  ]

  return (
    <PublicLandingShell
      hero={
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#f4f8ff_48%,#fff_100%)] pb-12 pt-10 sm:pb-16 sm:pt-14">
          <div className="page-container relative">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
              <div className="pt-4">
                <Badge className="mb-5">{t("eyebrow")}</Badge>
                <h1 className="text-brand-navy max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
                  {t("title")}
                </h1>
                <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
                  {t("body")}
                </p>
                <Card className="mt-7 rounded-[26px] border-white/70 p-3 shadow-[var(--shadow-card)]">
                  <form
                    action={`/${locale}/search`}
                    className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
                  >
                    <div className="relative">
                      <Search className="text-muted pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2" />
                      <Input
                        name="q"
                        placeholder={site("filters.searchPlaceholder")}
                        className="min-h-13 rounded-2xl border-0 bg-canvas ps-11 text-base shadow-none"
                      />
                    </div>
                    <Select name="category" defaultValue="__all__">
                      <SelectTrigger className="min-h-13 rounded-2xl border-white/70 bg-white text-base">
                        <SelectValue placeholder={site("filters.allCategories")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">
                          {site("filters.allCategories")}
                        </SelectItem>
                        {heroCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" className="min-h-13 rounded-2xl px-7">
                      {t("searchAction")}
                    </Button>
                  </form>
                </Card>
              </div>
              <div className="relative">
                <Card className="relative overflow-hidden rounded-[34px] border-white/70 p-0 shadow-[var(--shadow-card)]">
                  <div className="relative h-[460px] bg-[linear-gradient(135deg,#d7e7ff_0%,#f2f7ff_46%,#ffffff_100%)]">
                    <Image
                      src="/branding/hero-construction-marketplace.png"
                      alt={t("heroImageAlt")}
                      fill
                      className="object-cover"
                      style={{ objectPosition: "72% 48%" }}
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,31,68,0.06)_0%,rgba(10,31,68,0)_45%,rgba(10,31,68,0.05)_100%)]" />
                    <div className="absolute start-5 top-5 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                      <p className="text-muted text-xs font-semibold uppercase tracking-[0.12em]">
                        {t("heroStatVerified")}
                      </p>
                      <p className="text-brand-navy text-2xl font-bold">10,425+</p>
                    </div>
                    <div className="absolute end-5 top-32 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                      <p className="text-muted text-xs font-semibold uppercase tracking-[0.12em]">
                        {t("heroStatTenders")}
                      </p>
                      <p className="text-brand-navy text-2xl font-bold">2,358+</p>
                    </div>
                    <div className="absolute bottom-6 end-5 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                      <p className="text-muted text-xs font-semibold uppercase tracking-[0.12em]">
                        {t("heroStatWorkers")}
                      </p>
                      <p className="text-brand-navy text-2xl font-bold">12,876+</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <Card className="mt-6 rounded-[28px] border-white/70 p-3 shadow-[var(--shadow-card)]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {secondaryCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/companies?category=${encodeURIComponent(category)}`}
                    className="hover:bg-light-blue flex min-h-18 items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition-colors"
                  >
                    <div>
                      <p className="text-brand-navy text-sm font-semibold">{category}</p>
                      <p className="text-muted mt-1 text-xs">{t("viewLabel")}</p>
                    </div>
                    <ChevronRight className="size-4 text-primary" />
                  </Link>
                ))}
              </div>
            </Card>
            <div className="mt-6">
              <PublicMetricStrip items={home.metrics} className="xl:grid-cols-6" />
            </div>
          </div>
        </section>
      }
    >
      <PublicPageSection
        title={t("howItWorksTitle")}
        description={t("howItWorksBody")}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {journeySteps.map(({ key, icon: Icon }, index) => (
            <Card
              key={key}
              className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary text-white flex size-11 items-center justify-center rounded-2xl text-base font-bold">
                  {index + 1}
                </div>
                <div className="bg-light-blue text-primary flex size-14 items-center justify-center rounded-2xl">
                  <Icon className="size-7" />
                </div>
              </div>
              <h3 className="text-brand-navy mt-5 text-xl font-bold">{t(key)}</h3>
              <p className="text-muted mt-3 text-sm leading-7">{t(`${key}Body`)}</p>
            </Card>
          ))}
        </div>
      </PublicPageSection>

      <PublicPageSection
        title={t("exploreTitle")}
        description={t("exploreBody")}
      >
        <div className="grid gap-5 xl:grid-cols-4">
          {highlightColumns.map((column) => (
            <ExploreColumn
              key={column.title}
              title={column.title}
              href={column.href}
              items={column.items}
              viewAllLabel={t("viewAllLabel")}
            />
          ))}
        </div>
      </PublicPageSection>

      <PublicPageSection
        eyebrow={site("pages.verification.eyebrow")}
        title={site("pages.verification.title")}
        description={site("pages.verification.description")}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: site("pages.verification.cards.card1Title"),
              body: site("pages.verification.cards.card1Body"),
              icon: ShieldCheck,
            },
            {
              title: site("pages.verification.cards.card2Title"),
              body: site("pages.verification.cards.card2Body"),
              icon: HardHat,
            },
            {
              title: site("pages.verification.cards.card3Title"),
              body: site("pages.verification.cards.card3Body"),
              icon: BadgeCheck,
            },
          ].map(({ title, body, icon: Icon }) => (
            <Card
              key={title}
              className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)]"
            >
              <div className="bg-light-blue text-primary flex size-14 items-center justify-center rounded-2xl">
                <Icon className="size-7" />
              </div>
              <h3 className="text-brand-navy mt-5 text-xl font-bold">{title}</h3>
              <p className="text-muted mt-3 text-sm leading-7">{body}</p>
            </Card>
          ))}
        </div>
      </PublicPageSection>

      <PublicPageSection
        eyebrow={site("home.proofEyebrow")}
        title={t("testimonialsTitle")}
        description={t("testimonialsBody")}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {home.testimonials.map((quote) => (
            <Card
              key={quote.name}
              className="rounded-[28px] border-white/70 p-6 shadow-[var(--shadow-card)]"
            >
              <p className="text-brand-navy text-lg font-semibold leading-8">
                “{quote.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="bg-light-blue text-primary flex size-11 items-center justify-center rounded-full text-sm font-bold">
                  {quote.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-brand-navy text-sm font-semibold">{quote.name}</p>
                  <p className="text-muted text-xs">{quote.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PublicPageSection>

      <div className="page-container">
        <Card className="overflow-hidden rounded-[32px] border-white/70 bg-brand-navy px-6 py-7 text-white shadow-[var(--shadow-card)] sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                {t("ctaEyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">{t("ctaTitle")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {t("ctaBody")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button asChild variant="secondary">
                <Link href={viewer?.profileHref ?? "/register"}>
                  {viewer ? common("visitDashboard") : t("primary")}
                </Link>
              </Button>
              <Button asChild className="bg-white text-brand-navy hover:bg-white/90">
                <Link href="/tenders">{site("nav.items.tenders")}</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="page-container">
        <PublicNewsletterCard
          title={site("newsletter.title")}
          body={site("newsletter.body")}
          placeholder={site("newsletter.placeholder")}
          consent={site("newsletter.consent")}
          action={site("newsletter.action")}
          success={site("newsletter.success")}
        />
      </div>
    </PublicLandingShell>
  )
}
