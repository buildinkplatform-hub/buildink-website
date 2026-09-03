import type { Metadata, Viewport } from "next"
import { hasLocale } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { Toaster } from "sonner"

import { SkipLink } from "@/components/shared/skip-link"
import { routing } from "@/i18n/routing"
import { resolveConfiguredPublicOrigin } from "@/lib/url/public-origin"
import { localeMetadata } from "@/shared/constants/platform"
import type { Locale } from "@/shared/types/platform"

import "@/styles/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const instant = false

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
  const siteUrl = resolveConfiguredPublicOrigin()
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
      languages: {
        it: "/it",
        en: "/en",
        ar: "/ar",
        ro: "/ro",
        sq: "/sq",
        "x-default": "/it",
      },
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
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} timeZone="Europe/Rome">
          <SkipLink />
          {children}
          <Toaster
            position={direction === "rtl" ? "bottom-left" : "bottom-right"}
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "!rounded-2xl !border-border/80 !bg-card !text-card-foreground !shadow-[var(--shadow-floating)]",
                title: "!text-foreground !font-semibold",
                description: "!text-muted-foreground !leading-5",
                actionButton:
                  "!rounded-xl !bg-primary !text-primary-foreground !font-semibold",
                cancelButton:
                  "!rounded-xl !bg-muted !text-foreground !font-semibold",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
