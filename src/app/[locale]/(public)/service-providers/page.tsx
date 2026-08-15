import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("serviceProviders")

export default async function ServiceProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="profiles"
      titleKey="serviceProviders"
      descriptionKey="serviceProviders"
      accountType="SERVICE_PROVIDER"
      href="/service-providers"
      searchParams={await searchParams}
    />
  )
}
