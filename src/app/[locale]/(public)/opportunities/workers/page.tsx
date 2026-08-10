import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function OpportunityWorkersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="opportunities-workers"
      titleKey="workerRequests"
      descriptionKey="workerRequests"
      searchParams={await searchParams}
    />
  )
}

