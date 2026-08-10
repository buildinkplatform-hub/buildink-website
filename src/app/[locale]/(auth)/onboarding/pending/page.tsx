import { Clock3 } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function OnboardingPendingPage() {
  const common = await getTranslations("common")
  const onboarding = await getTranslations("onboarding")

  return (
    <div className="border-line mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <Clock3 className="text-primary mx-auto size-12" />
      <h1 className="text-brand-navy mt-5 text-3xl font-bold">
        {onboarding("pendingTitle")}
      </h1>
      <p className="text-muted mt-3 leading-7">{onboarding("pendingBody")}</p>
      <div className="mt-6">
        <Button asChild variant="secondary">
          <Link href="/">{common("visitHome")}</Link>
        </Button>
      </div>
    </div>
  )
}
