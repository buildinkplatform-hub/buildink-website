import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"
import { directoryMetadata } from "@/features/public/lib/directory-metadata"

export const generateMetadata = () => directoryMetadata("projectOwners")

export default async function ProjectOwnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="project-owners"
      titleKey="projectOwners"
      descriptionKey="projectOwners"
      accountType="PROJECT_OWNER"
      href="/project-owners"
      searchParams={await searchParams}
    />
  )
}
