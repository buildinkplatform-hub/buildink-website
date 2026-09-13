"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "lucide-react"
import { useRouter } from "@/i18n/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { CommandMultiSelect } from "@/features/dashboard/components/command-multi-select"
import {
  createProductionEntryAction,
  createMaterialAction,
  createMaterialTransactionAction,
  createMaterialTransferAction,
  createEquipmentResourceAction,
  createEquipmentUsageAction,
  createProjectCostAction,
  createProjectForecastAction,
  createProjectSiteAction,
  createSalAction,
  createWorkTaskAction,
} from "@/features/dashboard/actions/operations.actions"

type Kind =
  | "sites"
  | "tasks"
  | "production"
  | "costs"
  | "forecast"
  | "sal"
  | "materials"
  | "material-usage"
  | "material-transfer"
  | "equipment"
  | "equipment-usage"

export function OperationsCreatePanel({
  companyId,
  projectId,
  kind,
  tasks = [],
  workers = [],
  crews = [],
  materials = [],
  equipment = [],
  sites = [],
}: {
  companyId: string
  projectId: string
  kind: Kind
  tasks?: Array<{ id: string; title: string }>
  workers?: Array<{ id: string; label: string; role: string }>
  crews?: Array<{ id: string; name: string }>
  materials?: Array<{ id: string; name: string }>
  equipment?: Array<{ id: string; name: string }>
  sites?: Array<{ id: string; name: string }>
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const router = useRouter()
  const t = useTranslations("operations.create")

  function submit(formData: FormData) {
    setMessage(undefined)
    startTransition(async () => {
      const raw = Object.fromEntries(formData.entries())
      let result
      if (kind === "sites")
        result = await createProjectSiteAction(companyId, projectId, {
          name: raw.name,
          code: raw.code,
          timezone: raw.timezone || "Europe/Rome",
          address: raw.address || null,
          latitude: raw.latitude || null,
          longitude: raw.longitude || null,
          geofenceRadiusMeters: raw.geofenceRadiusMeters || 150,
          attendancePin: raw.attendancePin || undefined,
          qrSecret: raw.qrSecret || undefined,
        })
      else if (kind === "tasks")
        result = await createWorkTaskAction(companyId, projectId, {
          title: raw.title,
          description: raw.description || null,
          crewId: raw.crewId || null,
          workerIds: formData.getAll("workerIds"),
          unit: raw.unit || null,
          plannedQuantity: raw.plannedQuantity || null,
          plannedMinutes: raw.plannedMinutes || null,
          startsOn: raw.startsOn || null,
          dueOn: raw.dueOn || null,
          priority: raw.priority || 2,
          status: "READY",
        })
      else if (kind === "production")
        result = await createProductionEntryAction(companyId, projectId, {
          taskId: raw.taskId,
          workDate: raw.workDate,
          completedQuantity: raw.completedQuantity || 0,
          acceptedQuantity: raw.acceptedQuantity || 0,
          rejectedQuantity: raw.rejectedQuantity || 0,
          labourMinutes: raw.labourMinutes || 0,
          reworkQuantity: raw.reworkQuantity || 0,
          wasteQuantity: raw.wasteQuantity || 0,
          notes: raw.notes || null,
          status: "SUBMITTED",
          idempotencyKey: crypto.randomUUID(),
        })
      else if (kind === "costs")
        result = await createProjectCostAction(companyId, projectId, {
          category: raw.category,
          sourceType: "MANUAL",
          description: raw.description,
          amountMinor: Math.round(Number(raw.amount) * 100),
          currency: raw.currency || "EUR",
          committed: raw.committed === "true",
          occurredOn: raw.occurredOn,
          status: "SUBMITTED",
        })
      else if (kind === "forecast")
        result = await createProjectForecastAction(companyId, projectId, {
          asOfDate: raw.asOfDate,
          estimateToCompleteMinor: Math.round(
            Number(raw.estimateToComplete) * 100,
          ),
          overrideReason: raw.overrideReason || null,
        })
      else if (kind === "materials")
        result = await createMaterialAction(companyId, projectId, {
          code: raw.code,
          name: raw.name,
          unit: raw.unit,
          standardCostMinor: raw.standardCost
            ? Math.round(Number(raw.standardCost) * 100)
            : null,
          currency: raw.currency || "EUR",
        })
      else if (kind === "material-usage")
        result = await createMaterialTransactionAction(companyId, projectId, {
          siteId: raw.siteId,
          materialId: raw.materialId,
          transactionType: raw.transactionType,
          quantity: raw.quantity,
          unitCostMinor: raw.unitCost
            ? Math.round(Number(raw.unitCost) * 100)
            : undefined,
          occurredOn: raw.occurredOn,
          currency: raw.currency || "EUR",
          status: "SUBMITTED",
          idempotencyKey: crypto.randomUUID(),
        })
      else if (kind === "material-transfer")
        result = await createMaterialTransferAction(companyId, projectId, {
          fromSiteId: raw.fromSiteId,
          toSiteId: raw.toSiteId,
          materialId: raw.materialId,
          quantity: raw.quantity,
          occurredOn: raw.occurredOn,
          idempotencyKey: crypto.randomUUID(),
        })
      else if (kind === "equipment")
        result = await createEquipmentResourceAction(companyId, projectId, {
          name: raw.name,
          ownership: raw.ownership,
          rateMinor: Math.round(Number(raw.rate) * 100),
          rateUnit: raw.rateUnit,
          currency: raw.currency || "EUR",
          siteId: raw.siteId || null,
        })
      else if (kind === "equipment-usage")
        result = await createEquipmentUsageAction(companyId, projectId, {
          resourceId: raw.resourceId,
          siteId: raw.siteId || null,
          usageMinutes: raw.usageMinutes,
          downtimeMinutes: raw.downtimeMinutes || 0,
          fuelQuantity: raw.fuelQuantity || null,
          fuelUnit: raw.fuelUnit || null,
          mobilizationMinor: Math.round(Number(raw.mobilization || 0) * 100),
          occurredOn: raw.occurredOn,
          status: "SUBMITTED",
          idempotencyKey: crypto.randomUUID(),
        })
      else
        result = await createSalAction(companyId, projectId, {
          periodStart: raw.periodStart,
          periodEnd: raw.periodEnd,
          grossMinor: Math.round(Number(raw.gross) * 100),
          retentionMinor: Math.round(Number(raw.retention || 0) * 100),
          currency: raw.currency || "EUR",
        })
      if (!result.ok) setMessage(result.message)
      else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("addRecord", { record: t(`kinds.${kind}`) })}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <div className="border-line sticky top-0 z-10 border-b bg-white px-6 py-5">
          <p className="text-primary mb-1 text-xs font-bold tracking-[0.12em] uppercase">
            {t("projectOperations")}
          </p>
          <SheetHeader title={t("addRecord", { record: t(`kinds.${kind}`) })}>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </SheetHeader>
        </div>
        <form action={submit} className="space-y-5 p-6">
          <Card className="space-y-4 rounded-2xl p-5 shadow-none">
            <Fields
              kind={kind}
              tasks={tasks}
              workers={workers}
              crews={crews}
              materials={materials}
              equipment={equipment}
              sites={sites}
            />
          </Card>
          {message ? (
            <p className="text-danger text-sm" role="alert">
              {message}
            </p>
          ) : null}
          <div className="border-line sticky bottom-0 flex justify-end gap-2 border-t bg-white py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button disabled={pending}>
              {pending ? t("saving") : t("saveRecord")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Fields({
  kind,
  tasks,
  workers,
  crews,
  materials,
  equipment,
  sites,
}: {
  kind: Kind
  tasks: Array<{ id: string; title: string }>
  workers: Array<{ id: string; label: string; role: string }>
  crews: Array<{ id: string; name: string }>
  materials: Array<{ id: string; name: string }>
  equipment: Array<{ id: string; name: string }>
  sites: Array<{ id: string; name: string }>
}) {
  const t = useTranslations("operations.create")
  if (kind === "sites")
    return (
      <>
        <Field name="name" label={t("fields.siteName")} required />
        <Field name="code" label={t("fields.siteCode")} required />
        <Field name="address" label={t("fields.address")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="latitude" label={t("fields.latitude")} type="number" step="any" />
          <Field name="longitude" label={t("fields.longitude")} type="number" step="any" />
          <Field
            name="geofenceRadiusMeters"
            label={t("fields.geofenceRadius")}
            type="number"
            defaultValue="150"
          />
          <Field name="timezone" label={t("fields.timezone")} defaultValue="Europe/Rome" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="attendancePin" label={t("fields.attendancePin")} type="password" />
          <Field name="qrSecret" label={t("fields.qrSecret")} type="password" />
        </div>
      </>
    )
  if (kind === "tasks")
    return (
      <>
        <Field name="title" label={t("fields.taskTitle")} required />
        <TextField name="description" label={t("fields.description")} />
        <label className="grid gap-1.5 text-sm font-semibold">
          {t("fields.crew")}
          <Select name="crewId">
            <SelectTrigger>
              <SelectValue placeholder={t("noCrew")} />
            </SelectTrigger>
            <SelectContent>
              {crews.map((crew) => (
                <SelectItem key={crew.id} value={crew.id}>
                  {crew.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <CommandMultiSelect
          name="workerIds"
          label={t("fields.assignedWorkers")}
          options={workers.map((worker) => ({
            id: worker.id,
            label: worker.label,
            detail: label(worker.role),
          }))}
          empty={t("noEligibleWorkers")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="unit" label={t("fields.unit")} />
          <Field
            name="plannedQuantity"
            label={t("fields.plannedQuantity")}
            type="number"
            step="0.001"
          />
          <Field name="plannedMinutes" label={t("fields.plannedMinutes")} type="number" />
          <Field
            name="priority"
            label={t("fields.priority")}
            type="number"
            defaultValue="2"
          />
          <Field name="startsOn" label={t("fields.startDate")} type="date" />
          <Field name="dueOn" label={t("fields.dueDate")} type="date" />
        </div>
      </>
    )
  if (kind === "production")
    return (
      <>
        <label className="grid gap-1.5 text-sm font-semibold">
          {t("fields.task")}
          <Select name="taskId" required>
            <SelectTrigger>
              <SelectValue placeholder={t("selectTask")} />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="workDate" label={t("fields.workDate")} type="date" required />
          <Field
            name="completedQuantity"
            label={t("fields.completedQuantity")}
            type="number"
            step="0.001"
            required
          />
          <Field
            name="acceptedQuantity"
            label={t("fields.acceptedQuantity")}
            type="number"
            step="0.001"
          />
          <Field
            name="rejectedQuantity"
            label={t("fields.rejectedQuantity")}
            type="number"
            step="0.001"
          />
          <Field name="labourMinutes" label={t("fields.labourMinutes")} type="number" />
          <Field
            name="reworkQuantity"
            label={t("fields.reworkQuantity")}
            type="number"
            step="0.001"
          />
          <Field
            name="wasteQuantity"
            label={t("fields.wasteQuantity")}
            type="number"
            step="0.001"
          />
        </div>
        <TextField name="notes" label={t("fields.notes")} />
      </>
    )
  if (kind === "costs")
    return (
      <>
        <label className="grid gap-1.5 text-sm font-semibold">
          {t("fields.category")}
          <Select name="category" defaultValue="LABOUR">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "LABOUR",
                "MATERIAL",
                "EQUIPMENT",
                "SUBCONTRACT",
                "DIRECT",
                "REWORK",
                "WASTE",
              ].map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`options.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Field name="description" label={t("fields.description")} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="amount"
            label={t("fields.amount")}
            type="number"
            step="0.01"
            required
          />
          <Field name="currency" label={t("fields.currency")} defaultValue="EUR" />
          <Field name="occurredOn" label={t("fields.occurredOn")} type="date" required />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="committed"
            value="true"
            className="size-4"
          />
          {t("fields.committedCost")}
        </label>
      </>
    )
  if (kind === "materials")
    return (
      <>
        <Field name="code" label={t("fields.materialCode")} required />
        <Field name="name" label={t("fields.materialName")} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="unit" label={t("fields.unit")} required />
          <Field
            name="standardCost"
            label={t("fields.standardUnitCost")}
            type="number"
            step="0.01"
          />
          <Field name="currency" label={t("fields.currency")} defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "material-usage")
    return (
      <>
        <OptionSelect name="materialId" label={t("fields.material")} options={materials} />
        <OptionSelect name="siteId" label={t("fields.site")} options={sites} />
        <label className="grid gap-1.5 text-sm font-semibold">
          {t("fields.transactionType")}
          <Select name="transactionType" defaultValue="CONSUMPTION">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "RECEIPT",
                "CONSUMPTION",
                "RETURN",
                "WASTE",
                "ADJUSTMENT_IN",
                "ADJUSTMENT_OUT",
              ].map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`options.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="quantity"
            label={t("fields.quantity")}
            type="number"
            step="0.001"
            required
          />
          <Field
            name="unitCost"
            label={t("fields.unitCostReceipts")}
            type="number"
            step="0.01"
          />
          <Field name="occurredOn" label={t("fields.date")} type="date" required />
          <Field name="currency" label={t("fields.currency")} defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "material-transfer")
    return (
      <>
        <OptionSelect name="materialId" label={t("fields.material")} options={materials} />
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionSelect name="fromSiteId" label={t("fields.fromSite")} options={sites} />
          <OptionSelect name="toSiteId" label={t("fields.toSite")} options={sites} />
          <Field
            name="quantity"
            label={t("fields.quantity")}
            type="number"
            step="0.001"
            required
          />
          <Field name="occurredOn" label={t("fields.date")} type="date" required />
        </div>
      </>
    )
  if (kind === "equipment")
    return (
      <>
        <Field name="name" label={t("fields.equipmentName")} required />
        <OptionSelect name="siteId" label={t("fields.site")} options={sites} optional />
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionSelect
            name="ownership"
            label={t("fields.ownership")}
            options={[
              { id: "OWNED", name: t("options.OWNED") },
              { id: "HIRED", name: t("options.HIRED") },
            ]}
          />
          <OptionSelect
            name="rateUnit"
            label={t("fields.rateUnit")}
            options={["HOUR", "DAY", "WEEK", "FIXED"].map((id) => ({
              id,
              name: t(`options.${id}`),
            }))}
          />
          <Field name="rate" label={t("fields.rate")} type="number" step="0.01" required />
          <Field name="currency" label={t("fields.currency")} defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "equipment-usage")
    return (
      <>
        <OptionSelect name="resourceId" label={t("fields.equipment")} options={equipment} />
        <OptionSelect name="siteId" label={t("fields.site")} options={sites} optional />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="usageMinutes"
            label={t("fields.usageMinutes")}
            type="number"
            required
          />
          <Field
            name="downtimeMinutes"
            label={t("fields.downtimeMinutes")}
            type="number"
            defaultValue="0"
          />
          <Field
            name="fuelQuantity"
            label={t("fields.fuelQuantity")}
            type="number"
            step="0.001"
          />
          <Field name="fuelUnit" label={t("fields.fuelUnit")} />
          <Field
            name="mobilization"
            label={t("fields.mobilizationCost")}
            type="number"
            step="0.01"
          />
          <Field name="occurredOn" label={t("fields.date")} type="date" required />
        </div>
      </>
    )
  if (kind === "forecast")
    return (
      <>
        <Field name="asOfDate" label={t("fields.forecastDate")} type="date" required />
        <Field
          name="estimateToComplete"
          label={t("fields.estimateToComplete")}
          type="number"
          step="0.01"
          required
        />
        <TextField name="overrideReason" label={t("fields.overrideReason")} />
      </>
    )
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="periodStart" label={t("fields.periodStart")} type="date" required />
        <Field name="periodEnd" label={t("fields.periodEnd")} type="date" required />
        <Field
          name="gross"
          label={t("fields.grossProgressValue")}
          type="number"
          step="0.01"
          required
        />
        <Field name="retention" label={t("fields.retention")} type="number" step="0.01" />
        <Field name="currency" label={t("fields.currency")} defaultValue="EUR" />
      </div>
    </>
  )
}

function Field({
  label: fieldLabel,
  ...props
}: React.ComponentProps<typeof Input> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {fieldLabel}
      <Input {...props} />
    </label>
  )
}
function TextField({
  label: fieldLabel,
  ...props
}: React.ComponentProps<typeof Textarea> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {fieldLabel}
      <Textarea {...props} />
    </label>
  )
}
function OptionSelect({
  name,
  label: fieldLabel,
  options,
  optional = false,
}: {
  name: string
  label: string
  options: Array<{ id: string; name: string }>
  optional?: boolean
}) {
  const t = useTranslations("operations.create")
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {fieldLabel}
      <Select name={name} required={!optional}>
        <SelectTrigger>
          <SelectValue placeholder={t("selectPlaceholder", { field: fieldLabel.toLowerCase() })} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
