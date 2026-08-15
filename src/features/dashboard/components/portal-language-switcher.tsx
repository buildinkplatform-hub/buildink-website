"use client"

import { Check, Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "@/i18n/navigation"
import { localeMetadata } from "@/shared/constants/platform"
import { locales, type Locale } from "@/shared/types/platform"

export function PortalLanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("common")

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return
    const query = searchParams.toString()
    const href = query ? `${pathname}?${query}` : pathname
    router.replace(href, { locale: nextLocale })
  }

  return (
    <DropdownMenu dir={localeMetadata[locale].direction}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t("language")}: ${localeMetadata[locale].nativeLabel}`}
          className="border-line hover:border-line hover:bg-accent focus-visible:ring-primary/12 inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white text-brand-navy transition outline-none focus-visible:ring-2"
        >
          <Languages className="size-[18px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {locales.map((item) => (
          <DropdownMenuItem key={item} onSelect={() => changeLocale(item)}>
            <span className="min-w-0 flex-1" dir={localeMetadata[item].direction}>
              {localeMetadata[item].nativeLabel}
            </span>
            {item === locale ? <Check className="text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
