import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("serviceRequests")

export default async function ServiceRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="opportunities-companies"
      titleKey="serviceRequests"
      descriptionKey="serviceRequests"
      href="/opportunities/services"
      searchParams={await searchParams}
    />
  )
}
