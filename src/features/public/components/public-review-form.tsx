"use client"

import { Star } from "lucide-react"
import { useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { submitPublicReviewAction } from "@/features/public/actions/review.actions"
import { localeMetadata, isLocale } from "@/shared/constants/platform"
import { locales, type Locale } from "@/shared/types/platform"

export function PublicReviewForm({
  targetType,
  targetId,
  locale,
  labels,
}: {
  targetType: "COMPANY" | "PROJECT" | "WORKER"
  targetId: string
  locale: Locale
  labels: {
    formTitle: string
    rating: string
    starLabel: string
    titleLabel: string
    comment: string
    locale: string
    submit: string
    success: string
    pendingTitle: string
    pendingBody: string
  }
}) {
  const [rating, setRating] = useState(5)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (done) {
    return (
      <div className="border-primary/15 bg-primary/5 rounded-2xl border p-5">
        <p className="text-brand-navy font-semibold">{labels.pendingTitle}</p>
        <p className="text-muted mt-2 text-sm leading-6">
          {labels.pendingBody}
        </p>
      </div>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        setPending(true)
        setError(null)
        const selectedLocale = String(form.get("locale") ?? locale)
        const result = await submitPublicReviewAction({
          targetType,
          targetId,
          rating,
          title: String(form.get("title") ?? "").trim() || undefined,
          comment: String(form.get("comment") ?? ""),
          locale: isLocale(selectedLocale) ? selectedLocale : locale,
        })
        setPending(false)
        if (result.ok) {
          setDone(true)
          return
        }
        setError(result.message)
      }}
    >
      <h3 className="text-brand-navy text-lg font-bold">{labels.formTitle}</h3>
      <Field label={labels.rating} htmlFor="review-rating" required>
        <div id="review-rating" className="flex gap-1" role="group">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="rounded-lg p-1"
              aria-label={labels.starLabel.replace("{count}", String(value))}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
            >
              <Star
                className={
                  value <= rating
                    ? "fill-primary text-primary size-7"
                    : "size-7 text-slate-300"
                }
              />
            </button>
          ))}
        </div>
      </Field>
      <Field label={labels.titleLabel} htmlFor="review-title">
        <Input id="review-title" name="title" maxLength={200} />
      </Field>
      <Field label={labels.comment} htmlFor="review-comment" required>
        <Textarea
          id="review-comment"
          name="comment"
          required
          minLength={8}
          maxLength={5000}
        />
      </Field>
      <Field label={labels.locale} htmlFor="review-locale">
        <Select name="locale" defaultValue={locale}>
          <SelectTrigger id="review-locale">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((item) => (
              <SelectItem key={item} value={item}>
                {localeMetadata[item].nativeLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {labels.submit}
      </Button>
    </form>
  )
}
