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
    navy: "border-brand-navy/8 bg-brand-navy/6 text-brand-navy",
    blue: "border-primary/10 bg-primary/8 text-primary",
    green: "border-success/15 bg-success/8 text-success",
    amber: "border-warning/15 bg-warning/8 text-[#B54708] dark:text-warning",
    red: "border-danger/15 bg-danger/8 text-danger",
  }
  return (
    <Card className="group hover:border-primary/15 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] motion-reduce:hover:translate-y-0">
      <div className="flex min-h-[108px] items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.01em]">
            {label}
          </p>
          <p className="text-brand-navy mt-1.5 text-[1.65rem] leading-8 font-bold tracking-[-0.03em] tabular-nums">
            {value}
          </p>
          {detail ? (
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {detail}
            </p>
          ) : null}
          {trend ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-semibold",
                trend.favorable ? "text-success" : "text-danger",
              )}
            >
              {trend.favorable ? (
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3.5" aria-hidden="true" />
              )}
              {trend.value}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl border",
            tones[tone],
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
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
    ? "border-success/20 bg-success/10 text-success"
    : ["REJECTED", "VOIDED", "CRITICAL", "CANCELLED", "INACTIVE"].includes(
          normalized,
        )
      ? "border-danger/20 bg-danger/10 text-danger"
      : [
            "SUBMITTED",
            "OPERATIONALLY_APPROVED",
            "REVIEW",
            "WARNING",
            "BLOCKED",
            "REOPENED",
            "INTERVIEW",
          ].includes(normalized)
        ? "border-warning/20 bg-warning/10 text-[#B54708] dark:text-warning"
        : "border-primary/15 bg-primary/8 text-primary"
  return (
    <Badge
      className={cn(
        "min-h-0 gap-1 px-2.5 py-1 text-[11px] leading-4 font-semibold",
        tone,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current opacity-70"
      />
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
      <Card className="overflow-hidden">
        <div className="hidden md:block">
          <Table className="min-w-[840px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    data-column={column.key}
                    className={cn(column.className)}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={String(row.id ?? index)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      data-column={column.key}
                      className={cn("align-middle", column.className)}
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
              className="border-border/90 bg-card overflow-hidden rounded-xl border"
            >
              {columns.map((column, columnIndex) => (
                <div
                  key={column.key}
                  data-column={column.key}
                  className={cn(
                    "flex items-start justify-between gap-4 px-4 py-3",
                    columnIndex !== columns.length - 1 &&
                      "border-border/70 border-b",
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
    <Card className="grid min-h-56 place-items-center border-dashed p-8 text-center shadow-none">
      <div className="max-w-md">
        <span className="border-primary/10 bg-primary/8 text-primary mx-auto grid size-11 place-items-center rounded-xl border">
          <Inbox className="size-5" aria-hidden="true" />
        </span>
        <h3 className="text-foreground mt-4 font-semibold tracking-[-0.01em]">
          {title}
        </h3>
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
        "border-s-4 p-4 shadow-none",
        severity === "CRITICAL"
          ? "border-s-danger"
          : severity === "WARNING"
            ? "border-s-warning"
            : "border-s-primary",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
            severity === "CRITICAL"
              ? "bg-danger/10 text-danger"
              : severity === "WARNING"
                ? "bg-warning/10 dark:text-warning text-[#B54708]"
                : "bg-primary/8 text-primary",
          )}
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
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
