"use client"

import {
  Building2,
  CheckCircle2,
  Hammer,
  HardHat,
  LoaderCircle,
  User,
  Wrench,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { saveProfileTypeAction } from "@/features/onboarding/actions/onboarding.actions"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import { primaryAccountTypeLabelKeys } from "@/shared/constants/platform"
import {
  primaryAccountTypes,
  type PrimaryAccountType,
} from "@/shared/types/platform"
import { OnboardingFrame } from "./onboarding-frame"
import { useOnboardingDraft } from "./onboarding-provider"

const accountTypeIcons: Record<PrimaryAccountType, typeof User> = {
  COMPANY: Building2,
  PROJECT_OWNER: User,
  SUBCONTRACTOR: Hammer,
  SERVICE_PROVIDER: Wrench,
  WORKER: HardHat,
}

const bodyKeys: Record<PrimaryAccountType, string> = {
  COMPANY: "roles.companyBody",
  PROJECT_OWNER: "roles.projectOwnerBody",
  SUBCONTRACTOR: "roles.subcontractorBody",
  SERVICE_PROVIDER: "roles.serviceProviderBody",
  WORKER: "roles.workerBody",
}

export function RoleSelection() {
  const t = useTranslations()
  const router = useRouter()
  const { draft, updateDraft } = useOnboardingDraft()
  const [selected, setSelected] = useState<PrimaryAccountType | undefined>()
  const [errorKey, setErrorKey] = useState<"profileType" | "saveProfileType">()
  const [pending, setPending] = useState(false)

  return (
    <OnboardingFrame step={1}>
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("onboarding.roleTitle")}
        <span className="text-danger ms-1" aria-hidden="true">
          *
        </span>
      </h1>
      <p className="text-muted mt-3">{t("onboarding.roleBody")}</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {primaryAccountTypes.map((accountType) => {
          const Icon = accountTypeIcons[accountType]
          const active = selected === accountType
          return (
            <button
              key={accountType}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (pending) return
                setSelected(accountType)
                setErrorKey(undefined)
              }}
              className={cn(
                "min-h-36 rounded-2xl border p-5 text-start transition",
                active
                  ? "border-primary bg-light-blue shadow-sm"
                  : "border-line hover:border-primary/50 hover:bg-canvas",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon
                  className={cn(
                    "size-6",
                    active ? "text-primary" : "text-muted",
                  )}
                  aria-hidden="true"
                />
                <CheckCircle2
                  className={cn(
                    "size-5 transition-opacity",
                    active
                      ? "text-primary opacity-100"
                      : "text-muted/30 opacity-0",
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-brand-navy mt-4 block font-bold">
                {t(primaryAccountTypeLabelKeys[accountType])}
              </span>
              <span className="text-muted mt-2 block text-sm leading-6">
                {t(bodyKeys[accountType])}
              </span>
            </button>
          )
        })}
      </div>
      {errorKey ? (
        <p role="alert" className="text-danger mt-4 text-sm">
          {t(`onboarding.errors.${errorKey}`)}
        </p>
      ) : null}
      <Button
        className="mt-7 w-full sm:w-auto"
        onClick={async () => {
          if (!selected) return setErrorKey("profileType")
          setPending(true)
          try {
            const result = await saveProfileTypeAction(
              selected,
              draft.version,
              draft.profileType,
            )
            if (!result.success) {
              setPending(false)
              return setErrorKey("saveProfileType")
            }
            updateDraft({
              primaryAccountType: selected,
              profileType: result.draft.profileType ?? draft.profileType,
              profile: {},
              version: result.draft.version,
            })
            router.push("/onboarding/profile")
          } catch {
            setPending(false)
            return setErrorKey("saveProfileType")
          }
        }}
        disabled={pending}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {t("common.continue")}
      </Button>
    </OnboardingFrame>
  )
}
