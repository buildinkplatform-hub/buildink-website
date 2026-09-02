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
    <header className="relative">
      {breadcrumbs?.length ? (
        <Breadcrumb
          items={breadcrumbs}
          className="text-muted-foreground mb-3 px-0.5 text-xs"
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
        <div className="max-w-4xl min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-primary mb-1.5 text-[11px] font-bold tracking-[0.16em] uppercase sm:text-xs">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "text-brand-navy font-bold tracking-[-0.04em] text-balance break-words",
              compact
                ? "text-[1.65rem] leading-8 sm:text-[1.9rem] sm:leading-9"
                : "text-[29px] leading-[38px] sm:text-[2.15rem] sm:leading-[2.6rem]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6 text-pretty break-words sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end sm:self-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
