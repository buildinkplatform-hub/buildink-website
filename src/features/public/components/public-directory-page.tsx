import { Filter, Search, SlidersHorizontal } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PublicEntityCard } from "@/features/public/components/public-cards"
import {
  PublicEntityVisual,
  PublicMetricStrip,
} from "@/features/public/components/public-visuals"
import { DirectoryShell } from "@/features/public/components/public-shells"
import {
  localizedHref,
  moduleRouteMap,
} from "@/features/public/config/public-site.config"
import {
  getDirectoryFacets,
  listPublicEntities,
} from "@/features/public/data/public-repository"
import {
  buildQueryString,
  parseDirectoryQuery,
} from "@/features/public/lib/public-query"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"
import type {
  DirectoryQuery,
  PublicFacetOption,
  PublicModule,
} from "@/features/public/types/public.types"

const paginationLabels: Record<
  Locale,
  { previous: string; next: string; label: string }
> = {
  en: { previous: "Previous", next: "Next", label: "Pagination" },
  it: { previous: "Precedente", next: "Successivo", label: "Paginazione" },
  ar: { previous: "السابق", next: "التالي", label: "ترقيم الصفحات" },
  ro: { previous: "Anterior", next: "Următor", label: "Paginare" },
  sq: { previous: "Prapa", next: "Tjetër", label: "Faqëzim" },
}

function paginationWindow(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const pages = new Set(
    [
      1,
      total,
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
    ].filter((page) => page >= 1 && page <= total),
  )
  const sorted = [...pages].sort((left, right) => left - right)
  const values: Array<number | "…"> = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous && page - previous > 1) values.push("…")
    values.push(page)
  })
  return values
}

