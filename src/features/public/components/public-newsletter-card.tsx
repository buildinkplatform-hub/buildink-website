"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PublicNewsletterCard({
  title,
  body,
  placeholder,
  consent,
  action,
  success,
}: {
  title: string
  body: string
  placeholder: string
  consent: string
  action: string
  success: string
}) {
  const [done, setDone] = useState(false)

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
          onSubmit={(event) => {
            event.preventDefault()
            setDone(true)
          }}
        >
          <Input
            type="email"
            required
            placeholder={placeholder}
            className="border-white/20 bg-white text-brand-navy"
          />
          <Button type="submit" className="sm:min-w-44" variant="dark">
            {action}
          </Button>
        </form>
      )}
      <p className="mt-3 text-xs leading-6 text-white/70">{consent}</p>
    </div>
  )
}
