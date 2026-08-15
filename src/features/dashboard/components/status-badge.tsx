import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger"

const toneClass: Record<StatusTone, string> = {
  neutral: "border-line bg-canvas text-muted",
  info: "border-primary/15 bg-light-blue text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
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
  SUSPENDED: "warning",
  ON_HOLD: "warning",
  CLOSING_SOON: "warning",
  REJECTED: "danger",
  BLOCKED: "danger",
  FAILED: "danger",
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
  SUBMITTED: "info",
  INVITED: "info",
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

/**
 * Renders a lifecycle status. `label` is expected to already be localised; the
 * raw status is only used to pick the tone.
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
  return (
    <Badge className={cn(toneClass[statusTone(status)], className)}>
      {label ?? status}
    </Badge>
  )
}
