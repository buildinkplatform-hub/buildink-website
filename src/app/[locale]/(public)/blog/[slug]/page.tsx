import { PublicContentArticlePage } from "@/features/public/content/components/public-content-pages"

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicContentArticlePage type="blog" slug={slug} />
}
