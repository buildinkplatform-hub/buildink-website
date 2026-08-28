import { ShieldAlert } from "lucide-react"

export default function AccountRestrictedPage() {
  return (
    <div className="auth-panel mx-auto max-w-xl rounded-[30px] p-8 text-center sm:p-10">
      <div className="bg-warning/8 border-warning/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
        <ShieldAlert className="text-warning size-7" />
      </div>
      <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
        Account restricted
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-md leading-7">
        This account cannot access Buildink. Contact support if you believe this
        is a mistake.
      </p>
    </div>
  )
}
