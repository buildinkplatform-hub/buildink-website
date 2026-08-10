import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; segments?: string[] }>
}) {
  const { slug, segments } = await params
  return (
    <PublicEntityDetailPage
      module="companies"
      slug={slug}
      companySection={segments?.[0]}
    />
  )
}

