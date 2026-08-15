"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribePublicNewsletterAction } from "@/features/public/actions/public-forms.actions"
import type { Locale } from "@/shared/types/platform"

export function PublicNewsletterCard({
  title,
  body,
  placeholder,
  consent,
  action,
  success,
  locale = "it",
}: {
  title: string
  body: string
  placeholder: string
  consent: string
  action: string
  success: string
  locale?: Locale
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="rounded-[32px] border border-primary/10 bg-[linear-gradient(135deg,#0b2450_0%,#176bff_140%)] p-6 text-white shadow-[var(--shadow-card)] sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
        Buildink
      </p>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
        {body}
      </p>
      {done ? (
        <div className="mt-6 rounded-2xl bg-white/12 p-4 text-sm font-semibold">
          {success}
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const email = String(form.get("email") ?? "")
            const result = await subscribePublicNewsletterAction({ email, locale })
            if (result.ok) {
              setDone(true)
              setError(null)
            } else {
              setError(result.message)
            }
          }}
        >
          <Input
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="border-white/20 bg-white text-brand-navy"
          />
          <Button type="submit" className="sm:min-w-44" variant="dark">
            {action}
          </Button>
        </form>
      )}
      {error ? <p className="mt-3 text-sm text-white/90">{error}</p> : null}
      <p className="mt-3 text-xs leading-6 text-white/70">{consent}</p>
    </div>
  )
}
