"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  submitOfferAction,
  updateOfferDraftAction,
} from "@/features/dashboard/actions/portal.actions"
import { useRouter } from "@/i18n/navigation"

export type EditableDraftOffer = {
  id: string
  version: number
  status: string
  targetTitle: string | null
  title: string | null
  reference: string
  proposedPriceMinor: string | null
  currency: string | null
  proposedDurationDays?: number | null
  coverMessage?: string | null
}

function minorToMajor(value: string | null) {
  if (!value) return ""
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ""
  return (amount / 100).toFixed(2).replace(/\.00$/, "")
}

function majorToMinor(value: string) {
  const amount = Number(value.replace(",", "."))
  if (!Number.isFinite(amount) || amount < 0) return null
  return String(Math.round(amount * 100))
}

function actionErrorMessage(
  result:
    { ok: false; code: string; message: string } | { ok: true; offer: unknown },
  fallback: string,
) {
  return "message" in result ? result.message : fallback
}

export function OfferDraftEditForm({ offer }: { offer: EditableDraftOffer }) {
  const t = useTranslations()
  const router = useRouter()
  const [price, setPrice] = useState(minorToMajor(offer.proposedPriceMinor))
  const [currency, setCurrency] = useState(offer.currency ?? "EUR")
  const [duration, setDuration] = useState(
    offer.proposedDurationDays ? String(offer.proposedDurationDays) : "",
  )
  const [notes, setNotes] = useState(offer.coverMessage ?? "")
  const [version, setVersion] = useState(offer.version)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  async function saveDraft(): Promise<number | null> {
    const proposedPriceMinor = majorToMinor(price)
    if (proposedPriceMinor === null) {
      setMessage("Enter a valid price.")
      return null
    }
    setPending(true)
    setMessage(undefined)
    try {
      const result = await updateOfferDraftAction(
        offer.id,
        {
          proposedPriceMinor,
          totalPriceMinor: proposedPriceMinor,
          currency,
          proposedDurationDays: duration ? Number(duration) : null,
          coverMessage: notes || null,
        },
        version,
      )
      if (!result.ok) {
        setMessage(actionErrorMessage(result, "Could not save draft"))
        return null
      }
      const savedVersion = result.offer.version
      setVersion(savedVersion)
      setMessage("Draft changes saved.")
      return savedVersion
    } finally {
      setPending(false)
    }
  }

  async function submit() {
    const savedVersion = await saveDraft()
    if (!savedVersion) return
    setPending(true)
    setMessage(undefined)
    try {
      const result = await submitOfferAction(offer.id, savedVersion)
      if (!result.ok) {
        setMessage(actionErrorMessage(result, "Could not submit offer"))
        return
      }
      router.push("/dashboard/offers")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-muted text-xs tracking-wide uppercase">
          {t("dashboard.create.target")}
        </p>
        <p className="text-brand-navy mt-1 font-semibold">
          {offer.targetTitle || offer.title || offer.reference}
        </p>
        <p className="text-muted mt-1 text-xs">{offer.reference}</p>
      </div>

      <Field
        label={t("dashboard.create.price")}
        htmlFor="offer-draft-price"
        required
      >
        <Input
          id="offer-draft-price"
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="1500.00"
        />
      </Field>

      <Field
        label={t("dashboard.create.currency")}
        htmlFor="offer-draft-currency"
      >
        <Input
          id="offer-draft-currency"
          value={currency}
          maxLength={3}
          onChange={(event) => setCurrency(event.target.value.toUpperCase())}
        />
      </Field>

      <Field
        label={t("dashboard.create.duration")}
        htmlFor="offer-draft-duration"
      >
        <Input
          id="offer-draft-duration"
          inputMode="numeric"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
        />
      </Field>

      <Field label={t("dashboard.create.notes")} htmlFor="offer-draft-notes">
        <Textarea
          id="offer-draft-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Field>

      {message ? <p className="text-muted text-sm">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void saveDraft()}
        >
          {t("common.save")}
        </Button>
        <Button type="button" disabled={pending} onClick={() => void submit()}>
          {t("dashboard.create.submitOffer")}
        </Button>
      </div>
    </div>
  )
}
