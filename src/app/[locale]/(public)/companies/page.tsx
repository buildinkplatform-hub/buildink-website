import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="companies"
      titleKey="companies"
      descriptionKey="companies"
      searchParams={await searchParams}
    />
  )
}