function FiltersForm({
  locale,
  title,
  query,
  countries,
  regions,
  cities,
  categories,
  verifications,
  additional,
  additionalLabels,
  searchLabel,
  searchPlaceholder,
  countryLabel,
  allCountriesLabel,
  regionLabel,
  allRegionsLabel,
  cityLabel,
  allCitiesLabel,
  categoryLabel,
  allCategoriesLabel,
  verificationLabel,
  allStatusesLabel,
  clearLabel,
  applyLabel,
  routePrefix,
}: {
  locale: Locale
  title: string
  query: DirectoryQuery
  countries: PublicFacetOption[]
  regions: PublicFacetOption[]
  cities: PublicFacetOption[]
  categories: PublicFacetOption[]
  verifications: PublicFacetOption[]
  additional: Record<string, PublicFacetOption[]>
  additionalLabels: Record<string, string>
  searchLabel: string
  searchPlaceholder: string
  countryLabel: string
  allCountriesLabel: string
  regionLabel: string
  allRegionsLabel: string
  cityLabel: string
  allCitiesLabel: string
  categoryLabel: string
  allCategoriesLabel: string
  verificationLabel: string
  allStatusesLabel: string
  clearLabel: string
  applyLabel: string
  routePrefix: string
}) {
  const actionPrefix = localizedHref(locale, routePrefix)
  return (
    <Card className="rounded-[28px] border-white/70 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="bg-light-blue text-primary flex size-11 items-center justify-center rounded-2xl">
          <SlidersHorizontal className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-brand-navy text-lg font-bold break-words">
            {title}
          </h2>
          <p className="text-muted text-sm break-words">{searchPlaceholder}</p>
        </div>
      </div>
      <form action={actionPrefix} className="mt-5 space-y-4">
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {searchLabel}
          </label>
          <Input
            name="q"
            defaultValue={query.q}
            placeholder={searchPlaceholder}
            className="min-h-12 rounded-2xl"
          />
        </div>
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {countryLabel}
          </label>
          <Select name="country" defaultValue={query.country ?? "__all__"}>
            <SelectTrigger
              className="min-h-12 rounded-2xl"
              aria-label={countryLabel}
            >
              <SelectValue placeholder={allCountriesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allCountriesLabel}</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label} ({country.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {regionLabel}
          </label>
          <Select name="region" defaultValue={query.region ?? "__all__"}>
            <SelectTrigger
              className="min-h-12 rounded-2xl"
              aria-label={regionLabel}
            >
              <SelectValue placeholder={allRegionsLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allRegionsLabel}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label} ({region.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {cityLabel}
          </label>
          <Select name="city" defaultValue={query.city ?? "__all__"}>
            <SelectTrigger
              className="min-h-12 rounded-2xl"
              aria-label={cityLabel}
            >
              <SelectValue placeholder={allCitiesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allCitiesLabel}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label} ({city.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {categoryLabel}
          </label>
          <Select name="category" defaultValue={query.category ?? "__all__"}>
            <SelectTrigger
              className="min-h-12 rounded-2xl"
              aria-label={categoryLabel}
            >
              <SelectValue placeholder={allCategoriesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allCategoriesLabel}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-brand-navy mb-2 block text-sm font-semibold">
            {verificationLabel}
          </label>
          <Select
            name="verification"
            defaultValue={query.verification ?? "__all__"}
          >
            <SelectTrigger
              className="min-h-12 rounded-2xl"
              aria-label={verificationLabel}
            >
              <SelectValue placeholder={allStatusesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allStatusesLabel}</SelectItem>
              {verifications.map((verification) => (
                <SelectItem key={verification.value} value={verification.value}>
                  {verification.label} ({verification.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {Object.entries(additional).map(([key, options]) =>
          options.length ? (
            <div key={key}>
              <label className="text-brand-navy mb-2 block text-sm font-semibold">
                {additionalLabels[key] ?? key}
              </label>
              <Select
                name={key}
                defaultValue={String(
                  query[key as keyof DirectoryQuery] ?? "__all__",
                )}
              >
                <SelectTrigger
                  className="min-h-12 rounded-2xl"
                  aria-label={additionalLabels[key] ?? key}
                >
                  <SelectValue placeholder={allStatusesLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{allStatusesLabel}</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null,
        )}
        <div className="flex flex-col gap-2">
          <Button type="submit">{applyLabel}</Button>
          <Button asChild type="button" variant="secondary">
            <a href={actionPrefix}>{clearLabel}</a>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export async function PublicDirectoryPage({
  locale,
  module,
  titleKey,
  descriptionKey,
  searchParams,
  accountType,
  href,
}: {
  locale: Locale
  module: PublicModule
  titleKey: string
  descriptionKey: string
  searchParams?: Record<string, string | string[] | undefined>
  accountType?: string
  href?: string
}) {
  const t = await getTranslations({ locale, namespace: "publicSite" })
  const query = {
    ...parseDirectoryQuery(searchParams),
    ...(accountType ? { accountType } : {}),
  }
  const routePrefix = href ?? moduleRouteMap[module]
  const actionPrefix = localizedHref(locale, routePrefix)
  const [result, facets] = await Promise.all([
    listPublicEntities(module, query, locale),
    getDirectoryFacets(module, locale, query),
  ])

  const paginationItems = paginationWindow(result.page, result.totalPages).map(
    (value) => {
      if (value === "…") return { label: value }
      const qs = buildQueryString({ ...query, page: value })
      return {
        label: String(value),
        href: `${routePrefix}${qs ? `?${qs}` : ""}`,
        active: value === result.page,
      }
    },
  )

  const previousHref =
    result.page > 1
      ? `${routePrefix}?${buildQueryString({ ...query, page: result.page - 1 })}`
      : undefined
  const nextHref =
    result.page < result.totalPages
      ? `${routePrefix}?${buildQueryString({ ...query, page: result.page + 1 })}`
      : undefined

  const filters = (
    <FiltersForm
      locale={locale}
      title={t("filters.title")}
      query={query}
      countries={facets.countries}
      regions={facets.regions}
      cities={facets.cities}
      categories={facets.categories}
      verifications={facets.verifications}
      additional={facets.additional}
      additionalLabels={Object.fromEntries(
        Object.keys(facets.additional).map((key) => [
          key,
          t(`filters.additional.${key}`),
        ]),
      )}
      searchLabel={t("filters.search")}
      searchPlaceholder={t("filters.searchPlaceholder")}
      countryLabel={t("filters.country")}
      allCountriesLabel={t("filters.allCountries")}
      regionLabel={t("filters.region")}
      allRegionsLabel={t("filters.allRegions")}
      cityLabel={t("filters.city")}
      allCitiesLabel={t("filters.allCities")}
      categoryLabel={t("filters.category")}
      allCategoriesLabel={t("filters.allCategories")}
      verificationLabel={t("filters.verification")}
      allStatusesLabel={t("filters.allStatuses")}
      clearLabel={t("actions.clearFilters")}
      applyLabel={t("actions.applyFilters")}
      routePrefix={routePrefix}
    />
  )

  return (
    <DirectoryShell
      header={
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[34px] border-white/70 p-0 shadow-[var(--shadow-card)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
              <div className="min-w-0 p-6 sm:p-8">
                <Badge>{t(`pages.${titleKey}.eyebrow`)}</Badge>
                <h1 className="text-brand-navy mt-4 max-w-3xl text-4xl font-bold tracking-[-0.04em] break-words sm:text-5xl">
                  {t(`pages.${titleKey}.title`)}
                </h1>
                <p className="text-muted mt-4 max-w-3xl text-base leading-7 break-words sm:text-lg">
                  {t(`pages.${descriptionKey}.description`)}
                </p>
                <form
                  action={actionPrefix}
                  className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="relative min-w-0">
                    <Search className="text-muted pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      name="q"
                      defaultValue={query.q}
                      placeholder={t("filters.searchPlaceholder")}
                      className="min-h-13 rounded-2xl border-white/70 bg-white/90 ps-11"
                    />
                  </div>
                  <Button type="submit" className="min-h-13 rounded-2xl px-6">
                    {t("nav.items.search")}
                  </Button>
                </form>
                <div className="mt-5 flex flex-wrap gap-2">
                  {facets.categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.value}
                      href={`${routePrefix}?${buildQueryString({
                        ...query,
                        category: category.value,
                        page: 1,
                      })}`}
                      className="border-primary/10 bg-primary/5 text-brand-navy hover:bg-primary/10 max-w-full rounded-full border px-3 py-1 text-xs font-semibold transition"
                    >
                      <span className="block truncate">
                        {category.label} ({category.count})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <PublicEntityVisual
                  module={module}
                  title={t(`modules.${module}`)}
                  className="h-full min-h-72 rounded-[28px]"
                />
              </div>
            </div>
          </Card>
          <PublicMetricStrip
            items={[
              { label: t("stats.publicResults"), value: String(result.total) },
              {
                label: t("stats.countries"),
                value: String(facets.countries.length),
              },
              {
                label: t("stats.regions"),
                value: String(facets.regions.length),
              },
              { label: t("stats.cities"), value: String(facets.cities.length) },
              {
                label: t("stats.categories"),
                value: String(facets.categories.length),
              },
              {
                label: t("stats.verificationStates"),
                value: String(facets.verifications.length),
              },
            ]}
          />
        </div>
      }
      filters={<div className="hidden lg:block">{filters}</div>}
      sidebar={
        <Card className="rounded-[28px] border-white/70 p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-brand-navy text-base font-bold">
            {t("directory.quickGuideTitle")}
          </h3>
          <p className="text-muted mt-3 text-sm leading-7">
            {t("directory.quickGuideBody")}
          </p>
        </Card>
      }
    >
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge>
            {t("search.resultCount", { count: String(result.total) })}
          </Badge>
          {query.q ? (
            <Badge className="text-brand-navy max-w-full bg-white">
              <Search className="size-3.5 shrink-0" />
              <span className="truncate">{query.q}</span>
            </Badge>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="lg:hidden">
                <Filter className="size-4" />
                {t("filters.title")}
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "ar" ? "right" : "left"}>
              <SheetHeader title={t("filters.title")} />
              {filters}
            </SheetContent>
          </Sheet>
        </div>
        {result.items.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {result.items.map((item) => (
              <PublicEntityCard
                key={item.slug}
                item={item}
                href={`${routePrefix}/${item.slug}`}
                actionLabel={t("actions.viewDetails")}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-[30px] p-8 text-center">
            <h2 className="text-brand-navy text-2xl font-bold">
              {t("search.emptyTitle")}
            </h2>
            <p className="text-muted mx-auto mt-3 max-w-2xl text-base leading-7">
              {t("search.emptyBody")}
            </p>
          </Card>
        )}
        <div className="mt-8">
          <Pagination
            items={paginationItems}
            previousHref={previousHref}
            nextHref={nextHref}
            previousLabel={paginationLabels[locale].previous}
            nextLabel={paginationLabels[locale].next}
            ariaLabel={paginationLabels[locale].label}
          />
        </div>
      </div>
    </DirectoryShell>
  )
}
