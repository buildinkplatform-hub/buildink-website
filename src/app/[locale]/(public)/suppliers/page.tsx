import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("suppliers")

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="suppliers"
      titleKey="suppliers"
      descriptionKey="suppliers"
      searchParams={await searchParams}
    />
  )
}

