import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="tenders"
      titleKey="tenders"
      descriptionKey="tenders"
      searchParams={await searchParams}
    />
  )
}

