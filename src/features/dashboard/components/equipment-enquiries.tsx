"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createEquipmentEnquiryAction,
  transitionEquipmentEnquiryAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalEquipmentEnquiry } from "@/features/dashboard/data/portal-client"

const transitions = ["NEGOTIATING", "ACCEPTED", "DECLINED", "CLOSED"] as const

export function EquipmentEnquiries({
  submitted,
  received,
  companyId,
}: {
  submitted: PortalEquipmentEnquiry[]
  received: PortalEquipmentEnquiry[]
  companyId?: string
}) {
  const t = useTranslations("dashboard.equipmentEnquiries")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [equipmentId, setEquipmentId] = useState("")
  const [startsOn, setStartsOn] = useState("")
  const [endsOn, setEndsOn] = useState("")
  const [message, setMessage] = useState("")

  async function create() {
    setPending(true)
    const result = await createEquipmentEnquiryAction({
      equipmentId,
      requesterCompanyId: companyId,
      startsOn,
      endsOn,
      message: message || null,
    })
    setPending(false)
    if (result.ok) router.refresh()
  }

  return (
    <section className="border-line space-y-4 rounded-xl border p-4">
      <h2 className="text-brand-navy text-lg font-semibold">{t("title")}</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} placeholder={t("equipmentId")} />
        <Input type="date" aria-label={t("startsOn")} value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
        <Input type="date" aria-label={t("endsOn")} value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
      </div>
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("message")} />
      <Button disabled={pending || !equipmentId || !startsOn || !endsOn} onClick={() => void create()}>{t("send")}</Button>
      {[
        ...received.map((item) => ({ ...item, inbox: "received" as const })),
        ...submitted.map((item) => ({ ...item, inbox: "submitted" as const })),
      ].map((item) => (
        <div key={`${item.inbox}:${item.id}`} className="bg-muted/20 rounded-lg p-3 text-sm">
          <p className="font-semibold">{item.equipment.name}</p>
          <p className="text-muted mt-1">{item.status} · {item.inbox} · {item.startsOn.slice(0, 10)} – {item.endsOn.slice(0, 10)}</p>
          {item.ownerResponse ? <p className="mt-1">{item.ownerResponse}</p> : null}
          {companyId && item.inbox === "received" && !["DECLINED", "CLOSED"].includes(item.status) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {transitions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={status === "ACCEPTED" ? "primary" : "secondary"}
                  disabled={pending}
                  onClick={() => void (async () => {
                    setPending(true)
                    await transitionEquipmentEnquiryAction(companyId, item.id, status, item.version)
                    setPending(false)
                    router.refresh()
                  })()}
                >
                  {status}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  )
}
