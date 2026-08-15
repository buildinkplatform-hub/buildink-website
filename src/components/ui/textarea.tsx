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
      "border-line text-ink placeholder:text-muted/65 focus:border-primary/60 focus:ring-primary/12 min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3 text-base transition-[border-color,box-shadow,background-color] outline-none hover:border-line/90 focus:ring-2",
      className,
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"
