import { Clock3 } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { OnboardingPushBanner } from "@/features/onboarding/components/push-permission-banner"
import { Link } from "@/i18n/navigation"
import { guardOnboardingTerminalPage } from "@/lib/auth/onboarding-terminal"

export default async function OnboardingPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  await guardOnboardingTerminalPage(requestedLocale, "pending")
  const common = await getTranslations("common")
  const onboarding = await getTranslations("onboarding")

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="auth-panel rounded-[30px] p-8 text-center sm:p-10">
        <div className="border-primary/10 bg-primary/6 mx-auto flex size-14 items-center justify-center rounded-2xl border">
          <Clock3 className="text-primary size-7" />
        </div>
        <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
          {onboarding("pendingTitle")}
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md leading-7">
          {onboarding("pendingBody")}
        </p>
        <div className="mt-7">
          <Button asChild variant="secondary">
            <Link href="/">{common("visitHome")}</Link>
          </Button>
        </div>
      </div>
      <OnboardingPushBanner />
    </div>
  )
}
