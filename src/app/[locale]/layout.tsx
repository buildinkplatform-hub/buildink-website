import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import { Inter, Noto_Sans_Arabic } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { Toaster } from "sonner"

import { SkipLink } from "@/components/shared/skip-link"
import { routing } from "@/i18n/routing"
import { localeMetadata } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

import "@/styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "meta" })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: `%s | Buildink` },
    description: t("description"),
    icons: {
      icon: "/brand/buildink-logo-mark.svg",
      apple: "/brand/buildink-logo-mark.svg",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { it: "/it", en: "/en", ar: "/ar", "x-default": "/it" },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  const direction = localeMetadata[locale as Locale].direction

  return (
    <html
      lang={locale}
      dir={direction}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} timeZone="Europe/Rome">
          <SkipLink />
          {children}
          <Toaster
            position={direction === "rtl" ? "bottom-left" : "bottom-right"}
            richColors
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
