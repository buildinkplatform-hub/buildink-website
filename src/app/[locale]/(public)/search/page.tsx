import { PublicSearchPage } from "@/features/public/components/public-search-page"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <PublicSearchPage searchParams={await searchParams} />
}

