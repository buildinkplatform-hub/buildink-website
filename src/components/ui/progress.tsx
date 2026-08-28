import type * as React from "react"

import { cn } from "@/lib/utils/cn"

export function Progress({
  value = 0,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const normalized = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
        style={{ width: `${normalized}%` }}
      />
    </div>
  )
}
