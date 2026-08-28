"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSavedSearchCachedAction } from "@/features/dashboard/actions/portal-saved.actions"
import type { PortalSavedSearch } from "@/features/dashboard/data/portal-client"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"

const searchKinds = [
  "GLOBAL",
  "COMPANIES",
  "PROFILES",
  "PROJECTS",
  "TENDERS",
  "EQUIPMENT",
  "OPPORTUNITIES",
] as const

export function SavedSearchForm() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [kind, setKind] = useState<(typeof searchKinds)[number]>("TENDERS")
  const [query, setQuery] = useState("")
  const [alerts, setAlerts] = useState(true)
  const [frequency, setFrequency] = useState<
    "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY"
  >("DAILY")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (pending) return
        setPending(true)
        setMessage(undefined)
        void createSavedSearchCachedAction({
          name,
          kind,
          query: query || null,
          alert: alerts
            ? {
                enabled: true,
                frequency,
                emailEnabled: true,
                pushEnabled: true,
                inAppEnabled: true,
              }
            : undefined,
        }).then((result) => {
          setPending(false)
          if (!result.ok) {
            setMessage(result.message)
            return
          }
          const key = portalQueryKeys.resource("saved-searches")
          queryClient.setQueryData<{ items: PortalSavedSearch[] }>(
            key,
            (current) => ({
              items: [
                result.search,
                ...(current?.items ?? []).filter(
                  (item) => item.id !== result.search.id,
                ),
              ],
            }),
          )
          setName("")
          setQuery("")
        })
      }}
    >
      <h2 className="text-foreground text-lg font-semibold">
        {t("dashboard.savedSearch.title")}
      </h2>
      <Field
        label={t("dashboard.savedSearch.name")}
        htmlFor="saved-search-name"
        required
      >
        <Input
          id="saved-search-name"
          value={name}
          disabled={pending}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.savedSearch.kind")}
        htmlFor="saved-search-kind"
      >
        <Select
          value={kind}
          disabled={pending}
          onValueChange={(value) =>
            setKind(value as (typeof searchKinds)[number])
          }
        >
          <SelectTrigger id="saved-search-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {searchKinds.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`dashboard.savedSearch.kinds.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field
        label={t("dashboard.savedSearch.query")}
        htmlFor="saved-search-query"
      >
        <Input
          id="saved-search-query"
          value={query}
          disabled={pending}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Field>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <Checkbox
          checked={alerts}
          disabled={pending}
          onChange={(event) => setAlerts(event.target.checked)}
        />
        {t("dashboard.savedSearch.alerts")}
      </label>
      {alerts ? (
        <Field
          label={t("dashboard.savedSearch.frequency")}
          htmlFor="saved-search-frequency"
        >
          <Select
            value={frequency}
            disabled={pending}
            onValueChange={(value) => setFrequency(value as typeof frequency)}
          >
            <SelectTrigger id="saved-search-frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["IMMEDIATE", "DAILY", "WEEKLY", "MONTHLY"] as const).map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {t(`dashboard.savedSearch.frequencies.${item}`)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
      {message ? <p className="text-destructive text-sm">{message}</p> : null}
      <Button type="submit" disabled={pending || name.trim().length < 2}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving…" : t("dashboard.savedSearch.save")}
      </Button>
    </form>
  )
}
