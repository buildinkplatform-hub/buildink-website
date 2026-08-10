"use client"

import {
  Building2,
  HardHat,
  LoaderCircle,
  PackageOpen,
  User,
  Wrench,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { saveProfileTypeAction } from "@/features/onboarding/actions/onboarding.actions"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import { profileTypeLabelKeys } from "@/shared/constants/platform"
import { profileTypes, type ProfileType } from "@/shared/types/platform"
import { OnboardingFrame } from "./onboarding-frame"
import { useOnboardingDraft } from "./onboarding-provider"

const profileTypeIcons = {
  individual: User,
  worker: HardHat,
  contractor: Building2,
  supplier_contact: PackageOpen,
  service_provider: Wrench,
}
const bodyKeys: Record<ProfileType, string> = {
  individual: "roles.individualBody",
  worker: "roles.workerBody",
  contractor: "roles.contractorBody",
  supplier_contact: "roles.supplierContactBody",
  service_provider: "roles.serviceProviderBody",
}

export function RoleSelection() {
  const t = useTranslations()
  const router = useRouter()
  const { draft, updateDraft } = useOnboardingDraft()
  const [selected, setSelected] = useState<ProfileType | undefined>(
    draft.profileType,
  )
  const [error, setError] = useState(false)
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
        {profileTypes.map((profileType) => {
          const Icon = profileTypeIcons[profileType]
          const active = selected === profileType
          return (
            <button
              key={profileType}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (pending) return
                setSelected(profileType)
                setError(false)
              }}
              className={cn(
                "min-h-36 rounded-2xl border p-5 text-start transition",
                active
                  ? "border-primary bg-light-blue shadow-sm"
                  : "border-line hover:border-primary/50 hover:bg-canvas",
              )}
            >
              <Icon
                className={cn("size-6", active ? "text-primary" : "text-muted")}
                aria-hidden="true"
              />
              <span className="text-brand-navy mt-4 block font-bold">
                {t(profileTypeLabelKeys[profileType])}
              </span>
              <span className="text-muted mt-2 block text-sm leading-6">
                {t(bodyKeys[profileType])}
              </span>
            </button>
          )
        })}
      </div>
      {error ? (
        <p role="alert" className="text-danger mt-4 text-sm">
          {t("onboarding.errors.profileType")}
        </p>
      ) : null}
      <Button
        className="mt-7 w-full sm:w-auto"
        onClick={async () => {
          if (!selected) return setError(true)
          setPending(true)
          const result = await saveProfileTypeAction(selected, draft.version)
          if (!result.success) {
            setPending(false)
            return setError(true)
          }
          updateDraft({ profileType: selected, profile: {}, version: result.draft.version })
          router.push("/onboarding/profile")
        }}
        disabled={pending}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {t("common.continue")}
      </Button>
    </OnboardingFrame>
  )
}
