import { Search } from "lucide-react"
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
import { PublicEntityCard } from "@/features/public/components/public-cards"
import { DirectoryShell } from "@/features/public/components/public-shells"
import { moduleRouteMap } from "@/features/public/config/public-site.config"
import { getDirectoryFacets } from "@/features/public/data/public-repository"
import {
  buildQueryString,
  parseDirectoryQuery,
} from "@/features/public/lib/public-query"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"
import { searchAll } from "@/features/public/data/public-repository"

export async function PublicSearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const t = await getTranslations("publicSite")
  const locale = (await getLocale()) as Locale
  const geographyText =
    locale === "it"
      ? {
          country: "Paese",
          allCountries: "Tutti i paesi",
          city: "Città",
          allCities: "Tutte le città",
        }
      : locale === "ar"
        ? {
            country: "الدولة",
            allCountries: "كل الدول",
            city: "المدينة",
            allCities: "كل المدن",
          }
        : locale === "ro"
          ? {
              country: "ÈšarÄƒ",
              allCountries: "Toate È›Äƒrile",
              city: "OraÈ™",
              allCities: "Toate oraÈ™ele",
            }
          : locale === "sq"
            ? {
                country: "Shteti",
                allCountries: "Të gjitha shtetet",
                city: "Qyteti",
                allCities: "Të gjitha qytetet",
              }
            : {
                country: "Country",
                allCountries: "All countries",
                city: "City",
                allCities: "All cities",
              }
  const query = parseDirectoryQuery(searchParams)
  const results = await searchAll(query, locale)
  const companyFacets = await getDirectoryFacets("companies", locale)

  return (
    <DirectoryShell
      header={
        <div className="max-w-3xl">
          <Badge>{t("pages.search.eyebrow")}</Badge>
          <h1 className="text-brand-navy mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {t("pages.search.title")}
          </h1>
          <p className="text-muted mt-4 text-lg leading-8">
            {t("pages.search.description")}
          </p>
        </div>
      }
      filters={
        <Card className="rounded-[28px] border-white/70 p-4 shadow-[var(--shadow-card)]">
          <h2 className="text-brand-navy text-base font-bold">
            {t("filters.title")}
          </h2>
          <form className="mt-4 space-y-4" action="/search">
            <div>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {t("nav.items.search")}
              </label>
              <Input
                name="q"
                defaultValue={query.q}
                placeholder={t("pages.search.title")}
              />
            </div>
            <div>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {geographyText.country}
              </label>
              <Select name="country" defaultValue={query.country ?? "__all__"}>
                <SelectTrigger>
                  <SelectValue placeholder={geographyText.allCountries} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {geographyText.allCountries}
                  </SelectItem>
                  {companyFacets.countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label} ({country.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {t("filters.region")}
              </label>
              <Select name="region" defaultValue={query.region ?? "__all__"}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allRegions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {t("filters.allRegions")}
                  </SelectItem>
                  {companyFacets.regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label} ({region.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {geographyText.city}
              </label>
              <Select name="city" defaultValue={query.city ?? "__all__"}>
                <SelectTrigger>
                  <SelectValue placeholder={geographyText.allCities} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {geographyText.allCities}
                  </SelectItem>
                  {companyFacets.cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label} ({city.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {t("filters.category")}
              </label>
              <Select
                name="category"
                defaultValue={query.category ?? "__all__"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {t("filters.allCategories")}
                  </SelectItem>
                  {companyFacets.categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit">{t("actions.applyFilters")}</Button>
              <Button asChild type="button" variant="secondary">
                <Link href="/search">{t("actions.clearFilters")}</Link>
              </Button>
            </div>
          </form>
        </Card>
      }
    >
      <div>
        <div className="mb-5 flex items-center gap-3">
          <Badge>
            {t("search.resultCount", { count: String(results.length) })}
          </Badge>
          {query.q ? (
            <Badge className="text-brand-navy bg-white">
              <Search className="size-3.5" />
              {query.q}
            </Badge>
          ) : null}
          {query.category ? (
            <Badge className="text-brand-navy bg-white">{query.category}</Badge>
          ) : null}
          {query.country ? (
            <Badge className="text-brand-navy bg-white">{query.country}</Badge>
          ) : null}
          {query.region ? (
            <Badge className="text-brand-navy bg-white">{query.region}</Badge>
          ) : null}
          {query.city ? (
            <Badge className="text-brand-navy bg-white">{query.city}</Badge>
          ) : null}
        </div>
        {results.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {results.map((item) => (
              <PublicEntityCard
                key={`${item.module}-${item.slug}`}
                item={item}
                href={`${moduleRouteMap[item.module]}/${item.slug}`}
                actionLabel={t("actions.viewDetails")}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <h2 className="text-brand-navy text-2xl font-bold">
              {t("search.emptyTitle")}
            </h2>
            <p className="text-muted mt-3 text-base leading-7">
              {t("search.emptyBody")}
            </p>
          </Card>
        )}
        {results.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {companyFacets.categories.slice(0, 8).map((category) => (
              <a
                key={category.value}
                href={`/search?${buildQueryString({ ...query, category: category.value, page: 1 })}`}
                className="border-primary/10 bg-primary/5 text-brand-navy hover:bg-primary/10 rounded-full border px-3 py-1 text-xs font-semibold transition"
              >
                {category.label} ({category.count})
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </DirectoryShell>
  )
}
