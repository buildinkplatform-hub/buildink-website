import { PublicEntityDetailPage } from "@/features/public/components/public-entity-detail-page"

export default async function ProjectOwnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicEntityDetailPage module="project-owners" slug={slug} />
}
