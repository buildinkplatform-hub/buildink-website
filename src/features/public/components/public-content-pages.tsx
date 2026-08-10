import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PublicArticleCard } from "@/features/public/components/public-cards"
import { PublicNewsletterCard } from "@/features/public/components/public-newsletter-card"
import { ContentShell, PublicPageSection } from "@/features/public/components/public-shells"
import {
  getArticle,
  getHelpArticle,
  getLegalDocument,
  listArticles,
  listHelpArticles,
} from "@/features/public/data/public-repository"
import { Link } from "@/i18n/navigation"
import type { PublicArticle } from "@/features/public/types/public.types"

export async function PublicStaticContentPage({
  pageKey,
}: {
  pageKey:
    | "howItWorks"
    | "verification"
    | "about"
    | "contact"
    | "help"
    | "faq"
    | "blog"
    | "privacy"
    | "terms"
    | "cookies"
}) {
  const t = await getTranslations("publicSite")

  if (pageKey === "faq") {
    return (
      <ContentShell
        hero={
          <div>
            <Badge>{t(`pages.${pageKey}.eyebrow`)}</Badge>
            <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {t(`pages.${pageKey}.title`)}
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
              {t(`pages.${pageKey}.description`)}
            </p>
          </div>
        }
      >
        <Accordion
          items={[
            {
              id: "profiles",
              title: t("faq.items.profileType"),
              content: t("faq.answers.profileType"),
            },
            {
              id: "verification",
              title: t("faq.items.verification"),
              content: t("faq.answers.verification"),
            },
            {
              id: "contact",
              title: t("faq.items.contact"),
              content: t("faq.answers.contact"),
            },
          ]}
        />
      </ContentShell>
    )
  }

  if (pageKey === "blog") {
    const articles = listArticles()
    return (
      <ContentShell
        hero={
          <div>
            <Badge>{t("pages.blog.eyebrow")}</Badge>
            <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {t("pages.blog.title")}
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
              {t("pages.blog.description")}
            </p>
          </div>
        }
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {articles.map((article) => (
            <PublicArticleCard
              key={article.slug}
              article={article}
              href={`/blog/${article.slug}`}
              actionLabel={t("actions.readArticle")}
            />
          ))}
        </div>
        <PublicNewsletterCard
          title={t("newsletter.title")}
          body={t("newsletter.body")}
          placeholder={t("newsletter.placeholder")}
          consent={t("newsletter.consent")}
          action={t("newsletter.action")}
          success={t("newsletter.success")}
        />
      </ContentShell>
    )
  }

  if (pageKey === "help") {
    const articles = listHelpArticles()
    return (
      <ContentShell
        hero={
          <div>
            <Badge>{t("pages.help.eyebrow")}</Badge>
            <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {t("pages.help.title")}
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
              {t("pages.help.description")}
            </p>
          </div>
        }
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {articles.map((article) => (
            <PublicArticleCard
              key={article.slug}
              article={article}
              href={`/help/${article.slug}`}
              actionLabel={t("actions.readArticle")}
            />
          ))}
        </div>
      </ContentShell>
    )
  }

  if (pageKey === "privacy" || pageKey === "terms" || pageKey === "cookies") {
    const document = getLegalDocument(
      pageKey === "privacy" ? "privacy" : pageKey === "terms" ? "terms" : "cookies",
    )
    if (!document) notFound()

    return (
      <ContentShell
        hero={
          <div>
            <Badge>{t(`pages.${pageKey}.eyebrow`)}</Badge>
            <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {t(`pages.${pageKey}.title`)}
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
              {t(`pages.${pageKey}.description`)}
            </p>
            <p className="text-muted mt-3 text-sm">
              {t("legal.updated", { date: document.updatedAt })}
            </p>
          </div>
        }
      >
        {document.sections.map((section) => (
          <Card key={section.id} className="p-6">
            <h2 className="text-brand-navy text-2xl font-bold">{section.title}</h2>
            <p className="text-muted mt-3 leading-7">{section.body}</p>
          </Card>
        ))}
      </ContentShell>
    )
  }

  return (
    <ContentShell
      hero={
        <div>
          <Badge>{t(`pages.${pageKey}.eyebrow`)}</Badge>
          <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {t(`pages.${pageKey}.title`)}
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
            {t(`pages.${pageKey}.description`)}
          </p>
        </div>
      }
    >
      <PublicPageSection
        title={t(`pages.${pageKey}.sectionOneTitle`)}
        description={t(`pages.${pageKey}.sectionOneBody`)}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="p-6 shadow-[var(--shadow-card)]">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.16em]">
                0{index}
              </p>
              <h3 className="text-brand-navy mt-3 text-xl font-bold">
                {t(`pages.${pageKey}.cards.card${index}Title`)}
              </h3>
              <p className="text-muted mt-3 text-sm leading-7">
                {t(`pages.${pageKey}.cards.card${index}Body`)}
              </p>
            </Card>
          ))}
        </div>
      </PublicPageSection>
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

export async function PublicArticleDetailPage({
  type,
  slug,
}: {
  type: "blog" | "help"
  slug: string
}) {
  const t = await getTranslations("publicSite")
  const article = type === "blog" ? getArticle(slug) : getHelpArticle(slug)

  if (!article) notFound()

  const articleMeta =
    type === "blog"
      ? `${(article as PublicArticle).author} · ${article.updatedAt} · ${(article as PublicArticle).readingTime}`
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
