import { CircleX } from "lucide-react"

export default function OnboardingRejectedPage() {
  return (
    <div className="border-line mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <CircleX className="text-danger mx-auto size-12" />
      <h1 className="text-brand-navy mt-5 text-3xl font-bold">Application not approved</h1>
      <p className="text-muted mt-3 leading-7">Review the decision sent to your account. If your account is still active, choosing a new profile type starts a fresh application.</p>
    </div>
  )
}
