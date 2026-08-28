import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"
import type { Locale } from "@/shared/types/platform"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) => directoryMetadata("serviceProviders", (await params).locale)

export default async function ServiceProvidersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      locale={(await params).locale}
      module="service-providers"
      titleKey="serviceProviders"
      descriptionKey="serviceProviders"
      accountType="SERVICE_PROVIDER"
      href="/service-providers"
      searchParams={await searchParams}
    />
  )
}
