import type { Metadata } from "next"

import { PublicContentCollectionPage } from "@/features/public/content/components/public-content-pages"
import { publicContentCollectionMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params
  return publicContentCollectionMetadata("help", locale as Locale)
}

export default async function HelpPage({ params }: PageProps) {
  const { locale } = await params
  return <PublicContentCollectionPage type="help" locale={locale as Locale} />
}
