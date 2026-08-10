import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export function Alert({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/15 bg-light-blue p-4 text-sm text-brand-navy",
        className,
      )}
      {...props}
    />
  )
}
