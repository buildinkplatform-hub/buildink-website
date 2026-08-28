import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Cookie,
  FileCheck2,
  FolderKanban,
  Globe2,
  Handshake,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users2,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PublicArticleCard } from "@/features/public/components/public-cards"
import { PublicContactForm } from "@/features/public/components/public-contact-form"
import { ContentShell } from "@/features/public/components/public-shells"
import { PublicEntityVisual } from "@/features/public/components/public-visuals"
import { CookiePreferencesPanel } from "@/features/public/content/components/cookie-preferences-panel"
import { HowItWorksExplorer } from "@/features/public/content/components/how-it-works-explorer"
import {
  getPublicContentArticle,
  getPublicContentCollection,
  getPublicContentPage,
} from "@/features/public/content/data/public-content.repository"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

import type {
  ContentCollectionType,
  PublicContentPageView,
  StaticContentType,
} from "../types/public-content.types"

const pageIcons: Record<StaticContentType, LucideIcon> = {
  "how-it-works": Workflow,
  verification: ShieldCheck,
  about: Building2,
  contact: MessageSquareText,
  faq: CircleHelp,
  privacy: LockKeyhole,
  terms: Scale,
  cookies: Cookie,
}

function StaticPageHero({
  page,
  type,
  updatedLabel,
}: {
  page: PublicContentPageView
  type: StaticContentType
  updatedLabel?: string
}) {
  const Icon = pageIcons[type]
  return (
    <Card className="relative overflow-hidden rounded-[34px] border-white/70 p-0 shadow-[var(--shadow-card)]">
      <div className="bg-primary/8 pointer-events-none absolute -end-24 -top-28 size-[360px] rounded-full blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(247,250,255,.82))]" />
      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="p-6 sm:p-8 lg:p-10">
          {page.eyebrow ? <Badge>{page.eyebrow}</Badge> : null}
          <h1 className="text-brand-navy mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.03]">
            {page.title}
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-base leading-8 sm:text-lg">
            {page.description}
          </p>
          {updatedLabel ? (
            <p className="text-muted mt-4 flex items-center gap-2 text-xs font-medium">
              <BookOpenCheck className="size-4" />
              {updatedLabel}
            </p>
          ) : null}
        </div>
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden border-t border-slate-200/60 bg-[linear-gradient(145deg,#071a33,#0b2f5d)] p-8 text-white lg:min-h-full lg:border-s lg:border-t-0">
          <div className="section-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="bg-primary/30 pointer-events-none absolute -end-16 -top-14 size-52 rounded-full blur-3xl" />
          <div className="relative text-center">
            <span className="mx-auto flex size-20 items-center justify-center rounded-[26px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm">
              <Icon className="size-9" />
            </span>
            <p className="mt-5 text-xs font-bold tracking-[0.22em] text-white/60 uppercase">
              Buildink
            </p>
            <p className="mt-2 text-lg font-semibold text-white/95">
              {page.title}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function PageSections({ page }: { page: PublicContentPageView }) {
  return page.sections.map((section) => (
    <Card
      key={section.id}
      id={section.id}
      className="scroll-mt-28 rounded-[28px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7"
    >
      <h2 className="text-brand-navy text-2xl font-bold tracking-[-0.025em]">
        {section.title}
      </h2>
      <p className="text-muted mt-3 text-base leading-8">{section.body}</p>
      {section.items?.length ? (
        <ul className="text-muted mt-5 grid gap-3 text-sm leading-7 sm:grid-cols-2">
          {section.items.map((entry) => (
            <li
              key={entry}
              className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
            >
              <CheckCircle2 className="text-primary mt-1 size-4 shrink-0" />
              <span>{entry}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  ))
}

function PublicPageCta({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: string
}) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border-0 bg-[linear-gradient(135deg,#071a33_0%,#0b2f5d_65%,#0d5bd7_145%)] p-8 text-white shadow-[var(--shadow-card)] sm:p-10">
      <div className="section-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative">
        <p className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
          Buildink
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.035em] text-balance sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
          {body}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/register">
              {action}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/companies">Marketplace</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export async function PublicContentPage({
  type,
  locale,
}: {
  type: StaticContentType
  locale: Locale
}) {
  const t = await getTranslations({ locale, namespace: "publicSite" })
  const trust = await getTranslations({ locale, namespace: "trustPages" })
  const page = await getPublicContentPage(type, locale)

  if (!page) notFound()

  const isLegal = type === "privacy" || type === "terms" || type === "cookies"
  const updatedLabel =
    isLegal && page.version > 0
      ? t("legal.updated", { date: page.updatedAt.slice(0, 10) })
      : undefined

  const aside =
    (isLegal && page.sections.length) || type === "cookies" ? (
      <Card className="rounded-[24px] border-white/70 p-5 shadow-[var(--shadow-sm)]">
        <p className="text-brand-navy text-sm font-bold">
          {trust("common.onThisPage")}
        </p>
        <nav
          className="mt-4 space-y-2 text-sm"
          aria-label={trust("common.onThisPage")}
        >
          {page.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-muted hover:text-primary block rounded-xl px-3 py-2 transition hover:bg-slate-50"
            >
              {section.title}
            </a>
          ))}
          {type === "cookies" ? (
            <a
              href="#cookie-preferences"
              className="text-muted hover:text-primary block rounded-xl px-3 py-2 transition hover:bg-slate-50"
            >
              {trust("cookies.preferencesTitle")}
            </a>
          ) : null}
        </nav>
      </Card>
    ) : undefined

  if (type === "faq") {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqItems.map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: { "@type": "Answer", text: item.content },
      })),
    }
    return (
      <ContentShell hero={<StaticPageHero page={page} type={type} />}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
          }}
        />
        <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)] sm:p-7">
          <Accordion
            items={page.faqItems.map((item) => ({
              id: item.id,
              title: item.title,
              content: item.content,
            }))}
          />
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              href: "/verification",
              label: t("nav.items.verification"),
            },
            {
              icon: Workflow,
              href: "/how-it-works",
              label: t("nav.items.howItWorks"),
            },
            { icon: Mail, href: "/contact", label: t("nav.items.contact") },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full rounded-[24px] border-white/70 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-card)]">
                  <Icon className="text-primary size-5" />
                  <p className="text-brand-navy mt-4 font-bold">{item.label}</p>
                  <ArrowRight className="text-muted mt-4 size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Card>
              </Link>
            )
          })}
        </div>
      </ContentShell>
    )
  }

  if (type === "how-it-works") {
    const stepIcons = [
      UserCheck,
      ShieldCheck,
      Search,
      ClipboardCheck,
      MessageSquareText,
      FolderKanban,
    ]
    const featureIcons = [
      Globe2,
      Users2,
      Handshake,
      FileCheck2,
      BellRing,
      Wrench,
    ]
    return (
      <ContentShell hero={<StaticPageHero page={page} type={type} />}>
        <section>
          <div className="mb-6 max-w-3xl">
            <Badge>{trust("howItWorks.journeyTitle")}</Badge>
            <p className="text-muted mt-3 text-base leading-8">
              {trust("howItWorks.journeyBody")}
            </p>
          </div>
          <HowItWorksExplorer />
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/55 p-5 shadow-[var(--shadow-sm)] sm:p-7">
          <h2 className="text-brand-navy text-3xl font-bold tracking-[-0.035em]">
            {trust("howItWorks.stepsTitle")}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-8">
            {trust("howItWorks.stepsBody")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stepIcons.map((Icon, index) => (
              <Card
                key={index}
                className="rounded-[24px] border-slate-200/70 p-5 shadow-none"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-muted/60 text-xs font-black tracking-[0.18em]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-brand-navy mt-5 text-lg font-bold">
                  {trust(`howItWorks.steps.step${index + 1}Title`)}
                </h3>
                <p className="text-muted mt-2 text-sm leading-7">
                  {trust(`howItWorks.steps.step${index + 1}Body`)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-brand-navy text-3xl font-bold tracking-[-0.035em]">
            {trust("howItWorks.featuresTitle")}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-8">
            {trust("howItWorks.featuresBody")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureIcons.map((Icon, index) => (
              <Card
                key={index}
                className="rounded-[24px] border-white/70 p-6 shadow-[var(--shadow-card)]"
              >
                <Icon className="text-primary size-6" />
                <h3 className="text-brand-navy mt-5 text-lg font-bold">
                  {trust(`howItWorks.features.feature${index + 1}Title`)}
                </h3>
                <p className="text-muted mt-2 text-sm leading-7">
                  {trust(`howItWorks.features.feature${index + 1}Body`)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {page.version > 0 ? <PageSections page={page} /> : null}
        <PublicPageCta
          title={t("cta.title")}
          body={t("cta.body")}
          action={t("cta.action")}
        />
      </ContentShell>
    )
  }

  if (type === "verification") {
    const states = [
      { key: "pending", icon: ClipboardCheck },
      { key: "review", icon: FileCheck2 },
      { key: "verified", icon: ShieldCheck },
    ] as const
    return (
      <ContentShell hero={<StaticPageHero page={page} type={type} />}>
        <section>
          <h2 className="text-brand-navy text-3xl font-bold tracking-[-0.035em]">
            {trust("verification.statusTitle")}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-8">
            {trust("verification.statusBody")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {states.map((state) => {
              const Icon = state.icon
              return (
                <Card
                  key={state.key}
                  className="rounded-[26px] border-white/70 p-6 shadow-[var(--shadow-card)]"
                >
                  <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-brand-navy mt-5 text-xl font-bold">
                    {trust(`verification.statuses.${state.key}Title`)}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-7">
                    {trust(`verification.statuses.${state.key}Body`)}
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
        <Card className="border-primary/10 bg-primary/5 rounded-[28px] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-primary mt-1 size-6 shrink-0" />
            <div>
              <h2 className="text-brand-navy text-2xl font-bold">
                {trust("verification.processTitle")}
              </h2>
              <p className="text-muted mt-2 leading-8">
                {trust("verification.processBody")}
              </p>
            </div>
          </div>
        </Card>
        <PageSections page={page} />
        <PublicPageCta
          title={t("cta.title")}
          body={t("cta.body")}
          action={t("cta.action")}
        />
      </ContentShell>
    )
  }

  if (type === "about") {
    const principles = [Sparkles, Users2, Workflow]
    return (
      <ContentShell hero={<StaticPageHero page={page} type={type} />}>
        <section>
          <h2 className="text-brand-navy text-3xl font-bold tracking-[-0.035em]">
            {trust("about.principlesTitle")}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-8">
            {trust("about.principlesBody")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {principles.map((Icon, index) => {
              const key = ["one", "two", "three"][index]
              return (
                <Card
                  key={key}
                  className="rounded-[26px] border-white/70 p-6 shadow-[var(--shadow-card)]"
                >
                  <Icon className="text-primary size-6" />
                  <h3 className="text-brand-navy mt-5 text-xl font-bold">
                    {trust(`about.principles.${key}Title`)}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-7">
                    {trust(`about.principles.${key}Body`)}
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
        <PageSections page={page} />
        <PublicPageCta
          title={t("cta.title")}
          body={t("cta.body")}
          action={t("cta.action")}
        />
      </ContentShell>
    )
  }

  if (type === "contact") {
    const options = [
      { key: "support", icon: MessageSquareText },
      { key: "business", icon: BriefcaseBusiness },
      { key: "safety", icon: ShieldCheck },
    ] as const
    return (
      <ContentShell hero={<StaticPageHero page={page} type={type} />}>
        <section>
          <h2 className="text-brand-navy text-3xl font-bold tracking-[-0.035em]">
            {trust("contact.optionsTitle")}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-8">
            {trust("contact.optionsBody")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {options.map((option) => {
              const Icon = option.icon
              return (
                <Card
                  key={option.key}
                  className="rounded-[26px] border-white/70 p-6 shadow-[var(--shadow-card)]"
                >
                  <Icon className="text-primary size-6" />
                  <h3 className="text-brand-navy mt-5 text-lg font-bold">
                    {trust(`contact.${option.key}Title`)}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-7">
                    {trust(`contact.${option.key}Body`)}
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
        <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
              <Mail className="size-5" />
            </span>
            <div>
              <h2 className="text-brand-navy text-2xl font-bold">
                {t("forms.contactTitle")}
              </h2>
              <p className="text-muted mt-2 text-sm leading-7">
                {page.description}
              </p>
            </div>
          </div>
          <PublicContactForm
            locale={locale}
            nameLabel={t("forms.name")}
            emailLabel={t("forms.email")}
            messageLabel={t("forms.message")}
            action={t("forms.send")}
            success={t("forms.contactSuccess")}
          />
        </Card>
        <PageSections page={page} />
      </ContentShell>
    )
  }

  return (
    <ContentShell
      hero={
        <StaticPageHero page={page} type={type} updatedLabel={updatedLabel} />
      }
      aside={aside}
    >
      <PageSections page={page} />
      {type === "cookies" ? (
        <section id="cookie-preferences" className="scroll-mt-28">
          <CookiePreferencesPanel />
        </section>
      ) : null}
      <Card className="border-primary/10 bg-primary/5 rounded-[28px] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-brand-navy font-bold">Buildink</p>
            <p className="text-muted mt-1 text-sm leading-6">
              {page.description}
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/contact">
              {t("nav.items.contact")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </Card>
    </ContentShell>
  )
}

export async function PublicContentCollectionPage({
  type,
  locale,
}: {
  type: ContentCollectionType
  locale: Locale
}) {
  const t = await getTranslations({ locale, namespace: "publicSite" })
  const collection = await getPublicContentCollection(type, locale)

  if (!collection) notFound()

  return (
    <ContentShell
      hero={
        <div>
          {collection.hero.eyebrow ? (
            <Badge>{collection.hero.eyebrow}</Badge>
          ) : null}
          <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {collection.hero.title}
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
            {collection.hero.description}
          </p>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {collection.items.map((article) => (
          <PublicArticleCard
            key={article.slug}
            article={{
              slug: article.slug,
              title: article.title,
              excerpt: article.excerpt,
              category: article.category,
              updatedAt: article.updatedAt,
              sections: [],
              ...(article.author
                ? {
                    author: article.author,
                    readingTime: article.readingTime ?? "",
                  }
                : {}),
            }}
            imageUrl={article.featuredImageUrl}
            href={`/${type}/${article.slug}`}
            actionLabel={t("actions.readArticle")}
          />
        ))}
      </div>
    </ContentShell>
  )
}

export async function PublicContentArticlePage({
  type,
  slug,
  locale,
}: {
  type: ContentCollectionType
  slug: string
  locale: Locale
}) {
  const t = await getTranslations({ locale, namespace: "publicSite" })
  const article = await getPublicContentArticle(type, slug, locale)

  if (!article) notFound()

  const articleMeta = article.author
    ? `${article.author} · ${article.updatedAt}${article.readingTime ? ` · ${article.readingTime}` : ""}`
    : article.updatedAt

  return (
    <ContentShell
      hero={
        <Card className="overflow-hidden rounded-[32px] border-white/70 p-0 shadow-[var(--shadow-card)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-6 sm:p-8">
              <Breadcrumb
                items={[
                  { label: t("nav.items.home"), href: "/" },
                  {
                    label: t("pages.help.title"),
                    href: `/${type}`,
                  },
                  { label: article.title },
                ]}
              />
              <Badge className="mt-5">{article.category}</Badge>
              <h1 className="text-brand-navy mt-4 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                {article.title}
              </h1>
              <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
                {article.excerpt}
              </p>
              <p className="text-muted mt-3 text-sm">{articleMeta}</p>
            </div>
            <div className="p-4 sm:p-6">
              <PublicEntityVisual
                module="companies"
                title={article.title}
                imageUrl={article.featuredImageUrl}
                className="h-full min-h-72 rounded-[28px]"
              />
            </div>
          </div>
        </Card>
      }
      aside={
        <Card className="p-5">
          <h2 className="text-brand-navy text-base font-bold">
            {t("detail.relatedTitle")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Link
              href="/verification"
              className="text-primary block font-semibold hover:underline"
            >
              {t("nav.items.verification")}
            </Link>
            <Link
              href="/contact"
              className="text-primary block font-semibold hover:underline"
            >
              {t("nav.items.contact")}
            </Link>
          </div>
        </Card>
      }
    >
      {article.sections.map((section) => (
        <Card key={section.id} className="p-6">
          <h2 className="text-brand-navy text-2xl font-bold">
            {section.title}
          </h2>
          <p className="text-muted mt-3 text-base leading-8">{section.body}</p>
        </Card>
      ))}
    </ContentShell>
  )
}
