import { redirect } from "next/navigation"

import { isLocale } from "@/shared/constants/platform"

export default async function LegacyRolePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${isLocale(locale) ? locale : "it"}/onboarding/profile-type`)
}
