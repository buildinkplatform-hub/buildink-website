import { CircleX } from "lucide-react"

import { guardOnboardingTerminalPage } from "@/lib/auth/onboarding-terminal"

export default async function OnboardingRejectedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requestedLocale } = await params
  await guardOnboardingTerminalPage(requestedLocale, "rejected")

  return (
    <div className="auth-panel mx-auto max-w-xl rounded-[30px] p-8 text-center sm:p-10">
      <div className="bg-danger/7 border-danger/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
        <CircleX className="text-danger size-7" />
      </div>
      <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
        Application not approved
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-md leading-7">
        Review the decision sent to your account. If your account is still
        active, choosing a new profile type starts a fresh application.
      </p>
    </div>
  )
}
