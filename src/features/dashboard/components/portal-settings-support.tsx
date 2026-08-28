"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { savePortalNotificationPreferencesAction } from "@/features/dashboard/actions/portal-settings.actions"
import type { PortalNotificationPreferences } from "@/features/dashboard/data/portal-client"
import { Link } from "@/i18n/navigation"

export function SettingsModuleClient({
  preferences,
}: {
  preferences: PortalNotificationPreferences | null
}) {
  const t = useTranslations("dashboard.settings")
  const [savedPreferences, setSavedPreferences] = useState(preferences)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [values, setValues] = useState({
    emailEnabled: preferences?.emailEnabled ?? true,
    pushEnabled: preferences?.pushEnabled ?? true,
    inAppEnabled: preferences?.inAppEnabled ?? true,
    marketingEnabled: preferences?.marketingEnabled ?? false,
    digestFrequency: preferences?.digestFrequency ?? "DAILY",
  })

  async function save() {
    if (!savedPreferences || pending) return
    setPending(true)
    setMessage(undefined)
    const result = await savePortalNotificationPreferencesAction({
      ...values,
      version: savedPreferences.version,
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setSavedPreferences(result.preferences)
    setValues({
      emailEnabled: result.preferences.emailEnabled,
      pushEnabled: result.preferences.pushEnabled,
      inAppEnabled: result.preferences.inAppEnabled,
      marketingEnabled: result.preferences.marketingEnabled,
      digestFrequency: result.preferences.digestFrequency,
    })
    setMessage(t("saved"))
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="space-y-4 rounded-[24px] p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Account
          </p>
          <h2 className="text-foreground mt-1 text-lg font-semibold">
            {t("account")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("accountHint")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/profile" prefetch>
            {t("editProfile")}
          </Link>
        </Button>
      </Card>

      <Card className="space-y-4 rounded-[24px] p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Privacy
          </p>
          <h2 className="text-foreground mt-1 text-lg font-semibold">
            {t("privacy")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Control how your profile and contact information appear across
            Buildink.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/profile" prefetch>
            {t("visibilitySettings")}
          </Link>
        </Button>
      </Card>

      <Card className="space-y-5 rounded-[24px] p-5 shadow-sm sm:p-6 xl:col-span-2">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Communication
          </p>
          <h2 className="text-foreground mt-1 text-lg font-semibold">
            {t("notifications")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Changes save in place and no longer reload the protected route.
          </p>
        </div>

        {savedPreferences ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["emailEnabled", t("emailEnabled")],
                  ["pushEnabled", t("pushEnabled")],
                  ["inAppEnabled", t("inAppEnabled")],
                  ["marketingEnabled", t("marketingEnabled")],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="bg-muted/10 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                >
                  <Checkbox
                    checked={values[key]}
                    disabled={pending}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  <span className="text-foreground font-medium">{label}</span>
                </label>
              ))}
            </div>

            <Field label={t("digestFrequency")} htmlFor="digest-frequency">
              <Select
                value={values.digestFrequency}
                disabled={pending}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    digestFrequency: value as typeof values.digestFrequency,
                  }))
                }
              >
                <SelectTrigger id="digest-frequency" className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["IMMEDIATE", "DAILY", "WEEKLY", "MONTHLY", "OFF"].map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {t(`digest.${value}`)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground min-h-5 text-sm">
                {message ? (
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    {message}
                  </span>
                ) : null}
              </div>
              <Button disabled={pending} onClick={() => void save()}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Saving…" : t("save")}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("prefsUnavailable")}
          </p>
        )}
      </Card>
    </div>
  )
}
