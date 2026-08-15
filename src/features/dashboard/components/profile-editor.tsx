"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { parsePhoneNumber } from "react-phone-number-input"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhoneInput } from "@/features/onboarding/components/phone-input"
import { updateMeProfileAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalBootstrapProfile } from "@/features/dashboard/data/portal-client"
import { isLocale, localeMetadata } from "@/shared/constants/platform"
import { locales, type Locale } from "@/shared/types/platform"

const fallbackPhoneCountries = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "IT", name: "Italy" },
  { code: "PK", name: "Pakistan" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "US", name: "United States" },
] as const

export function ProfileEditor({
  profile,
}: {
  profile: PortalBootstrapProfile
}) {
  const t = useTranslations()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.displayName ?? "")
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [timezone, setTimezone] = useState(profile.timezone || "Europe/Rome")
  const [preferredLocale, setPreferredLocale] = useState<Locale>(
    isLocale(profile.preferredLocale) ? profile.preferredLocale : "en",
  )
  const [contactPreference, setContactPreference] = useState<
    "platform_only" | "public_contact"
  >(
    profile.contactPreference === "public_contact"
      ? "public_contact"
      : "platform_only",
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const selectedCountry = parsePhoneNumber(phone || "")?.country ?? "IT"

  async function save() {
    setPending(true)
    setMessage(undefined)
    const result = await updateMeProfileAction({
      displayName,
      phone: phone || null,
      timezone,
      preferredLocale,
      contactPreference,
      version: profile.version,
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setMessage(t("dashboard.profile.saved"))
    router.refresh()
  }

  return (
    <div className="grid max-w-3xl gap-5 lg:grid-cols-2">
      <Field
        label={t("dashboard.profile.displayName")}
        htmlFor="display-name"
        required
      >
        <Input
          id="display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.profile.phone")} htmlFor="phone">
        <PhoneInput
          id="phone"
          value={phone}
          countryCode={selectedCountry}
          countries={[...fallbackPhoneCountries]}
          onChange={setPhone}
          onCountryChange={() => undefined}
        />
      </Field>
      <Field label={t("dashboard.profile.timezone")} htmlFor="timezone">
        <Input
          id="timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.profile.preferredLocale")}
        htmlFor="preferred-locale"
        hint={t("dashboard.profile.preferredLocaleHint")}
      >
        <Select
          value={preferredLocale}
          onValueChange={(value) => setPreferredLocale(value as Locale)}
        >
          <SelectTrigger id="preferred-locale">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                {localeMetadata[locale].nativeLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field
        label={t("dashboard.profile.contactPreference")}
        htmlFor="contact-preference"
        
      >
        <Select
          value={contactPreference}
          onValueChange={(value) =>
            setContactPreference(
              value === "public_contact" ? "public_contact" : "platform_only",
            )
          }
        >
          <SelectTrigger id="contact-preference">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platform_only">
              {t("dashboard.profile.platformOnly")}
            </SelectItem>
            <SelectItem value="public_contact">
              {t("dashboard.profile.publicContact")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-center gap-3 lg:col-span-2">
        <Button type="button" disabled={pending} onClick={() => void save()}>
          {t("dashboard.profile.save")}
        </Button>
        {message ? <p className="text-muted text-sm">{message}</p> : null}
      </div>
    </div>
  )
}
