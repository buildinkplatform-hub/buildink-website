import { PublicContentArticlePage } from "@/features/public/content/components/public-content-pages"

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicContentArticlePage type="help" slug={slug} />
}
