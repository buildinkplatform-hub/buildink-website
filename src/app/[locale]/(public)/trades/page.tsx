import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"
import type { Locale } from "@/shared/types/platform"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) => directoryMetadata("trades", (await params).locale)

export default async function TradesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      locale={(await params).locale}
      module="companies"
      titleKey="trades"
      descriptionKey="trades"
      href="/trades"
      searchParams={await searchParams}
    />
  )
}
