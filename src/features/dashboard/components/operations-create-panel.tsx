"use client"

import { useState, useTransition } from "react"
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
          Add {label(kind)}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <div className="border-line sticky top-0 z-10 border-b bg-white px-6 py-5">
          <p className="text-primary mb-1 text-xs font-bold tracking-[0.12em] uppercase">
            Project operations
          </p>
          <SheetHeader title={`Add ${label(kind)}`}>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Close"
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
              Cancel
            </Button>
            <Button disabled={pending}>
              {pending ? "Saving…" : "Save record"}
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
  if (kind === "sites")
    return (
      <>
        <Field name="name" label="Site name" required />
        <Field name="code" label="Site code" required />
        <Field name="address" label="Address" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="latitude" label="Latitude" type="number" step="any" />
          <Field name="longitude" label="Longitude" type="number" step="any" />
          <Field
            name="geofenceRadiusMeters"
            label="Geofence radius (m)"
            type="number"
            defaultValue="150"
          />
          <Field name="timezone" label="Timezone" defaultValue="Europe/Rome" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="attendancePin" label="Attendance PIN" type="password" />
          <Field name="qrSecret" label="QR secret" type="password" />
        </div>
      </>
    )
  if (kind === "tasks")
    return (
      <>
        <Field name="title" label="Task title" required />
        <TextField name="description" label="Description" />
        <label className="grid gap-1.5 text-sm font-semibold">
          Crew
          <Select name="crewId">
            <SelectTrigger>
              <SelectValue placeholder="No crew" />
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
          label="Assigned workers"
          options={workers.map((worker) => ({
            id: worker.id,
            label: worker.label,
            detail: label(worker.role),
          }))}
          empty="No project-scoped workers are eligible."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="unit" label="Unit" />
          <Field
            name="plannedQuantity"
            label="Planned quantity"
            type="number"
            step="0.001"
          />
          <Field name="plannedMinutes" label="Planned minutes" type="number" />
          <Field
            name="priority"
            label="Priority (1–4)"
            type="number"
            defaultValue="2"
          />
          <Field name="startsOn" label="Start date" type="date" />
          <Field name="dueOn" label="Due date" type="date" />
        </div>
      </>
    )
  if (kind === "production")
    return (
      <>
        <label className="grid gap-1.5 text-sm font-semibold">
          Task
          <Select name="taskId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
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
          <Field name="workDate" label="Work date" type="date" required />
          <Field
            name="completedQuantity"
            label="Completed quantity"
            type="number"
            step="0.001"
            required
          />
          <Field
            name="acceptedQuantity"
            label="Accepted quantity"
            type="number"
            step="0.001"
          />
          <Field
            name="rejectedQuantity"
            label="Rejected quantity"
            type="number"
            step="0.001"
          />
          <Field name="labourMinutes" label="Labour minutes" type="number" />
          <Field
            name="reworkQuantity"
            label="Rework quantity"
            type="number"
            step="0.001"
          />
          <Field
            name="wasteQuantity"
            label="Waste quantity"
            type="number"
            step="0.001"
          />
        </div>
        <TextField name="notes" label="Notes" />
      </>
    )
  if (kind === "costs")
    return (
      <>
        <label className="grid gap-1.5 text-sm font-semibold">
          Category
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
                  {label(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Field name="description" label="Description" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="amount"
            label="Amount"
            type="number"
            step="0.01"
            required
          />
          <Field name="currency" label="Currency" defaultValue="EUR" />
          <Field name="occurredOn" label="Occurred on" type="date" required />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="committed"
            value="true"
            className="size-4"
          />
          Committed cost
        </label>
      </>
    )
  if (kind === "materials")
    return (
      <>
        <Field name="code" label="Material code" required />
        <Field name="name" label="Material name" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="unit" label="Unit" required />
          <Field
            name="standardCost"
            label="Standard unit cost"
            type="number"
            step="0.01"
          />
          <Field name="currency" label="Currency" defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "material-usage")
    return (
      <>
        <OptionSelect name="materialId" label="Material" options={materials} />
        <OptionSelect name="siteId" label="Site" options={sites} />
        <label className="grid gap-1.5 text-sm font-semibold">
          Transaction type
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
                  {label(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="quantity"
            label="Quantity"
            type="number"
            step="0.001"
            required
          />
          <Field
            name="unitCost"
            label="Unit cost (receipts)"
            type="number"
            step="0.01"
          />
          <Field name="occurredOn" label="Date" type="date" required />
          <Field name="currency" label="Currency" defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "material-transfer")
    return (
      <>
        <OptionSelect name="materialId" label="Material" options={materials} />
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionSelect name="fromSiteId" label="From site" options={sites} />
          <OptionSelect name="toSiteId" label="To site" options={sites} />
          <Field
            name="quantity"
            label="Quantity"
            type="number"
            step="0.001"
            required
          />
          <Field name="occurredOn" label="Date" type="date" required />
        </div>
      </>
    )
  if (kind === "equipment")
    return (
      <>
        <Field name="name" label="Equipment name" required />
        <OptionSelect name="siteId" label="Site" options={sites} optional />
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionSelect
            name="ownership"
            label="Ownership"
            options={[
              { id: "OWNED", name: "Owned" },
              { id: "HIRED", name: "Hired" },
            ]}
          />
          <OptionSelect
            name="rateUnit"
            label="Rate unit"
            options={["HOUR", "DAY", "WEEK", "FIXED"].map((id) => ({
              id,
              name: label(id),
            }))}
          />
          <Field name="rate" label="Rate" type="number" step="0.01" required />
          <Field name="currency" label="Currency" defaultValue="EUR" />
        </div>
      </>
    )
  if (kind === "equipment-usage")
    return (
      <>
        <OptionSelect name="resourceId" label="Equipment" options={equipment} />
        <OptionSelect name="siteId" label="Site" options={sites} optional />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="usageMinutes"
            label="Usage minutes"
            type="number"
            required
          />
          <Field
            name="downtimeMinutes"
            label="Downtime minutes"
            type="number"
            defaultValue="0"
          />
          <Field
            name="fuelQuantity"
            label="Fuel quantity"
            type="number"
            step="0.001"
          />
          <Field name="fuelUnit" label="Fuel unit" />
          <Field
            name="mobilization"
            label="Mobilization cost"
            type="number"
            step="0.01"
          />
          <Field name="occurredOn" label="Date" type="date" required />
        </div>
      </>
    )
  if (kind === "forecast")
    return (
      <>
        <Field name="asOfDate" label="Forecast date" type="date" required />
        <Field
          name="estimateToComplete"
          label="Estimate to complete"
          type="number"
          step="0.01"
          required
        />
        <TextField name="overrideReason" label="Override reason" />
      </>
    )
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="periodStart" label="Period start" type="date" required />
        <Field name="periodEnd" label="Period end" type="date" required />
        <Field
          name="gross"
          label="Gross progress value"
          type="number"
          step="0.01"
          required
        />
        <Field name="retention" label="Retention" type="number" step="0.01" />
        <Field name="currency" label="Currency" defaultValue="EUR" />
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
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {fieldLabel}
      <Select name={name} required={!optional}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${fieldLabel.toLowerCase()}`} />
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
