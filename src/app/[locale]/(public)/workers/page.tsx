import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("workers")

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="profiles"
      titleKey="workers"
      descriptionKey="workers"
      accountType="WORKER"
      href="/workers"
      searchParams={await searchParams}
    />
  )
}
