import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function OpportunityCompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicEntityDetailPage module="opportunities-companies" slug={slug} />
}

