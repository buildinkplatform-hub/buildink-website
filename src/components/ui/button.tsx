import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_12px_24px_rgba(23,107,255,0.22)] hover:-translate-y-0.5 hover:bg-deep-navy hover:shadow-[0_16px_32px_rgba(11,36,80,0.22)]",
        secondary:
          "border border-line/80 bg-white text-brand-navy shadow-sm hover:border-line hover:bg-accent hover:text-brand-navy",
        ghost:
          "text-muted hover:bg-accent hover:text-brand-navy",
        dark: "bg-brand-navy text-white hover:bg-primary",
      },
      size: {
        default: "min-h-12",
        sm: "min-h-11 px-4",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
)

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export { buttonVariants }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
