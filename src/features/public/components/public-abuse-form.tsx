"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { submitPublicAbuseAction } from "@/features/public/actions/public-forms.actions"

export function PublicAbuseForm({
  entityType,
  entityId,
  action,
  success,
}: {
  entityType: string
  entityId: string
  action: string
  success: string
}) {
  const [done, setDone] = useState(false)
  const [open, setOpen] = useState(false)

  if (done) return <p className="text-sm font-semibold">{success}</p>

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {action}
      </Button>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const result = await submitPublicAbuseAction({
          entityType,
          entityId,
          reasonCode: "public_report",
          description: String(form.get("description") ?? ""),
        })
        if (result.ok) setDone(true)
      }}
    >
      <textarea
        name="description"
        required
        minLength={8}
        className="border-input bg-background min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
      />
      <Button type="submit" size="sm">
        {action}
      </Button>
    </form>
  )
}
