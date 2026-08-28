import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"
import { getPublicCatalogueItem } from "@/features/public/data/public-repository"
import type { Locale } from "@/shared/types/platform"

type PageProps = {
  params: Promise<{ locale: string; slug: string; id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, id } = await params
  const item = await getPublicCatalogueItem(id, locale as Locale)
  if (!item) return {}
  return {
    title: item.title,
    description: item.summary,
  }
}

export default async function CatalogueItemPage({ params }: PageProps) {
  const { locale, id } = await params
  const item = await getPublicCatalogueItem(id, locale as Locale)
  if (!item) notFound()
  return (
    <PublicEntityDetailPage module="companies" slug={item.slug} record={item} />
  )
}
