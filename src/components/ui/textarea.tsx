import type { TextareaHTMLAttributes } from "react"
import { forwardRef } from "react"

import { cn } from "@/lib/utils/cn"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-line text-ink placeholder:text-muted/65 focus:border-primary focus:ring-primary/20 min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3 text-base transition outline-none focus:ring-3",
      className,
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"
