import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"
import type { Locale } from "@/shared/types/platform"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) => directoryMetadata("suppliers", (await params).locale)

export default async function SuppliersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  return (
    <PublicDirectoryPage
      locale={(await params).locale}
      module="companies"
      titleKey="suppliers"
      descriptionKey="suppliers"
      searchParams={{ ...query, companyType: "SUPPLIER" }}
      href="/suppliers"
    />
  )
}
