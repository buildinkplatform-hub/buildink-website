import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="profiles"
      titleKey="profiles"
      descriptionKey="profiles"
      searchParams={await searchParams}
    />
  )
}

