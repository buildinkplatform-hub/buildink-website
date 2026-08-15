import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("subcontractors")

export default async function SubcontractorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="profiles"
      titleKey="subcontractors"
      descriptionKey="subcontractors"
      accountType="SUBCONTRACTOR"
      href="/subcontractors"
      searchParams={await searchParams}
    />
  )
}
