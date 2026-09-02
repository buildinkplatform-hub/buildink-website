"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { AttachmentUpload } from "@/features/dashboard/components/attachment-upload"
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
import {
  createApplicationAction,
  createOfferAction,
  submitApplicationAction,
  submitOfferAction,
  updateApplicationDraftAction,
  updateOfferDraftAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalOfferTarget } from "@/features/dashboard/data/portal-client"

type TenderOfferTarget = {
  id: string
  kind: "tender"
  title: string
  currency?: string | null
}

function eurosToMinor(value: string) {
  const amount = Number(value.replace(",", "."))
  if (!Number.isFinite(amount) || amount < 0) return ""
  return String(Math.round(amount * 100))
}

function DraftStatus({
  status,
}: {
  status: "idle" | "pending" | "saved" | "error"
}) {
  const t = useTranslations()
  if (status === "idle") return null
  return (
    <p className="text-muted text-xs" data-testid="draft-status">
      {t(`dashboard.draft.${status}`)}
    </p>
  )
}

export function OfferCreateForm({
  opportunities,
  packages,
  lots,
  tenders = [],
  initialTarget,
  submitterCompanyId,
}: {
  opportunities: PortalOfferTarget[]
  packages: PortalOfferTarget[]
  lots: PortalOfferTarget[]
  tenders?: TenderOfferTarget[]
  initialTarget?: string
  submitterCompanyId?: string
}) {
  const t = useTranslations()
  const router = useRouter()
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])
  const allTargets = [...tenders, ...opportunities, ...packages, ...lots]
  const initialSelection = allTargets.find(
    (item) => `${item.kind}:${item.id}` === initialTarget,
  )
  const [target, setTarget] = useState(initialSelection ? initialTarget! : "")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState(initialSelection?.currency ?? "EUR")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [scope, setScope] = useState("")
  const [assumptions, setAssumptions] = useState("")
  const [exclusions, setExclusions] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [warrantyTerms, setWarrantyTerms] = useState("")
  const [priceValidUntil, setPriceValidUntil] = useState("")
  const [items, setItems] = useState<
    Array<{
      description: string
      quantity: string
      unit: string
      unitPrice: string
    }>
  >([])
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [draftId, setDraftId] = useState<string>()
  const [version, setVersion] = useState(1)
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "error">(
    "idle",
  )
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState<string>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const selected = allTargets.find(
    (item) => `${item.kind}:${item.id}` === target,
  )
  const skipInitialTargetAutosave = useRef(Boolean(initialSelection))
  const draftIdRef = useRef(draftId)
  const versionRef = useRef(version)
  useEffect(() => {
    draftIdRef.current = draftId
    versionRef.current = version
  }, [draftId, version])

  const payload = useCallback(
    (submit: boolean) => {
      const proposedPriceMinor = eurosToMinor(price)
      const body: Record<string, unknown> = {
        submit,
        currency,
        coverMessage: notes || null,
        scopeDescription: scope || null,
        assumptions: assumptions || null,
        exclusions: exclusions || null,
        paymentTerms: paymentTerms || null,
        warrantyTerms: warrantyTerms || null,
        priceValidUntil: priceValidUntil || null,
        proposedPriceMinor: proposedPriceMinor || null,
        totalPriceMinor: proposedPriceMinor || null,
        proposedDurationDays: duration ? Number(duration) : null,
        attachmentAssetIds: attachments.map((item) => item.id),
        submitterCompanyId,
        items: items
          .filter((item) => item.description.trim())
          .map((item) => {
            const unitPriceMinor = eurosToMinor(item.unitPrice)
            const quantity = item.quantity ? Number(item.quantity) : null
            return {
              description: item.description,
              quantity,
              unit: item.unit || null,
              unitPriceMinor: unitPriceMinor || null,
              totalMinor: unitPriceMinor
                ? String(Math.round(Number(unitPriceMinor) * (quantity ?? 1)))
                : "0",
            }
          }),
      }
      if (selected?.kind === "tender") body.tenderId = selected.id
      if (selected?.kind === "opportunity") body.opportunityId = selected.id
      if (selected?.kind === "package") {
        body.projectId = selected.projectId ?? selected.parentId
        body.projectPackageId = selected.id
      }
      if (selected?.kind === "lot") {
        body.tenderId = selected.tenderId ?? selected.parentId
        body.tenderLotId = selected.id
      }
      return body
    },
    [
      assumptions,
      attachments,
      currency,
      duration,
      exclusions,
      items,
      notes,
      paymentTerms,
      price,
      priceValidUntil,
      scope,
      selected,
      submitterCompanyId,
      warrantyTerms,
    ],
  )

  useEffect(() => {
    if (!selected || submitted) return
    if (skipInitialTargetAutosave.current) {
      skipInitialTargetAutosave.current = false
      return
    }
    window.clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void (async () => {
        setStatus("pending")
        const body = payload(false)
        const currentDraftId = draftIdRef.current
        const result = currentDraftId
          ? await updateOfferDraftAction(
              currentDraftId,
              body,
              versionRef.current,
            )
          : await createOfferAction(body, idempotencyKey)
        if (!result.ok || !("offer" in result) || !result.offer) {
          setStatus("error")
          setMessage(result.ok ? undefined : result.message)
          return
        }
        setDraftId(result.offer.id)
        setVersion(result.offer.version)
        setStatus("saved")
        setMessage(undefined)
      })()
    }, 800)
    return () => window.clearTimeout(timer.current)
  }, [idempotencyKey, payload, selected, submitted])

  async function submit() {
    if (!selected || submitted) return
    setStatus("pending")
    const body = payload(true)
    const created = draftId
      ? await submitOfferAction(draftId, version)
      : await createOfferAction(body, idempotencyKey)
    if (!created.ok) {
      setStatus("error")
      setMessage(created.message)
      return
    }
    setSubmitted(true)
    setStatus("saved")
    setMessage(undefined)
    router.push("/dashboard/offers")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.create.offerTitle")}
      </h2>
      <Field
        label={t("dashboard.create.chooseTarget")}
        htmlFor="offer-target"
        required
      >
        <Select value={target} onValueChange={setTarget} disabled={submitted}>
          <SelectTrigger id="offer-target">
            <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
          </SelectTrigger>
          <SelectContent>
            {tenders.map((item) => (
              <SelectItem key={item.id} value={`tender:${item.id}`}>
                {item.title}
              </SelectItem>
            ))}
            {opportunities.map((item) => (
              <SelectItem key={item.id} value={`opportunity:${item.id}`}>
                {item.title}
              </SelectItem>
            ))}
            {packages.map((item) => (
              <SelectItem key={item.id} value={`package:${item.id}`}>
                {item.parentTitle} · {item.title}
              </SelectItem>
            ))}
            {lots.map((item) => (
              <SelectItem key={item.id} value={`lot:${item.id}`}>
                {item.parentTitle} · {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("dashboard.create.price")} htmlFor="offer-price" required>
        <Input
          id="offer-price"
          inputMode="decimal"
          value={price}
          disabled={submitted}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="1500.00"
        />
      </Field>
      <Field label={t("dashboard.create.currency")} htmlFor="offer-currency">
        <Input
          id="offer-currency"
          value={currency}
          maxLength={3}
          disabled={submitted}
          onChange={(event) => setCurrency(event.target.value.toUpperCase())}
        />
      </Field>
      <Field label={t("dashboard.create.duration")} htmlFor="offer-duration">
        <Input
          id="offer-duration"
          inputMode="numeric"
          value={duration}
          disabled={submitted}
          onChange={(event) => setDuration(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.create.notes")} htmlFor="offer-notes">
        <Textarea
          id="offer-notes"
          value={notes}
          disabled={submitted}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.create.scope")} htmlFor="offer-scope">
        <Textarea
          id="offer-scope"
          value={scope}
          disabled={submitted}
          onChange={(event) => setScope(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("dashboard.create.assumptions")}
          htmlFor="offer-assumptions"
        >
          <Textarea
            id="offer-assumptions"
            value={assumptions}
            disabled={submitted}
            onChange={(event) => setAssumptions(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.create.exclusions")}
          htmlFor="offer-exclusions"
        >
          <Textarea
            id="offer-exclusions"
            value={exclusions}
            disabled={submitted}
            onChange={(event) => setExclusions(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.create.paymentTerms")}
          htmlFor="offer-payment-terms"
        >
          <Textarea
            id="offer-payment-terms"
            value={paymentTerms}
            disabled={submitted}
            onChange={(event) => setPaymentTerms(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.create.warrantyTerms")}
          htmlFor="offer-warranty-terms"
        >
          <Textarea
            id="offer-warranty-terms"
            value={warrantyTerms}
            disabled={submitted}
            onChange={(event) => setWarrantyTerms(event.target.value)}
          />
        </Field>
      </div>
      <Field
        label={t("dashboard.create.priceValidUntil")}
        htmlFor="offer-price-valid-until"
      >
        <Input
          id="offer-price-valid-until"
          type="date"
          value={priceValidUntil}
          disabled={submitted}
          onChange={(event) => setPriceValidUntil(event.target.value)}
        />
      </Field>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-brand-navy font-semibold">
            {t("dashboard.create.lineItems")}
          </h3>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={submitted}
            onClick={() =>
              setItems((current) => [
                ...current,
                { description: "", quantity: "1", unit: "", unitPrice: "" },
              ])
            }
          >
            {t("dashboard.create.addLineItem")}
          </Button>
        </div>
        {items.map((item, index) => (
          <div
            key={index}
            className="border-line grid gap-2 rounded-xl border p-3 sm:grid-cols-4"
          >
            <Input
              aria-label={t("dashboard.create.itemDescription")}
              placeholder={t("dashboard.create.itemDescription")}
              value={item.description}
              disabled={submitted}
              onChange={(event) =>
                setItems((current) =>
                  current.map((entry, itemIndex) =>
                    itemIndex === index
                      ? { ...entry, description: event.target.value }
                      : entry,
                  ),
                )
              }
            />
            <Input
              aria-label={t("dashboard.create.quantity")}
              placeholder={t("dashboard.create.quantity")}
              inputMode="decimal"
              value={item.quantity}
              disabled={submitted}
              onChange={(event) =>
                setItems((current) =>
                  current.map((entry, itemIndex) =>
                    itemIndex === index
                      ? { ...entry, quantity: event.target.value }
                      : entry,
                  ),
                )
              }
            />
            <Input
              aria-label={t("dashboard.create.unit")}
              placeholder={t("dashboard.create.unit")}
              value={item.unit}
              disabled={submitted}
              onChange={(event) =>
                setItems((current) =>
                  current.map((entry, itemIndex) =>
                    itemIndex === index
                      ? { ...entry, unit: event.target.value }
                      : entry,
                  ),
                )
              }
            />
            <div className="flex gap-2">
              <Input
                aria-label={t("dashboard.create.unitPrice")}
                placeholder={t("dashboard.create.unitPrice")}
                inputMode="decimal"
                value={item.unitPrice}
                disabled={submitted}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, itemIndex) =>
                      itemIndex === index
                        ? { ...entry, unitPrice: event.target.value }
                        : entry,
                    ),
                  )
                }
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={submitted}
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label={t("dashboard.create.removeLineItem")}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
      <AttachmentUpload assets={attachments} onChange={setAttachments} />
      <DraftStatus status={status} />
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={!selected || status === "pending" || submitted}
        onClick={() => void submit()}
      >
        {t("dashboard.create.submitOffer")}
      </Button>
    </div>
  )
}

export function ApplicationCreateForm({
  targets,
}: {
  targets: PortalOfferTarget[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])
  const [opportunityId, setOpportunityId] = useState("")
  const [cover, setCover] = useState("")
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [draftId, setDraftId] = useState<string>()
  const [version, setVersion] = useState(1)
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "error">(
    "idle",
  )
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState<string>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const draftIdRef = useRef(draftId)
  const versionRef = useRef(version)
  useEffect(() => {
    draftIdRef.current = draftId
    versionRef.current = version
  }, [draftId, version])

  useEffect(() => {
    if (!opportunityId || submitted) return
    window.clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void (async () => {
        setStatus("pending")
        const body = {
          opportunityId,
          coverMessage: cover || null,
          attachmentAssetIds: attachments.map((item) => item.id),
          submit: false,
        }
        const currentDraftId = draftIdRef.current
        const result = currentDraftId
          ? await updateApplicationDraftAction(
              currentDraftId,
              body,
              versionRef.current,
            )
          : await createApplicationAction(body, idempotencyKey)
        if (!result.ok || !("application" in result) || !result.application) {
          setStatus("error")
          setMessage(result.ok ? undefined : result.message)
          return
        }
        setDraftId(result.application.id)
        setVersion(result.application.version)
        setStatus("saved")
        setMessage(undefined)
      })()
    }, 800)
    return () => window.clearTimeout(timer.current)
  }, [attachments, cover, idempotencyKey, opportunityId, submitted])

  async function submit() {
    if (!opportunityId || submitted) return
    setStatus("pending")
    const created = draftId
      ? await submitApplicationAction(draftId, version)
      : await createApplicationAction(
          {
            opportunityId,
            coverMessage: cover || null,
            attachmentAssetIds: attachments.map((item) => item.id),
            submit: true,
          },
          idempotencyKey,
        )
    if (!created.ok) {
      setStatus("error")
      setMessage(created.message)
      return
    }
    setSubmitted(true)
    setStatus("saved")
    setMessage(undefined)
    router.push("/dashboard/applications")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.create.applicationTitle")}
      </h2>
      <Field
        label={t("dashboard.create.workforceTarget")}
        htmlFor="application-target"
        required
      >
        <Select
          value={opportunityId}
          onValueChange={setOpportunityId}
          disabled={submitted}
        >
          <SelectTrigger id="application-target">
            <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
          </SelectTrigger>
          <SelectContent>
            {targets.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("dashboard.create.cover")} htmlFor="application-cover">
        <Textarea
          id="application-cover"
          value={cover}
          disabled={submitted}
          onChange={(event) => setCover(event.target.value)}
        />
      </Field>
      <AttachmentUpload assets={attachments} onChange={setAttachments} />
      <DraftStatus status={status} />
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={!opportunityId || status === "pending" || submitted}
        onClick={() => void submit()}
      >
        {t("dashboard.create.submitApplication")}
      </Button>
    </div>
  )
}

export function RetryButton({ label }: { label: string }) {
  const router = useRouter()
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => router.refresh()}
    >
      {label}
    </Button>
  )
}
