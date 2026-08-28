import type { Metadata } from "next"

import { ReviewedPublicContentPage } from "@/features/public/content/components/reviewed-public-content-page"
import { publicContentPageMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params
  return publicContentPageMetadata("faq", locale as Locale)
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params
  return <ReviewedPublicContentPage type="faq" locale={locale as Locale} />
}
