"use client"

import { Check } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils/cn"

function Checkbox({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <span className="relative mt-0.5 inline-flex size-5 shrink-0">
      <input
        type="checkbox"
        className={cn(
          "peer border-line checked:border-primary checked:bg-primary focus-visible:ring-primary/25 aria-invalid:border-danger size-5 cursor-pointer appearance-none rounded-md border bg-white shadow-sm transition-all outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto size-3.5 scale-75 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
        strokeWidth={3}
      />
    </span>
  )
}

export { Checkbox }
