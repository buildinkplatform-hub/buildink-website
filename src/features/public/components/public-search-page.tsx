import { Search } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PublicEntityCard } from "@/features/public/components/public-cards"
import { DirectoryShell } from "@/features/public/components/public-shells"
import { moduleRouteMap } from "@/features/public/config/public-site.config"
import type { Locale } from "@/shared/types/platform"
import { searchAll } from "@/features/public/data/public-repository"

export async function PublicSearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const t = await getTranslations("publicSite")
  const locale = (await getLocale()) as Locale
  const q = Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q
  const results = await searchAll({ q }, locale)

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
        <Card className="p-4">
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
                defaultValue={q}
                placeholder={t("pages.search.title")}
              />
            </div>
          </form>
        </Card>
      }
    >
      <div>
        <div className="mb-5 flex items-center gap-3">
          <Badge>{t("search.resultCount", { count: String(results.length) })}</Badge>
          {q ? (
            <Badge className="bg-white text-brand-navy">
              <Search className="size-3.5" />
              {q}
            </Badge>
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
      </div>
    </DirectoryShell>
  )
}
