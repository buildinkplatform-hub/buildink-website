"use client"

import { Check, ChevronDown, Globe2 } from "lucide-react"
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
import { cn } from "@/lib/utils/cn"
import { localeMetadata } from "@/shared/constants/platform"
import { locales, type Locale } from "@/shared/types/platform"

export function LocaleSwitcher({
  compact = false,
  mobileIconOnly = false,
}: {
  compact?: boolean
  mobileIconOnly?: boolean
}) {
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
          className="border-line text-brand-navy hover:border-line hover:bg-accent focus-visible:ring-primary/20 inline-flex min-h-11 items-center gap-2 rounded-2xl border bg-white px-3.5 text-sm font-semibold transition-all outline-none focus-visible:ring-4"
        >
          <Globe2 aria-hidden="true" className="text-primary size-4" />
          <span className={mobileIconOnly ? "hidden sm:inline" : undefined}>
            {compact
              ? locale.toUpperCase()
              : localeMetadata[locale].nativeLabel}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "text-muted size-4",
              mobileIconOnly && "hidden sm:block",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-[22px] p-2">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={() => changeLocale(item)}
            className="px-3 py-3"
          >
            <span
              className="min-w-0 flex-1"
              dir={localeMetadata[item].direction}
            >
              {localeMetadata[item].nativeLabel}
            </span>
            {item === locale ? (
              <Check aria-hidden="true" className="text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
