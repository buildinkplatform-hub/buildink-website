import type { ReactNode } from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"

export function PortalFormSection({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
}: {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={cn("border-primary/10 overflow-hidden", className)}>
      <div className="border-primary/10 bg-primary/[0.025] flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-foreground text-base font-semibold tracking-[-0.015em]">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <div className={cn("space-y-5 p-4 sm:p-5", contentClassName)}>
        {children}
      </div>
    </Card>
  )
}

export function PortalFormActions({
  children,
  hint,
  sticky = true,
  className,
}: {
  children: ReactNode
  hint?: ReactNode
  sticky?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-primary/10 bg-card/96 supports-[backdrop-filter]:bg-card/92 z-20 flex flex-col-reverse gap-3 rounded-2xl border p-3 shadow-[var(--shadow-sm)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4",
        sticky && "sticky bottom-3",
        className,
      )}
    >
      {hint ? (
        <div className="text-muted-foreground min-w-0 text-xs leading-5 sm:max-w-[58%]">
          {hint}
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  )
}

type AlertTone = "error" | "success" | "warning" | "info"

const alertToneClasses: Record<AlertTone, string> = {
  error: "border-destructive/20 bg-destructive/5 text-destructive",
  success: "border-success/20 bg-success/5 text-success",
  warning: "border-warning/25 bg-warning/8 text-amber-900 dark:text-amber-200",
  info: "border-primary/15 bg-primary/[0.035] text-foreground",
}

export function PortalInlineAlert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: AlertTone
  title?: string
  children: ReactNode
  className?: string
  role?: "alert" | "status"
}) {
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle

  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm",
        alertToneClasses[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && "mt-1", "leading-5")}>{children}</div>
      </div>
    </div>
  )
}

export function PortalOptionRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.035] flex min-h-12 items-center rounded-xl border px-3.5 py-2.5 transition-colors",
        className,
      )}
    >
      {children}
    </div>
  )
}
