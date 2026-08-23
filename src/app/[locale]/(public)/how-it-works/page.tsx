import type { Metadata } from "next"

import { getLocale } from "next-intl/server"

import { PublicContentPage } from "@/features/public/content/components/public-content-pages"
import { publicContentPageMetadata } from "@/features/public/content/lib/public-content-metadata"
import type { Locale } from "@/shared/types/platform"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return publicContentPageMetadata("how-it-works", locale)
}

export default function HowItWorksPage() {
  return <PublicContentPage type="how-it-works" />
}
