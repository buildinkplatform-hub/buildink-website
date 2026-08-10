import { PublicDirectoryPage } from "@/features/public/components/public-directory-page"

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <PublicDirectoryPage
      module="equipment"
      titleKey="equipment"
      descriptionKey="equipment"
      searchParams={await searchParams}
    />
  )
}

