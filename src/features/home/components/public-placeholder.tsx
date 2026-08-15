import Image from "next/image"
import {
  BadgeCheck,
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
import { Reveal } from "@/components/motion/reveal"
import { getPublicViewer } from "@/lib/auth/session"
import type { PublicEntityRecord } from "@/features/public/types/public.types"
import type { Locale } from "@/shared/types/platform"

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
      className="hover:bg-light-blue flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 transition-colors"
    >
      <PublicEntityVisual
        module={item.module}
        title={item.title}
        compact
        className="h-16 w-16 shrink-0 rounded-2xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-brand-navy truncate text-sm font-semibold">
          {item.title}
        </p>
        <p className="text-muted truncate text-xs">{item.location}</p>
      </div>
      <div className="text-brand-navy shrink-0 text-end text-xs font-semibold">
        {metric}
      </div>
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
    <Card className="min-w-0 rounded-[28px] border-white/70 p-5 shadow-[var(--shadow-card)]">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h3 className="text-brand-navy min-w-0 text-lg font-bold">{title}</h3>
        <Link
          href={href}
          className="text-primary text-sm font-semibold hover:underline"
        >
          {viewAllLabel}
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {items.map(({ item, metric }) => (
          <CompactRecord
            key={item.slug}
            item={item}
            href={`${href}/${item.slug}`
              .replace("/companies/", "/companies/")
              .replace("//", "/")}
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
  const home = await getHomeView(locale)
  const companyFacets = await getDirectoryFacets("companies", locale)
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
        metric: item.metrics[2]?.value ?? "—",
      })),
    },
    {
      title: t("topRatedWorkers"),
      href: "/workers",
      items: home.featured.profiles.map((item) => ({
        item,
        metric: item.metrics[0]?.value ?? "—",
      })),
    },
    {
      title: t("latestTenders"),
      href: "/tenders",
      items: home.featured.tenders.map((item) => ({
        item,
        metric: item.metrics[0]?.value ?? "—",
      })),
    },
    {
      title: t("latestProjects"),
      href: "/projects",
      items: home.featured.projects.map((item) => ({
        item,
        metric: item.metrics[1]?.value ?? "—",
      })),
    },
  ]

  return (
    <PublicLandingShell
      hero={
        <Reveal>
          <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#f4f8ff_48%,#fff_100%)] pt-10 pb-12 sm:pt-14 sm:pb-16">
            <div className="page-container relative">
              <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
                <div className="pt-4">
                  <Badge className="mb-5">{t("eyebrow")}</Badge>
                  <h1 className="text-brand-navy max-w-3xl text-4xl leading-[1.02] font-bold tracking-[-0.05em] sm:text-5xl lg:text-7xl">
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
                          className="bg-canvas min-h-13 rounded-2xl border-0 ps-11 text-base shadow-none"
                        />
                      </div>
                      <Select name="category" defaultValue="__all__">
                        <SelectTrigger className="min-h-13 rounded-2xl border-white/70 bg-white text-base">
                          <SelectValue
                            placeholder={site("filters.allCategories")}
                          />
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
                      <Button
                        type="submit"
                        className="min-h-13 rounded-2xl px-7"
                      >
                        {t("searchAction")}
                      </Button>
                    </form>
                  </Card>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { href: "/companies", label: t("ctaFindCompanies") },
                      { href: "/tenders", label: t("ctaBrowseTenders") },
                      { href: "/projects", label: t("ctaDiscoverProjects") },
                      { href: "/workers", label: t("ctaFindWorkers") },
                      viewer?.nextAction === "enter_portal"
                        ? {
                            href: "/dashboard/opportunities",
                            label: t("ctaPostOpportunity"),
                          }
                        : { href: "/register", label: t("ctaJoin") },
                    ].map((item) => (
                      <Button
                        key={item.href + item.label}
                        asChild
                        variant="secondary"
                        size="sm"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </Button>
                    ))}
                  </div>
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
                        priority
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,31,68,0.06)_0%,rgba(10,31,68,0)_45%,rgba(10,31,68,0.05)_100%)]" />
                      <div className="absolute start-5 top-5 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                        <p className="text-muted text-xs font-semibold tracking-[0.12em] uppercase">
                          {home.metrics[0]?.label ?? t("heroStatVerified")}
                        </p>
                        <p className="text-brand-navy text-2xl font-bold">
                          {home.metrics[0]?.value ?? "—"}
                        </p>
                      </div>
                      <div className="absolute end-5 top-32 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                        <p className="text-muted text-xs font-semibold tracking-[0.12em] uppercase">
                          {home.metrics[1]?.label ?? t("heroStatTenders")}
                        </p>
                        <p className="text-brand-navy text-2xl font-bold">
                          {home.metrics[1]?.value ?? "—"}
                        </p>
                      </div>
                      <div className="absolute end-5 bottom-6 rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur">
                        <p className="text-muted text-xs font-semibold tracking-[0.12em] uppercase">
                          {home.metrics[2]?.label ?? t("heroStatWorkers")}
                        </p>
                        <p className="text-brand-navy text-2xl font-bold">
                          {home.metrics[2]?.value ?? "—"}
                        </p>
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
                        <p className="text-brand-navy text-sm font-semibold">
                          {category}
                        </p>
                        <p className="text-muted mt-1 text-xs">
                          {t("viewLabel")}
                        </p>
                      </div>
                      <ChevronRight className="text-primary size-4 rtl:rotate-180" />
                    </Link>
                  ))}
                </div>
              </Card>
              <div className="mt-6">
                <PublicMetricStrip
                  items={home.metrics}
                  className="xl:grid-cols-6"
                />
              </div>
            </div>
          </section>
        </Reveal>
      }
    >
      <PublicPageSection
        title={t("howItWorksTitle")}
        description={t("howItWorksBody")}
      >
        <div className="grid gap-5 lg:grid-cols-5">
          {(
            [
              ["pathCompany", "/register"],
              ["pathProjectOwner", "/register"],
              ["pathSubcontractor", "/register"],
              ["pathServiceProvider", "/register"],
              ["pathWorker", "/register"],
            ] as const
          ).map(([key, href], index) => (
            <Card
              key={key}
              className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)]"
            >
              <p className="text-primary text-sm font-bold">{index + 1}</p>
              <h3 className="text-brand-navy mt-3 text-lg font-bold">
                {t(key)}
              </h3>
              <p className="text-muted mt-3 text-sm leading-7">
                {t(`${key}Body`)}
              </p>
              <Link
                href={href}
                className="text-primary mt-4 inline-flex text-sm font-semibold"
              >
                {t("ctaJoin")}
              </Link>
            </Card>
          ))}
        </div>
      </PublicPageSection>

      <PublicPageSection
        title={t("exploreTitle")}
        description={t("exploreBody")}
      >
        <div className="grid min-w-0 gap-5 xl:grid-cols-4">
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
              <h3 className="text-brand-navy mt-5 text-xl font-bold">
                {title}
              </h3>
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
              <p className="text-brand-navy text-lg leading-8 font-semibold">
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
                  <p className="text-brand-navy text-sm font-semibold">
                    {quote.name}
                  </p>
                  <p className="text-muted text-xs">{quote.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PublicPageSection>

      <div className="page-container">
        <Card className="bg-brand-navy overflow-hidden rounded-[32px] border-white/70 px-6 py-7 text-white shadow-[var(--shadow-card)] sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-white/70 uppercase">
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
              <Button
                asChild
                className="text-brand-navy bg-white hover:bg-white/90"
              >
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
