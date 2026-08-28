"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribePublicNewsletterAction } from "@/features/public/actions/public-forms.actions"
import { cn } from "@/lib/utils/cn"
import type { Locale } from "@/shared/types/platform"

export function PublicNewsletterCard({
  title,
  body,
  placeholder,
  consent,
  action,
  success,
  locale = "it",
  variant = "card",
}: {
  title: string
  body: string
  placeholder: string
  consent: string
  action: string
  success: string
  locale?: Locale
  variant?: "card" | "footer"
}) {
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const compact = variant === "footer"

  return (
    <div
      className={cn(
        "border-primary/10 overflow-hidden rounded-[32px] border bg-[linear-gradient(135deg,#0b2450_0%,#176bff_140%)] text-white shadow-[var(--shadow-card)]",
        compact ? "p-5 shadow-none sm:p-6" : "p-6 sm:p-8",
      )}
    >
      <p className="text-xs font-bold tracking-[0.18em] text-white/65 uppercase">
        Buildink
      </p>
      <h2
        className={cn(
          "mt-3 font-bold",
          compact ? "text-xl" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-3 leading-7 text-white/78",
          compact ? "text-xs" : "max-w-2xl text-sm sm:text-base",
        )}
      >
        {body}
      </p>
      {done ? (
        <div
          className="mt-5 flex items-start gap-2 rounded-2xl bg-white/12 p-4 text-sm font-semibold"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {success}
        </div>
      ) : (
        <form
          className={cn(
            "mt-5 flex gap-3",
            compact ? "flex-col" : "flex-col sm:flex-row",
          )}
          onSubmit={async (event) => {
            event.preventDefault()
            if (pending) return
            setPending(true)
            setError(null)
            try {
              const form = new FormData(event.currentTarget)
              const email = String(form.get("email") ?? "")
              const result = await subscribePublicNewsletterAction({
                email,
                locale,
              })
              if (result.ok) {
                setDone(true)
                setError(null)
              } else {
                setError(result.message)
              }
            } finally {
              setPending(false)
            }
          }}
        >
          <Input
            type="email"
            name="email"
            required
            disabled={pending}
            autoComplete="email"
            placeholder={placeholder}
            className="text-brand-navy border-white/20 bg-white"
          />
          <Button
            type="submit"
            disabled={pending}
            className={cn(!compact && "sm:min-w-44")}
            variant="dark"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {action}
          </Button>
        </form>
      )}
      {error ? (
        <p className="mt-3 text-sm text-white/90" role="alert">
          {error}
        </p>
      ) : null}
      <p
        className={cn(
          "mt-3 leading-6 text-white/60",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {consent}
      </p>
    </div>
  )
}
