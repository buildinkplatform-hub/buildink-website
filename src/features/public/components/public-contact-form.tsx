"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitPublicContactAction } from "@/features/public/actions/public-forms.actions"

export function PublicContactForm({
  nameLabel,
  emailLabel,
  messageLabel,
  action,
  success,
}: {
  nameLabel: string
  emailLabel: string
  messageLabel: string
  action: string
  success: string
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (done) {
    return <p className="text-brand-navy font-semibold">{success}</p>
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const result = await submitPublicContactAction({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          message: String(form.get("message") ?? ""),
        })
        if (result.ok) {
          setDone(true)
          setError(null)
        } else {
          setError(result.message)
        }
      }}
    >
      <Input name="name" required placeholder={nameLabel} />
      <Input name="email" type="email" required placeholder={emailLabel} />
      <textarea
        name="message"
        required
        minLength={10}
        placeholder={messageLabel}
        className="border-input bg-background min-h-32 w-full rounded-xl border px-3 py-2 text-sm"
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit">{action}</Button>
    </form>
  )
}
