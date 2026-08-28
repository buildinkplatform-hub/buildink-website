import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileSearch,
  Languages,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { PublicNewsletterCard } from "@/features/public/components/public-newsletter-card"
import { footerColumns } from "@/features/public/config/public-site.config"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

export async function PublicFooter() {
  const t = await getTranslations("publicSite")
  const trust = await getTranslations("trustPages")
  const home = await getTranslations("public")
  const locale = (await getLocale()) as Locale

  const trustItems = [
    { icon: UserRoundCheck, label: trust("footer.trustOne") },
    { icon: ShieldCheck, label: trust("footer.trustTwo") },
    { icon: Languages, label: trust("footer.trustThree") },
  ]

  const quickLinks = [
    { href: "/search", label: t("nav.items.search"), icon: Search },
    { href: "/companies", label: t("nav.items.companies"), icon: Building2 },
    {
      href: "/projects",
      label: t("nav.items.projects"),
      icon: BriefcaseBusiness,
    },
    { href: "/tenders", label: t("nav.items.tenders"), icon: FileSearch },
    {
      href: "/verification",
      label: t("nav.items.verification"),
      icon: ShieldCheck,
    },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[linear-gradient(145deg,#03101f_0%,#071a33_42%,#0a2d57_100%)] py-12 text-white sm:py-16">
      <div className="bg-primary/16 pointer-events-none absolute -start-40 -top-52 size-[520px] rounded-full blur-3xl" />
      <div className="bg-interactive/10 pointer-events-none absolute -end-24 bottom-0 size-[420px] rounded-full blur-3xl" />
      <div className="section-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="page-container relative">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm sm:p-8">
            <div className="bg-primary/10 pointer-events-none absolute -end-20 -top-24 size-64 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/96 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                <BrandLogo />
              </div>
              <p className="mt-7 text-xs font-bold tracking-[0.2em] text-white/55 uppercase">
                {trust("footer.eyebrow")}
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.7rem] lg:leading-[1.08]">
                {trust("footer.title")}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                {trust("footer.body")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-white/80"
                    >
                      <Icon className="size-3.5 text-sky-300" />
                      {item.label}
                    </span>
                  )
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href="/register">
                    {trust("common.createAccount")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="border border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/how-it-works">{t("nav.items.howItWorks")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <PublicNewsletterCard
            title={trust("footer.newsletterTitle")}
            body={t("newsletter.body")}
            placeholder={t("newsletter.placeholder")}
            consent={t("newsletter.consent")}
            action={t("newsletter.action")}
            success={t("newsletter.success")}
            locale={locale}
            variant="footer"
          />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group">
                <div className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sky-300 transition group-hover:bg-white/12">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/78 group-hover:text-white">
                    {item.label}
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/80 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 grid gap-9 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm leading-7 text-white/70">
              {t("footer.note")}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/48">
              {t("footer.details")}
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.key}>
              <h3 className="text-xs font-bold tracking-[0.16em] text-white/92 uppercase">
                {t(column.labelKey)}
              </h3>
              <div className="bg-primary/60 mt-4 h-px w-10" />
              <div className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex w-fit items-center gap-1.5 text-sm text-white/62 transition hover:text-white"
                  >
                    <span>{t(item.labelKey)}</span>
                    <ArrowRight className="size-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <span>{home("copyright")}</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              {t("nav.items.privacy")}
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              {t("nav.items.terms")}
            </Link>
            <Link href="/cookies" className="transition hover:text-white">
              {t("nav.items.cookies")}
            </Link>
            <span className="inline-flex items-center gap-2 text-white/60">
              <span
                className="bg-success inline-flex size-2 rounded-full shadow-[0_0_18px_rgba(18,183,106,0.65)]"
                aria-hidden="true"
              />
              {trust("footer.systemLabel")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
