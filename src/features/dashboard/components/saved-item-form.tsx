"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createSavedItemCachedAction } from "@/features/dashboard/actions/portal-saved.actions"
import type { PortalSavedItem } from "@/features/dashboard/data/portal-client"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"

export function SavedItemForm() {
  const t = useTranslations("dashboard.savedItem")
  const queryClient = useQueryClient()
  const [entityType, setEntityType] = useState("PROJECT")
  const [entityId, setEntityId] = useState("")
  const [label, setLabel] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  async function save() {
    if (pending) return
    setPending(true)
    setMessage(undefined)
    const result = await createSavedItemCachedAction({
      entityType,
      entityId: entityId.trim(),
      label: label.trim() || undefined,
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const key = portalQueryKeys.resource("saved-items")
    queryClient.setQueryData<{ items: PortalSavedItem[] }>(key, (current) => ({
      items: [
        result.item,
        ...(current?.items ?? []).filter((item) => item.id !== result.item.id),
      ],
    }))
    setEntityId("")
    setLabel("")
  }

  return (
    <div className="bg-card text-card-foreground space-y-4 rounded-xl border p-4">
      <h3 className="text-foreground font-semibold">{t("title")}</h3>
      <Field label={t("entityType")} htmlFor="saved-item-type">
        <Input
          id="saved-item-type"
          value={entityType}
          disabled={pending}
          onChange={(event) => setEntityType(event.target.value)}
        />
      </Field>
      <Field label={t("entityId")} htmlFor="saved-item-id">
        <Input
          id="saved-item-id"
          value={entityId}
          disabled={pending}
          onChange={(event) => setEntityId(event.target.value)}
        />
      </Field>
      <Field label={t("label")} htmlFor="saved-item-label">
        <Input
          id="saved-item-label"
          value={label}
          disabled={pending}
          onChange={(event) => setLabel(event.target.value)}
        />
      </Field>
      <Button
        disabled={pending || entityId.trim().length < 3}
        onClick={() => void save()}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving…" : t("save")}
      </Button>
      {message ? (
        <p role="alert" className="text-destructive text-sm">
          {message}
        </p>
      ) : null}
    </div>
  )
}
