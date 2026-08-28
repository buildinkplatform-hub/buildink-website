import { PublicSearchPage } from "@/features/public/components/public-search-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"
import type { Locale } from "@/shared/types/platform"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) => directoryMetadata("search", (await params).locale)

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <PublicSearchPage searchParams={await searchParams} />
}
