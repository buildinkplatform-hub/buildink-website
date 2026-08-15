import type { ReactNode } from "react"

import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils/cn"

export function PortalPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  eyebrow,
  compact = false,
}: {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  eyebrow?: string
  compact?: boolean
}) {
  return (
    <header>
      {breadcrumbs?.length ? (
        <Breadcrumb
          items={breadcrumbs}
          className="text-muted-foreground mb-3 px-0.5 text-xs"
        />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-primary mb-1 text-[11px] font-bold tracking-[0.18em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "text-brand-950 font-bold tracking-[-0.025em]",
              compact
                ? "text-[1.7rem] leading-[2.1rem] sm:text-[1.95rem]"
                : "text-[28px] leading-[38px] sm:text-3xl",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
