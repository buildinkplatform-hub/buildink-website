import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function SubcontractorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicEntityDetailPage module="subcontractors" slug={slug} />
}
