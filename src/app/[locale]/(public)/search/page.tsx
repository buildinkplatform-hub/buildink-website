import { PublicSearchPage } from "@/features/public/components/public-search-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("search")

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <PublicSearchPage searchParams={await searchParams} />
}

