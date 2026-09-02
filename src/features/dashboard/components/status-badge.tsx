import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger"

const toneClass: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-primary/15 bg-primary/8 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-[#B54708] dark:text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
}

const toneByStatus: Record<string, StatusTone> = {
  DRAFT: "neutral",
  ARCHIVED: "neutral",
  UNLISTED: "neutral",
  WITHDRAWN: "neutral",
  EXPIRED: "neutral",
  CANCELLED: "neutral",
  CLOSED: "neutral",
  PENDING: "warning",
  PENDING_REVIEW: "warning",
  UNDER_REVIEW: "warning",
  CHANGES_REQUESTED: "warning",
  ON_HOLD: "warning",
  CLOSING_SOON: "warning",
  REJECTED: "danger",
  BLOCKED: "danger",
  FAILED: "danger",
  SUSPENDED: "danger",
  PUBLISHED: "success",
  APPROVED: "success",
  VERIFIED: "success",
  ACCEPTED: "success",
  HIRED: "success",
  AWARDED: "success",
  COMPLETED: "success",
  ACTIVE: "success",
  OPEN: "info",
  IN_PROGRESS: "info",
  EVALUATION: "info",
  SUBMITTED: "info",
  INVITED: "warning",
  VIEWED: "info",
  INTERESTED: "info",
  SHORTLISTED: "info",
  INTERVIEW: "info",
  OFFERED: "info",
  ISSUED: "info",
}

export function statusTone(status: string): StatusTone {
  return toneByStatus[status.toUpperCase()] ?? "neutral"
}

function humanizeStatus(status: string) {
  const words = status.trim().replaceAll("_", " ").replace(/\s+/g, " ")
  if (!words) return status
  const lower = words.toLocaleLowerCase()
  return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`
}

function isRawStatusLabel(status: string, label?: string) {
  if (!label?.trim()) return true
  const normalizedStatus = status
    .trim()
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .toLocaleUpperCase()
  const normalizedLabel = label.trim().replace(/\s+/g, " ").toLocaleUpperCase()
  return normalizedLabel === normalizedStatus
}

/**
 * Renders a compact lifecycle status. Localised labels are preserved. If a
 * caller only supplies the raw backend enum, fall back to a human-readable
 * label instead of leaking implementation values such as `PENDING_REVIEW`.
 */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const displayLabel = isRawStatusLabel(status, label)
    ? humanizeStatus(status)
    : label

  return (
    <Badge
      className={cn(
        "min-h-0 gap-1 px-2.5 py-1 text-[11px] leading-4 font-semibold",
        toneClass[statusTone(status)],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current opacity-70"
      />
      {displayLabel}
    </Badge>
  )
}
