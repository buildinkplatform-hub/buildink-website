"use client"

import { useMemo, useState, useTransition } from "react"
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  commitOperationsImportAction,
  getImportErrorsAction,
  previewOperationsImportAction,
} from "@/features/dashboard/actions/operations-completion.actions"
import { useRouter } from "@/i18n/navigation"

type ImportType =
  | "tasks"
  | "production"
  | "costs"
  | "materials"
  | "material_transactions"
  | "equipment_usage"
  | "labour_rates"
type Batch = {
  id: string
  totalRows: number
  validRows: number
  invalidRows: number
  status: string
  rows: Array<{
    id: string
    rowNumber: number
    payload: Record<string, unknown>
    errors: Array<{ path: string; message: string }>
    valid: boolean
  }>
}

const fields: Record<ImportType, string[]> = {
  tasks: [
    "title",
    "description",
    "siteId",
    "crewId",
    "unit",
    "plannedQuantity",
    "plannedMinutes",
    "startsOn",
    "dueOn",
    "priority",
    "status",
    "workerIds",
  ],
  production: [
    "taskId",
    "siteId",
    "crewId",
    "workDate",
    "completedQuantity",
    "acceptedQuantity",
    "rejectedQuantity",
    "labourMinutes",
    "reworkQuantity",
    "wasteQuantity",
    "notes",
    "status",
  ],
  costs: [
    "siteId",
    "costCodeId",
    "category",
    "sourceType",
    "description",
    "quantity",
    "unit",
    "rateMinor",
    "amountMinor",
    "currency",
    "committed",
    "occurredOn",
    "status",
  ],
  materials: [
    "siteId",
    "costCodeId",
    "code",
    "name",
    "unit",
    "standardCostMinor",
    "currency",
  ],
  material_transactions: [
    "siteId",
    "materialId",
    "costCodeId",
    "taskId",
    "transactionType",
    "quantity",
    "unitCostMinor",
    "occurredOn",
    "currency",
    "status",
    "idempotencyKey",
  ],
  equipment_usage: [
    "siteId",
    "resourceId",
    "taskId",
    "operatorId",
    "usageMinutes",
    "downtimeMinutes",
    "fuelQuantity",
    "fuelUnit",
    "mobilizationMinor",
    "occurredOn",
    "status",
    "idempotencyKey",
  ],
  labour_rates: [
    "workerId",
    "regularRateMinorPerHour",
    "overtimeRateMinorPerHour",
    "currency",
    "effectiveFrom",
    "effectiveTo",
  ],
}

export function OperationsImportDialog({
  companyId,
  projectId,
  defaultType,
}: {
  companyId: string
  projectId: string
  defaultType?: ImportType
}) {
  const t = useTranslations("operations.completion")
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File>()
  const [csv, setCsv] = useState("")
  const [type, setType] = useState<ImportType>(defaultType ?? "tasks")
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [batch, setBatch] = useState<Batch>()
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const headers = useMemo(() => parseHeader(csv), [csv])

  async function chooseFile(selected?: File) {
    setFile(selected)
    setBatch(undefined)
    if (!selected) return setCsv("")
    if (selected.size > 2_000_000) return toast.error(t("fileTooLarge"))
    const text = await selected.text()
    setCsv(text)
    const next = Object.fromEntries(
      parseHeader(text).map((header) => [
        header,
        fields[type].includes(header) ? header : "ignore",
      ]),
    )
    setMapping(next)
  }

  function preview() {
    if (!file || !csv) return
    startTransition(async () => {
      const result = await previewOperationsImportAction(companyId, {
        projectId,
        importType: type,
        fileName: file.name,
        csv,
        columnMapping: mapping,
        idempotencyKey: crypto.randomUUID(),
      })
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      setBatch(result.batch as Batch)
    })
  }

  function commit() {
    if (!batch) return
    startTransition(async () => {
      const result = await commitOperationsImportAction(companyId, batch.id)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(t("recordsImported", { count: batch.validRows }))
      setOpen(false)
      router.refresh()
    })
  }

  async function downloadErrors() {
    if (!batch) return
    const result = await getImportErrorsAction(companyId, batch.id)
    downloadBase64(result)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FileSpreadsheet className="size-4" />
          {t("importCsv")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:w-[min(92vw,56rem)] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>{t("importTitle")}</DialogTitle>
          <DialogDescription>{t("importDescription")}</DialogDescription>
        </DialogHeader>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold">
            {t("recordType")}
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as ImportType)
                setBatch(undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(fields).map((value) => (
                  <SelectItem key={value} value={value}>
                    {label(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            {t("csvFile")}
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void chooseFile(event.target.files?.[0])}
            />
          </label>
        </div>
        {headers.length ? (
          <div className="mt-5 rounded-2xl border p-4">
            <h3 className="font-semibold">{t("columnMapping")}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {headers.map((header) => (
                <label
                  key={header}
                  className="grid gap-1 text-xs font-semibold"
                >
                  <span>{header}</span>
                  <Select
                    value={mapping[header] ?? "ignore"}
                    onValueChange={(value) =>
                      setMapping((current) => ({ ...current, [header]: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ignore">
                        {t("ignoreColumn")}
                      </SelectItem>
                      {fields[type].map((field) => (
                        <SelectItem key={field} value={field}>
                          {label(field)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {batch ? (
          <div className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary label={t("totalRows")} value={batch.totalRows} />
              <Summary label={t("valid")} value={batch.validRows} good />
              <Summary
                label={t("invalid")}
                value={batch.invalidRows}
                danger={batch.invalidRows > 0}
              />
            </div>
            <div className="max-h-64 overflow-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th className="p-2 text-start">{t("row")}</th>
                    <th className="p-2 text-start">{t("result")}</th>
                    <th className="p-2 text-start">{t("validation")}</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.rows.slice(0, 100).map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="size-4" />
                            {t("valid")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <AlertTriangle className="size-4" />
                            {t("invalid")}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-xs">
                        {row.errors
                          .map((error) => `${error.path}: ${error.message}`)
                          .join("; ") || t("readyToImport")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {batch.invalidRows ? (
              <Button variant="secondary" onClick={() => void downloadErrors()}>
                <Download className="size-4" />
                {t("downloadErrorCsv")}
              </Button>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          {batch ? (
            <Button
              disabled={
                pending || batch.invalidRows > 0 || batch.validRows === 0
              }
              onClick={commit}
            >
              <Upload className="size-4" />
              {pending
                ? t("committing")
                : t("commitRows", { count: batch.validRows })}
            </Button>
          ) : (
            <Button
              disabled={pending || !file || !headers.length}
              onClick={preview}
            >
              {pending ? t("validating") : t("previewImport")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Summary({
  label: text,
  value,
  good,
  danger,
}: {
  label: string
  value: number
  good?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${good ? "border-emerald-200 bg-emerald-50" : danger ? "border-red-200 bg-red-50" : "bg-slate-50"}`}
    >
      <p className="text-muted text-xs">{text}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}
function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
function parseHeader(csv: string) {
  const first = csv.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? ""
  return (
    first
      .match(/("(?:[^"]|"")*"|[^,]+)/g)
      ?.map((value) => value.replace(/^"|"$/g, "").replaceAll('""', '"').trim())
      .filter(Boolean) ?? []
  )
}
function downloadBase64(file: {
  fileName: string
  mimeType: string
  contentBase64: string
}) {
  const bytes = Uint8Array.from(atob(file.contentBase64), (character) =>
    character.charCodeAt(0),
  )
  const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }))
  const link = document.createElement("a")
  link.href = url
  link.download = file.fileName
  link.click()
  URL.revokeObjectURL(url)
}
