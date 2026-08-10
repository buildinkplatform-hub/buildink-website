import { getOnboardingCatalogAction } from "@/features/onboarding/actions/onboarding.actions"
import { DocumentsForm } from "@/features/onboarding/components/documents-form"
import { isLocale } from "@/shared/constants/platform"

export default async function DocumentsOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const catalog = await getOnboardingCatalogAction(locale)
  return <DocumentsForm countries={catalog.countries} />
}
