import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("companyRequests")

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="opportunities"
      titleKey="companyRequests"
      descriptionKey="companyRequests"
      href="/opportunities"
      searchParams={await searchParams}
    />
  )
}
