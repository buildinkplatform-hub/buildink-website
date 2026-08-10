import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border border-primary/15 bg-light-blue px-3 text-xs font-semibold text-primary",
        className,
      )}
      {...props}
    />
  )
}
