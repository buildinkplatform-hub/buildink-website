import type { Metadata } from "next"

import { getLocale } from "next-intl/server"

import { PublicContentCollectionPage } from "@/features/public/content/components/public-content-pages"
import { publicContentCollectionMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return publicContentCollectionMetadata("help", locale)
}

export default function HelpPage() {
  return <PublicContentCollectionPage type="help" />
}
