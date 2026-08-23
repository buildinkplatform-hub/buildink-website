import type { Metadata } from "next"
import { getLocale } from "next-intl/server"

import { PublicContentArticlePage } from "@/features/public/content/components/public-content-pages"
import { publicContentArticleMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const { slug } = await params
  return publicContentArticleMetadata("blog", slug, locale)
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PublicContentArticlePage type="blog" slug={slug} />
}
