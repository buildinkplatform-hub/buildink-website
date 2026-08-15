import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-line/80 shadow-[0_1px_2px_rgba(16,24,40,0.03)]",
        className,
      )}
      {...props}
    />
  )
}
