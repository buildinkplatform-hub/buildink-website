import { CircleX } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { guardOnboardingTerminalPage } from "@/lib/auth/onboarding-terminal"

export default async function OnboardingRejectedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  await guardOnboardingTerminalPage(requestedLocale, "rejected")
  const onboarding = await getTranslations("onboarding")

  return (
    <div className="auth-panel mx-auto max-w-xl rounded-[30px] p-8 text-center sm:p-10">
      <div className="bg-danger/7 border-danger/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
        <CircleX className="text-danger size-7" />
      </div>
      <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
        {onboarding("rejectedTitle")}
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-md leading-7">
        {onboarding("rejectedBody")}
      </p>
    </div>
  )
}
