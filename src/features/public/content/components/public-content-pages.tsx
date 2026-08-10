import { ArrowRight } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PublicArticleCard } from "@/features/public/components/public-cards"
import { PublicNewsletterCard } from "@/features/public/components/public-newsletter-card"
import { ContentShell } from "@/features/public/components/public-shells"
import {
  getPublicContentArticle,
  getPublicContentCollection,
  getPublicContentPage,
} from "@/features/public/content/data/public-content.repository"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

import type {
  ContentCollectionType,
  StaticContentType,
} from "../types/public-content.types"

export async function PublicContentPage({
  type,
}: {
  type: StaticContentType
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("publicSite")
  const page = await getPublicContentPage(type, locale)

  if (!page) notFound()

  if (type === "faq") {
    return (
      <ContentShell
        hero={
          <div>
            {page.eyebrow ? <Badge>{page.eyebrow}</Badge> : null}
            <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {page.title}
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
              {page.description}
            </p>
          </div>
        }
      >
        <Accordion
          items={page.faqItems.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
          }))}
        />
      </ContentShell>
    )
  }

  return (
    <ContentShell
      hero={
        <div>
          {page.eyebrow ? <Badge>{page.eyebrow}</Badge> : null}
          <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {page.title}
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
            {page.description}
          </p>
          {type === "privacy" || type === "terms" || type === "cookies" ? (
            <p className="text-muted mt-3 text-sm">
              {t("legal.updated", { date: page.updatedAt })}
            </p>
          ) : null}
        </div>
      }
    >
      {page.sections.map((section) => (
        <Card key={section.id} className="p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-brand-navy text-2xl font-bold">{section.title}</h2>
          <p className="text-muted mt-3 text-base leading-8">{section.body}</p>
          {section.items?.length ? (
            <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
              {section.items.map((entry) => (
                <li key={entry} className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-primary" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ))}
      <Card className="overflow-hidden bg-brand-navy p-8 text-white shadow-[var(--shadow-card)]">
        <h2 className="text-3xl font-bold">{t("cta.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
          {t("cta.body")}
        </p>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href="/register">
              {t("cta.action")}
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
}: {
  type: ContentCollectionType
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("publicSite")
  const collection = await getPublicContentCollection(type, locale)

  if (!collection) notFound()

  return (
    <ContentShell
      hero={
        <div>
          {collection.hero.eyebrow ? <Badge>{collection.hero.eyebrow}</Badge> : null}
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
            href={`/${type}/${article.slug}`}
            actionLabel={t("actions.readArticle")}
          />
        ))}
      </div>
      {type === "blog" ? (
        <PublicNewsletterCard
          title={t("newsletter.title")}
          body={t("newsletter.body")}
          placeholder={t("newsletter.placeholder")}
          consent={t("newsletter.consent")}
          action={t("newsletter.action")}
          success={t("newsletter.success")}
        />
      ) : null}
    </ContentShell>
  )
}

export async function PublicContentArticlePage({
  type,
  slug,
}: {
  type: ContentCollectionType
  slug: string
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("publicSite")
  const article = await getPublicContentArticle(type, slug, locale)

  if (!article) notFound()

  const articleMeta = article.author
    ? `${article.author} · ${article.updatedAt}${article.readingTime ? ` · ${article.readingTime}` : ""}`
    : article.updatedAt

  return (
    <ContentShell
      hero={
        <div>
          <Breadcrumb
            items={[
              { label: t("nav.items.home"), href: "/" },
              {
                label: type === "blog" ? t("pages.blog.title") : t("pages.help.title"),
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
      }
      aside={
        <Card className="p-5">
          <h2 className="text-brand-navy text-base font-bold">
            {t("detail.relatedTitle")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Link
              href={type === "blog" ? "/companies" : "/verification"}
              className="text-primary block font-semibold hover:underline"
            >
              {type === "blog" ? t("nav.items.companies") : t("nav.items.verification")}
            </Link>
            <Link
              href={type === "blog" ? "/projects" : "/contact"}
              className="text-primary block font-semibold hover:underline"
            >
              {type === "blog" ? t("nav.items.projects") : t("nav.items.contact")}
            </Link>
          </div>
        </Card>
      }
    >
      {article.sections.map((section) => (
        <Card key={section.id} className="p-6">
          <h2 className="text-brand-navy text-2xl font-bold">{section.title}</h2>
          <p className="text-muted mt-3 text-base leading-8">{section.body}</p>
        </Card>
      ))}
    </ContentShell>
  )
}
