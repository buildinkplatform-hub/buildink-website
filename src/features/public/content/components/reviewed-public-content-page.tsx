import { BookOpenCheck, CheckCircle2 } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PublicContactForm } from "@/features/public/components/public-contact-form"
import { ContentShell } from "@/features/public/components/public-shells"
import { CookiePreferencesPanel } from "@/features/public/content/components/cookie-preferences-panel"
import { getPublicContentPage } from "@/features/public/content/data/public-content.repository"
import type { Locale } from "@/shared/types/platform"

import type { StaticContentType } from "../types/public-content.types"

const pageChrome: Record<
  Locale,
  {
    meta: (version: number) => string
    onThisPage: string
    cookieSettings: string
  }
> = {
  it: {
    meta: (version) => `Bozza aggiornata 28 agosto 2026 · Versione ${version}`,
    onThisPage: "In questa pagina",
    cookieSettings: "Impostazioni cookie",
  },
  en: {
    meta: (version) => `Draft updated 28 August 2026 · Version ${version}`,
    onThisPage: "On this page",
    cookieSettings: "Cookie settings",
  },
  ar: {
    meta: (version) =>
      `مسودة مترجمة محدثة في 28 أغسطس 2026 · الإصدار ${version}`,
    onThisPage: "في هذه الصفحة",
    cookieSettings: "إعدادات ملفات تعريف الارتباط",
  },
  ro: {
    meta: (version) =>
      `Proiect tradus actualizat la 28 august 2026 · Versiunea ${version}`,
    onThisPage: "În această pagină",
    cookieSettings: "Setări cookie",
  },
  sq: {
    meta: (version) =>
      `Draft i përkthyer, përditësuar më 28 gusht 2026 · Versioni ${version}`,
    onThisPage: "Në këtë faqe",
    cookieSettings: "Cilësimet e cookie-ve",
  },
}

function PageHero({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string | null
  title: string
  description: string
  meta: string
}) {
  return (
    <Card className="relative overflow-hidden rounded-[34px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
      <div className="bg-primary/8 pointer-events-none absolute -end-24 -top-28 size-[360px] rounded-full blur-3xl" />
      <div className="relative">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <h1 className="text-brand-navy mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.03]">
          {title}
        </h1>
        <p className="text-muted mt-5 max-w-4xl text-base leading-8 sm:text-lg">
          {description}
        </p>
        <p className="text-muted mt-5 flex items-center gap-2 text-xs font-semibold">
          <BookOpenCheck className="size-4" aria-hidden="true" />
          {meta}
        </p>
      </div>
    </Card>
  )
}

export async function ReviewedPublicContentPage({
  type,
  locale,
}: {
  type: StaticContentType
  locale: Locale
}) {
  const page = await getPublicContentPage(type, locale)
  const t = await getTranslations({ locale, namespace: "publicSite" })
  const chrome = pageChrome[locale]

  const aside = page.sections.length ? (
    <Card className="rounded-[24px] border-white/70 p-5 shadow-[var(--shadow-sm)]">
      <p className="text-brand-navy text-sm font-bold">{chrome.onThisPage}</p>
      <nav className="mt-4 space-y-2 text-sm" aria-label={chrome.onThisPage}>
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
            {chrome.cookieSettings}
          </a>
        ) : null}
      </nav>
    </Card>
  ) : undefined

  return (
    <ContentShell
      hero={
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          meta={chrome.meta(page.version)}
        />
      }
      aside={aside}
    >
      {type === "faq" ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: page.faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.title,
                  acceptedAnswer: { "@type": "Answer", text: item.content },
                })),
              }).replaceAll("<", "\\u003c"),
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
        </>
      ) : (
        page.sections.map((section) => (
          <Card
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-[28px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7"
          >
            <h2 className="text-brand-navy text-2xl font-bold tracking-[-0.025em]">
              {section.title}
            </h2>
            <p className="text-muted mt-3 text-base leading-8 whitespace-pre-line">
              {section.body}
            </p>
            {section.items?.length ? (
              <ul className="text-muted mt-5 grid gap-3 text-sm leading-7">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
                  >
                    <CheckCircle2
                      className="text-primary mt-1 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))
      )}

      {type === "contact" ? (
        <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="text-brand-navy text-2xl font-bold">
            {t("forms.contactTitle")}
          </h2>
          <PublicContactForm
            locale={locale}
            nameLabel={t("forms.name")}
            emailLabel={t("forms.email")}
            messageLabel={t("forms.message")}
            action={t("forms.send")}
            success={t("forms.contactSuccess")}
          />
        </Card>
      ) : null}

      {type === "cookies" ? (
        <section id="cookie-preferences" className="scroll-mt-28">
          <CookiePreferencesPanel />
        </section>
      ) : null}
    </ContentShell>
  )
}
