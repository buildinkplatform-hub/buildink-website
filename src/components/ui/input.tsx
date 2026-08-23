import type { InputHTMLAttributes } from "react"
import { forwardRef } from "react"

import { cn } from "@/lib/utils/cn"

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "border-line text-ink placeholder:text-muted/65 focus:border-primary/60 focus:ring-primary/12 disabled:bg-canvas h-12 min-h-12 w-full rounded-2xl border bg-white px-4 text-sm transition-[border-color,box-shadow,background-color] outline-none hover:border-line/90 focus:ring-2",
      className,
    )}
    {...props}
  />
))
Input.displayName = "Input"
