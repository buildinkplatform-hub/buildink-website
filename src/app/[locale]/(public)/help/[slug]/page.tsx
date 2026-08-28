import type { Metadata } from "next"

import { PublicContentArticlePage } from "@/features/public/content/components/public-content-pages"
import { publicContentArticleMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  return publicContentArticleMetadata("help", slug, locale as Locale)
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { locale, slug } = await params
  return (
    <PublicContentArticlePage
      type="help"
      slug={slug}
      locale={locale as Locale}
    />
  )
}
