import { getLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"
import { getPublicEntity } from "@/features/public/data/public-repository"
import type { Locale } from "@/shared/types/platform"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; segments?: string[] }>
}) {
  const { slug, segments } = await params
  const locale = (await getLocale()) as Locale
  const record = await getPublicEntity("companies", slug, locale)
  if (!record) notFound()

  const companySection = segments?.[0]
  // The backend is the authority for public company subpages. Do not turn an
  // unknown, hidden or unavailable section into a misleading 200 overview.
  if (
    companySection &&
    !record.subpages?.some((subpage) => subpage.slug === companySection)
  ) {
    notFound()
  }

  return (
    <PublicEntityDetailPage
      module="companies"
      slug={slug}
      companySection={companySection}
      record={record}
    />
  )
}
