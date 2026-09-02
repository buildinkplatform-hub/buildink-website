"use client"

import { useState } from "react"
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { IntentPrefetchLink } from "@/components/shared/intent-prefetch-link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export function SettingsModuleClient({
  preferences,
}: {
  preferences: PortalNotificationPreferences | null
}) {
  const t = useTranslations("dashboard.settings")
  const [savedPreferences, setSavedPreferences] = useState(preferences)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<
    { tone: "success" | "error"; message: string } | undefined
  >()
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
    setFeedback(undefined)
    const result = await savePortalNotificationPreferencesAction({
      ...values,
      version: savedPreferences.version,
    })
    setPending(false)
    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message })
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
    setFeedback({ tone: "success", message: t("saved") })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
        <CardTitle>{t("account")}</CardTitle>
        <CardDescription>{t("accountHint")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-5 sm:pt-6">
        <div className="grid gap-3 md:grid-cols-2">
          <SettingsShortcut
            icon={UserRound}
            title={t("account")}
            description={t("accountHint")}
            action={t("editProfile")}
            href="/dashboard/profile"
          />
          <SettingsShortcut
            icon={ShieldCheck}
            title={t("privacy")}
            description={t("privacy")}
            action={t("visibilitySettings")}
            href="/dashboard/profile?tab=visibility"
          />
        </div>

        <section aria-labelledby="notification-preferences-heading">
          <div className="mb-4 flex items-start gap-3">
            <span className="border-primary/10 bg-primary/8 text-primary grid size-10 shrink-0 place-items-center rounded-xl border">
              <BellRing className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="notification-preferences-heading"
                className="text-brand-navy text-base font-semibold tracking-[-0.015em]"
              >
                {t("notifications")}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm leading-6">
                {t("notifications")}
              </p>
            </div>
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
                    className="border-border/90 bg-card hover:border-primary/20 hover:bg-primary/[0.02] flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors"
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

              <div className="max-w-sm">
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
                    <SelectTrigger
                      id="digest-frequency"
                      className="w-full shadow-none"
                    >
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
              </div>
            </div>
          ) : (
            <div className="border-warning/20 bg-warning/5 text-muted-foreground rounded-xl border p-4 text-sm">
              {t("prefsUnavailable")}
            </div>
          )}
        </section>
      </CardContent>

      {savedPreferences ? (
        <CardFooter className="justify-between">
          <div className="min-h-5 text-sm" role="status" aria-live="polite">
            {feedback ? (
              <span
                className={
                  feedback.tone === "success"
                    ? "text-success inline-flex items-center gap-2 font-medium"
                    : "text-danger inline-flex items-center gap-2 font-medium"
                }
              >
                {feedback.tone === "success" ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-4" aria-hidden="true" />
                )}
                {feedback.message}
              </span>
            ) : null}
          </div>
          <Button disabled={pending} onClick={() => void save()} size="md">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

function SettingsShortcut({
  icon: Icon,
  title,
  description,
  action,
  href,
}: {
  icon: typeof UserRound
  title: string
  description: string
  action: string
  href: string
}) {
  return (
    <div className="border-border/90 flex items-start justify-between gap-4 rounded-xl border bg-slate-50/45 p-4 dark:bg-white/[0.02]">
      <div className="flex min-w-0 gap-3">
        <span className="border-border bg-card text-primary grid size-9 shrink-0 place-items-center rounded-lg border shadow-[var(--shadow-xs)]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-brand-navy text-sm font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {description}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <IntentPrefetchLink href={href}>{action}</IntentPrefetchLink>
      </Button>
    </div>
  )
}
