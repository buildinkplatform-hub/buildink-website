import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="projects"
      titleKey="projects"
      descriptionKey="projects"
      searchParams={await searchParams}
    />
  )
}

