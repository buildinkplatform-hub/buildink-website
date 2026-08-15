import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"
import { getPublicCatalogueItem } from "@/features/public/data/public-repository"
import type { Locale } from "@/shared/types/platform"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const locale = (await getLocale()) as Locale
  const item = await getPublicCatalogueItem(id, locale)
  if (!item) return {}
  return {
    title: item.title,
    description: item.summary,
  }
}

export default async function CatalogueItemPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { id } = await params
  const locale = (await getLocale()) as Locale
  const item = await getPublicCatalogueItem(id, locale)
  if (!item) notFound()
  return (
    <PublicEntityDetailPage module="suppliers" slug={item.slug} record={item} />
  )
}
