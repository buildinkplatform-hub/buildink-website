"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { BellRing, Check, Settings2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  saveAlertRuleAction,
  transitionAlertAction,
} from "@/features/dashboard/actions/operations-completion.actions"
import { OperationsStatusBadge } from "@/features/dashboard/components/operations-ui"
import { useRouter } from "@/i18n/navigation"

const alertTypes = [
  "MISSING_CHECKOUT",
  "GPS_SAMPLING_GAP",
  "OVERTIME_THRESHOLD",
  "COMPLIANCE_EXPIRY",
  "OVERDUE_PRODUCTION_APPROVAL",
  "LOW_PRODUCTION",
  "PRODUCTIVITY_VARIANCE",
  "MATERIAL_OVERUSE",
  "EQUIPMENT_DOWNTIME",
  "PRODUCTION_REWORK",
  "PROJECT_COST_OVERRUN",
  "MARGIN_EROSION",
  "FORECAST_DETERIORATION",
  "PAYROLL_EXCEPTION",
]

export function AlertRuleAdministration({
  companyId,
  rules,
  alerts,
  canManage,
}: {
  companyId: string
  rules: Array<Record<string, unknown>>
  alerts: Array<Record<string, unknown>>
  canManage: boolean
}) {
  const t = useTranslations("operations.completion")
  const [type, setType] = useState(alertTypes[0]!)
  const [severity, setSeverity] = useState("WARNING")
  const [threshold, setThreshold] = useState("")
  const [escalation, setEscalation] = useState("120")
  const [channels, setChannels] = useState({
    inApp: true,
    email: true,
    push: true,
  })
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  function save() {
    startTransition(async () => {
      try {
        await saveAlertRuleAction(companyId, {
          alertType: type,
          severity,
          threshold: threshold
            ? {
                value: Number(threshold),
                ...thresholdFor(type, Number(threshold)),
              }
            : {},
          recipientRoles: [
            "OWNER",
            "COMPANY_ADMIN",
            "PROJECT_MANAGER",
            "FINANCE",
          ],
          inAppEnabled: channels.inApp,
          emailEnabled: channels.email,
          pushEnabled: channels.push,
          escalationMinutes: Number(escalation),
          enabled: true,
        })
        toast.success(t("alertRuleSaved"))
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("alertRuleSaveFailed"),
        )
      }
    })
  }
  function transition(id: string, status: string) {
    startTransition(async () => {
      try {
        await transitionAlertAction(companyId, id, {
          status,
          resolution: status === "RESOLVED" ? t("alertResolution") : null,
        })
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("alertUpdateFailed"),
        )
      }
    })
  }
  return (
    <div className="space-y-4">
      {canManage ? (
        <Card className="rounded-2xl p-5 shadow-none">
          <div className="flex items-center gap-2">
            <Settings2 className="text-primary size-5" />
            <div>
              <h3 className="text-brand-navy font-semibold">
                {t("alertRulesTitle")}
              </h3>
              <p className="text-muted text-sm">{t("alertRulesDescription")}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((value) => (
                  <SelectItem key={value} value={value}>
                    {label(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["INFO", "WARNING", "CRITICAL"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {label(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              placeholder={t("thresholdOptional")}
            />
            <Input
              type="number"
              min="15"
              value={escalation}
              onChange={(event) => setEscalation(event.target.value)}
              placeholder={t("escalateMinutes")}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {(["inApp", "email", "push"] as const).map((channel) => (
              <label
                key={channel}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Checkbox
                  checked={channels[channel]}
                  onChange={(event) =>
                    setChannels((current) => ({
                      ...current,
                      [channel]: event.target.checked,
                    }))
                  }
                />
                {channel === "inApp" ? t("inApp") : t(channel)}
              </label>
            ))}
          </div>
          <Button className="mt-4" disabled={pending} onClick={save}>
            <BellRing className="size-4" />
            {t("saveRule")}
          </Button>
          <p className="text-muted mt-3 text-xs">
            {t("configuredRules", { count: rules.length })}
          </p>
        </Card>
      ) : null}
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <Card
            key={String(alert.id)}
            className="rounded-2xl border-s-4 border-s-amber-500 p-4 shadow-none"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-brand-navy font-semibold">
                  {String(alert.title)}
                </p>
                <p className="text-muted mt-1 text-sm">
                  {String(alert.message)}
                </p>
                <div className="mt-2 flex gap-2">
                  <OperationsStatusBadge status={String(alert.severity)} />
                  <OperationsStatusBadge status={String(alert.status)} />
                </div>
              </div>
              {canManage ? (
                <div className="flex gap-2">
                  {alert.status === "OPEN" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() =>
                        transition(String(alert.id), "ACKNOWLEDGED")
                      }
                    >
                      <Check className="size-3.5" />
                      {t("acknowledge")}
                    </Button>
                  ) : null}
                  {["OPEN", "ACKNOWLEDGED"].includes(String(alert.status)) ? (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => transition(String(alert.id), "RESOLVED")}
                    >
                      <Check className="size-3.5" />
                      {t("resolve")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
function thresholdFor(type: string, value: number) {
  if (type === "LOW_PRODUCTION") return { minimumPercent: value }
  if (type === "PRODUCTIVITY_VARIANCE") return { maximumVariancePercent: value }
  if (type === "MATERIAL_OVERUSE") return { maximumWasteMinor: value }
  if (type === "MARGIN_EROSION") return { maximumBasisPoints: value }
  return {}
}
