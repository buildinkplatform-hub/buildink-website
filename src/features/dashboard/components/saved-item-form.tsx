"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createSavedItemAction } from "@/features/dashboard/actions/portal.actions"
import { useRouter } from "@/i18n/navigation"

export function SavedItemForm() {
  const t = useTranslations("dashboard.savedItem")
  const router = useRouter()
  const [entityType, setEntityType] = useState("PROJECT")
  const [entityId, setEntityId] = useState("")
  const [label, setLabel] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  async function save() {
    setPending(true)
    setMessage(undefined)
    const result = await createSavedItemAction({
      entityType,
      entityId: entityId.trim(),
      label: label.trim() || undefined,
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setEntityId("")
    setLabel("")
    router.refresh()
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h3 className="text-brand-navy font-semibold">{t("title")}</h3>
      <Field label={t("entityType")} htmlFor="saved-item-type">
        <Input
          id="saved-item-type"
          value={entityType}
          onChange={(event) => setEntityType(event.target.value)}
        />
      </Field>
      <Field label={t("entityId")} htmlFor="saved-item-id">
        <Input
          id="saved-item-id"
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
        />
      </Field>
      <Field label={t("label")} htmlFor="saved-item-label">
        <Input
          id="saved-item-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
      </Field>
      <Button
        disabled={pending || entityId.trim().length < 3}
        onClick={() => void save()}
      >
        {t("save")}
      </Button>
      {message ? (
        <p role="alert" className="text-danger text-sm">
          {message}
        </p>
      ) : null}
    </div>
  )
}
