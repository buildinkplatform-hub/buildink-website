import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-primary/15 bg-light-blue text-brand-navy rounded-2xl border p-4 text-sm",
        className,
      )}
      {...props}
    />
  )
}
