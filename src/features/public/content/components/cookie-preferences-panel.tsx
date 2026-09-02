"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Cookie, LockKeyhole } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const PREFERENCES_KEY = "buildink_cookie_preferences"
const BANNER_KEY = "buildink_cookie_banner_dismissed"

type CookiePreferences = {
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULTS: CookiePreferences = {
  preferences: false,
  analytics: false,
  marketing: false,
}

export function CookiePreferencesPanel() {
  const t = useTranslations("trustPages.cookies")
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<CookiePreferences>
        // Restoring a user-controlled browser preference necessarily occurs
        // after hydration because localStorage is unavailable on the server.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences({
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        })
      } catch {
        window.localStorage.removeItem(PREFERENCES_KEY)
      }
    }
    // Do not let a user toggle a control before the persisted values have been
    // restored; otherwise the hydration effect can overwrite that first click.
    setHydrated(true)
  }, [])

  const options = [
    {
      key: "preferences" as const,
      title: t("preferencesCategoryTitle"),
      body: t("preferencesCategoryBody"),
    },
    {
      key: "analytics" as const,
      title: t("analyticsTitle"),
      body: t("analyticsBody"),
    },
    {
      key: "marketing" as const,
      title: t("marketingTitle"),
      body: t("marketingBody"),
    },
  ]

  return (
    <Card className="overflow-hidden rounded-[30px] border-white/70 p-0 shadow-[var(--shadow-card)]">
      <div className="border-b border-slate-200/70 bg-slate-50/70 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <Cookie className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-brand-navy text-2xl font-bold">
              {t("preferencesTitle")}
            </h2>
            <p className="text-muted mt-2 max-w-3xl text-sm leading-7 sm:text-base">
              {t("preferencesBody")}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-200/70">
        <div className="flex items-start justify-between gap-5 p-6 sm:p-7">
          <div className="flex gap-4">
            <span className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-xl">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-brand-navy font-bold">
                {t("essentialTitle")}
              </h3>
              <p className="text-muted mt-1 max-w-2xl text-sm leading-6">
                {t("essentialBody")}
              </p>
            </div>
          </div>
          <span className="bg-success/10 text-success shrink-0 rounded-full px-3 py-1 text-xs font-bold">
            {t("alwaysOn")}
          </span>
        </div>

        {options.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-start justify-between gap-5 p-6 transition hover:bg-slate-50/60 sm:p-7"
          >
            <div>
              <h3 className="text-brand-navy font-bold">{option.title}</h3>
              <p className="text-muted mt-1 max-w-2xl text-sm leading-6">
                {option.body}
              </p>
            </div>
            <Checkbox
              checked={preferences[option.key]}
              disabled={!hydrated}
              onChange={(event) => {
                const checked = event.currentTarget.checked
                setSaved(false)
                setPreferences((current) => ({
                  ...current,
                  [option.key]: checked,
                }))
              }}
              aria-label={option.title}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-white p-6 sm:p-7">
        <Button
          disabled={!hydrated}
          onClick={() => {
            window.localStorage.setItem(
              PREFERENCES_KEY,
              JSON.stringify(preferences),
            )
            window.localStorage.setItem(BANNER_KEY, "managed")
            setSaved(true)
          }}
        >
          {t("save")}
        </Button>
        {saved ? (
          <p
            className="text-success flex items-center gap-2 text-sm font-semibold"
            role="status"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {t("saved")}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
