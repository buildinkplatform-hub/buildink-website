import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicEntityDetailPage module="suppliers" slug={slug} />
}

