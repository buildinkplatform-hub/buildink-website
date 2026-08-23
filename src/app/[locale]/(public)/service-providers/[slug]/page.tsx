import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function ServiceProviderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicEntityDetailPage module="service-providers" slug={slug} />
}
