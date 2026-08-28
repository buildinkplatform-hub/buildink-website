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
      "border-line bg-card text-ink placeholder:text-muted/65 hover:border-primary/20 focus:border-primary/55 focus:ring-primary/12 disabled:bg-canvas h-12 min-h-12 w-full rounded-xl border px-4 text-sm shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,background-color] outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
      className,
    )}
    {...props}
  />
))
Input.displayName = "Input"
