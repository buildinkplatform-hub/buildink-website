import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Inbox,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OperationsTablePreferences } from "@/features/dashboard/components/operations-table-preferences"
import { cn } from "@/lib/utils/cn"

export function OperationsMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "navy",
  trend,
}: {
  label: string
  value: string | number
  detail?: string
  icon: LucideIcon
  tone?: "navy" | "blue" | "green" | "amber" | "red"
  trend?: { value: string; favorable: boolean }
}) {
  const tones = {
    navy: "bg-foreground/5 text-foreground",
    blue: "bg-primary/10 text-primary",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
  }
  return (
    <Card className="group hover:border-primary/20 rounded-[24px] p-5 shadow-sm transition-[box-shadow,border-color] hover:shadow-md motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
            {label}
          </p>
          <p className="text-foreground mt-2 text-2xl font-bold tabular-nums">
            {value}
          </p>
          {detail ? (
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {detail}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl",
            tones[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {trend ? (
        <p
          className={cn(
            "mt-4 flex items-center gap-1 text-xs font-semibold",
            trend.favorable
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400",
          )}
        >
          {trend.favorable ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {trend.value}
        </p>
      ) : null}
    </Card>
  )
}

export function OperationsStatusBadge({ status }: { status: string }) {
  const t = useTranslations("operations.status")
  const normalized = status.toUpperCase()
  const tone = [
    "APPROVED",
    "COMPLETED",
    "RESOLVED",
    "CLOSED",
    "ACTIVE",
    "HIRED",
  ].includes(normalized)
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    : ["REJECTED", "VOIDED", "CRITICAL", "CANCELLED", "INACTIVE"].includes(
          normalized,
        )
      ? "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400"
      : [
            "SUBMITTED",
            "OPERATIONALLY_APPROVED",
            "REVIEW",
            "WARNING",
            "BLOCKED",
            "REOPENED",
            "INTERVIEW",
          ].includes(normalized)
        ? "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
        : "border-primary/20 bg-primary/10 text-primary"
  return (
    <Badge className={cn("min-h-7 px-2.5 font-semibold", tone)}>
      {t.has(normalized) ? t(normalized) : labelize(status)}
    </Badge>
  )
}

export function OperationsDataTable({
  columns,
  rows,
  empty = "No operational records match this view.",
  companyId,
  resource,
}: {
  columns: Array<{
    key: string
    label: string
    render?: (row: Record<string, unknown>) => React.ReactNode
    className?: string
  }>
  rows: Array<Record<string, unknown>>
  empty?: string
  companyId?: string
  resource?: string
}) {
  if (!rows.length)
    return (
      <OperationsEmptyState
        title={empty}
        description="Try adjusting the current filters or create the first record for this workflow."
      />
    )

  return (
    <OperationsTablePreferences
      companyId={companyId}
      resource={resource}
      columns={columns}
    >
      <Card className="overflow-hidden rounded-[24px] shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <Table className="min-w-[840px]">
            <TableHeader className="bg-muted/35">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    data-column={column.key}
                    className={cn(
                      "text-muted-foreground h-11 text-xs font-semibold",
                      column.className,
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={String(row.id ?? index)}
                  className="hover:bg-muted/25 transition-colors motion-reduce:transition-none"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      data-column={column.key}
                      className={cn("py-3.5 align-middle", column.className)}
                    >
                      {column.render
                        ? column.render(row)
                        : display(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {rows.map((row, index) => (
            <article
              key={String(row.id ?? index)}
              className="bg-muted/20 overflow-hidden rounded-2xl border"
            >
              {columns.map((column, columnIndex) => (
                <div
                  key={column.key}
                  data-column={column.key}
                  className={cn(
                    "flex items-start justify-between gap-4 px-4 py-3",
                    columnIndex !== columns.length - 1 && "border-b",
                  )}
                >
                  <span className="text-muted-foreground min-w-24 text-xs font-semibold">
                    {column.label}
                  </span>
                  <div className="text-foreground min-w-0 flex-1 text-end text-sm font-medium">
                    {column.render
                      ? column.render(row)
                      : display(row[column.key])}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </Card>
    </OperationsTablePreferences>
  )
}

export function OperationsEmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <Card className="bg-muted/10 grid min-h-60 place-items-center rounded-[24px] border-dashed p-8 text-center shadow-none">
      <div className="max-w-md">
        <span className="bg-muted text-muted-foreground mx-auto grid size-12 place-items-center rounded-2xl">
          <Inbox className="size-6" aria-hidden="true" />
        </span>
        <h3 className="text-foreground mt-4 font-semibold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-1.5 text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
    </Card>
  )
}

export function OperationsAlertCard({
  title,
  message,
  severity,
  status,
}: {
  title: string
  message: string
  severity: string
  status: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-s-4 p-4 shadow-none",
        severity === "CRITICAL"
          ? "border-s-red-500"
          : severity === "WARNING"
            ? "border-s-amber-500"
            : "border-s-primary",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
            severity === "CRITICAL"
              ? "bg-red-500/10 text-red-700 dark:text-red-400"
              : severity === "WARNING"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "bg-primary/10 text-primary",
          )}
        >
          <AlertTriangle className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-foreground font-semibold">{title}</h3>
            <OperationsStatusBadge status={status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {message}
          </p>
        </div>
      </div>
    </Card>
  )
}

export function labelize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (Array.isArray(value)) return value.join(", ") || "—"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
