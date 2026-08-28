"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils/cn"

const steps = [
  "stepAccountType",
  "stepProfile",
  "stepDocuments",
  "stepReview",
] as const

export function OnboardingFrame({
  step,
  children,
}: {
  step: number
  children: React.ReactNode
}) {
  const t = useTranslations("onboarding")

  return (
    <div data-onboarding-frame className="w-full">
      <div className="glass-panel rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
              {t("step", { current: step })}
            </p>
            <p className="text-brand-navy mt-1 text-sm font-semibold">
              {t(steps[step - 1] ?? "stepAccountType")}
            </p>
          </div>
          <span className="border-primary/10 bg-primary/5 text-primary rounded-full border px-3 py-1 text-xs font-bold tabular-nums">
            {Math.round((step / 4) * 100)}%
          </span>
        </div>

        <div
          className="mt-5 grid grid-cols-4 gap-2 sm:gap-3"
          aria-label={t("step", { current: step })}
        >
          {[1, 2, 3, 4].map((item) => {
            const complete = item < step
            const active = item === step
            return (
              <div key={item} className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
                      complete && "border-primary bg-primary text-white",
                      active &&
                        "border-primary bg-primary/10 text-primary ring-primary/8 ring-4",
                      item > step && "border-line text-muted bg-white",
                    )}
                  >
                    {complete ? <Check className="size-3.5" /> : item}
                  </div>
                  {item < 4 ? (
                    <div
                      className={cn(
                        "h-1.5 min-w-0 flex-1 rounded-full transition-colors",
                        item < step ? "bg-primary" : "bg-line",
                      )}
                    />
                  ) : null}
                </div>
                <span className="sr-only">
                  {complete ? `Completed step ${item}` : `Step ${item}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="auth-panel mt-5 rounded-[30px] p-5 sm:p-8 lg:p-9">
        <Reveal>{children}</Reveal>
      </div>
    </div>
  )
}
