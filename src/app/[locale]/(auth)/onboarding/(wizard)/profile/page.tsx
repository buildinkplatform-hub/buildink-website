import { getOnboardingCatalogAction } from "@/features/onboarding/actions/onboarding.actions"
import { ProfileForm } from "@/features/onboarding/components/profile-form"
import { isLocale } from "@/shared/constants/platform"

export default async function ProfileOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  const locale = isLocale(requestedLocale) ? requestedLocale : "it"
  const catalog = await getOnboardingCatalogAction(locale)
  return <ProfileForm catalog={catalog} />
}
