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
import { moduleRouteMap } from "@/features/public/config/public-site.config"
import {
  getDirectoryFacets,
  listPublicEntities,
} from "@/features/public/data/public-repository"
import {
  buildQueryString,
  parseDirectoryQuery,
} from "@/features/public/lib/public-query"
import { Link } from "@/i18n/navigation"
import type {
  DirectoryQuery,
  PublicModule,
} from "@/features/public/types/public.types"

function FiltersForm({
  title,
  query,
  regions,
  categories,
  verifications,
  searchLabel,
  searchPlaceholder,
  regionLabel,
  allRegionsLabel,
  categoryLabel,
  allCategoriesLabel,
  verificationLabel,
  allStatusesLabel,
  clearLabel,
  applyLabel,
  routePrefix,
}: {
  title: string
  query: DirectoryQuery
  regions: string[]
  categories: string[]
  verifications: string[]
  searchLabel: string
  searchPlaceholder: string
  regionLabel: string
  allRegionsLabel: string
  categoryLabel: string
  allCategoriesLabel: string
  verificationLabel: string
  allStatusesLabel: string
  clearLabel: string
  applyLabel: string
  routePrefix: string
}) {
  return (
    <Card className="rounded-[28px] border-white/70 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="bg-light-blue text-primary flex size-11 items-center justify-center rounded-2xl">
          <SlidersHorizontal className="size-5" />
        </div>
        <div>
          <h2 className="text-brand-navy text-lg font-bold">{title}</h2>
          <p className="text-muted text-sm">{searchPlaceholder}</p>
        </div>
      </div>
      <form action={routePrefix} className="mt-5 space-y-4">
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
            {regionLabel}
          </label>
          <Select name="region" defaultValue={query.region ?? "__all__"}>
            <SelectTrigger className="min-h-12 rounded-2xl">
              <SelectValue placeholder={allRegionsLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allRegionsLabel}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
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
            <SelectTrigger className="min-h-12 rounded-2xl">
              <SelectValue placeholder={allCategoriesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allCategoriesLabel}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
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
            <SelectTrigger className="min-h-12 rounded-2xl">
              <SelectValue placeholder={allStatusesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{allStatusesLabel}</SelectItem>
              {verifications.map((verification) => (
                <SelectItem key={verification} value={verification}>
                  {verification}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit">{applyLabel}</Button>
          <Button asChild type="button" variant="secondary">
            <a href={routePrefix}>{clearLabel}</a>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export async function PublicDirectoryPage({
  module,
  titleKey,
  descriptionKey,
  searchParams,
}: {
  module: PublicModule
  titleKey: string
  descriptionKey: string
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const t = await getTranslations("publicSite")
  const query = parseDirectoryQuery(searchParams)
  const routePrefix = moduleRouteMap[module]
  const result = listPublicEntities(module, query)
  const facets = getDirectoryFacets(module)

  const paginationItems = Array.from({ length: result.totalPages }, (_, index) => {
    const page = index + 1
    const qs = buildQueryString({ ...query, page })
    return {
      label: String(page),
      href: `${routePrefix}${qs ? `?${qs}` : ""}`,
      active: page === result.page,
    }
  })

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
      title={t("filters.title")}
      query={query}
      regions={facets.regions}
      categories={facets.categories}
      verifications={facets.verifications}
      searchLabel={t("filters.search")}
      searchPlaceholder={t("filters.searchPlaceholder")}
      regionLabel={t("filters.region")}
      allRegionsLabel={t("filters.allRegions")}
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
              <div className="p-6 sm:p-8">
                <Badge>{t(`pages.${titleKey}.eyebrow`)}</Badge>
                <h1 className="text-brand-navy mt-4 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                  {t(`pages.${titleKey}.title`)}
                </h1>
                <p className="text-muted mt-4 max-w-3xl text-base leading-7 sm:text-lg">
                  {t(`pages.${descriptionKey}.description`)}
                </p>
                <form action={routePrefix} className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="relative">
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
                      key={category}
                      href={`${routePrefix}?category=${encodeURIComponent(category)}`}
                      className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-brand-navy transition hover:bg-primary/10"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <PublicEntityVisual module={module} title={t(`modules.${module}`)} className="h-full min-h-72 rounded-[28px]" />
              </div>
            </div>
          </Card>
          <PublicMetricStrip
            items={[
              { label: t("stats.publicResults"), value: String(result.total) },
              { label: t("stats.regions"), value: String(facets.regions.length) },
              { label: t("stats.categories"), value: String(facets.categories.length) },
              { label: t("stats.verificationStates"), value: String(facets.verifications.length) },
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
          <Badge>{t("search.resultCount", { count: String(result.total) })}</Badge>
          {query.q ? (
            <Badge className="bg-white text-brand-navy">
              <Search className="size-3.5" />
              {query.q}
            </Badge>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="lg:hidden">
                <Filter className="size-4" />
                {t("filters.title")}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
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
          />
        </div>
      </div>
    </DirectoryShell>
  )
}
