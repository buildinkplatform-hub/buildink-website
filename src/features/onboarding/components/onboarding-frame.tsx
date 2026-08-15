"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils/cn"
import { Reveal } from "@/components/motion/reveal"

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
    <div data-onboarding-frame>
      <p className="text-primary text-sm font-semibold">
        {t("step", { current: step })} · {t(steps[step - 1] ?? "stepAccountType")}
      </p>
      <div
        className="mt-4 grid grid-cols-4 gap-2"
        aria-label={t("step", { current: step })}
      >
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={cn(
              "flex h-2 rounded-full",
              item <= step ? "bg-primary" : "bg-line",
            )}
          >
            <span className="sr-only">{item < step ? <Check /> : item}</span>
          </div>
        ))}
      </div>
      <div className="border-line mt-6 rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
        <Reveal>{children}</Reveal>
      </div>
    </div>
  )
}
