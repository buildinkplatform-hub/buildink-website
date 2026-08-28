import type { Metadata } from "next"

import { PublicPlaceholder } from "@/features/home/components/public-placeholder"
import type { Locale } from "@/shared/types/platform"

export const metadata: Metadata = { robots: { index: true, follow: true } }

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <PublicPlaceholder locale={locale as Locale} />
}
