import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

const primaryClasses =
  "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(23,107,255,0.22)] hover:-translate-y-0.5 hover:bg-deep-navy hover:shadow-[0_16px_32px_rgba(11,36,80,0.20)]"
const secondaryClasses =
  "border border-line/85 bg-card text-foreground shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-sm)]"
const dangerClasses =
  "border border-destructive bg-destructive text-destructive-foreground shadow-[0_10px_24px_color-mix(in_srgb,var(--destructive)_18%,transparent)] hover:-translate-y-0.5 hover:bg-destructive/90"

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: primaryClasses,
        default: primaryClasses,
        secondary: secondaryClasses,
        outline: secondaryClasses,
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        dark: "bg-brand-navy text-white shadow-[0_10px_24px_rgba(7,26,51,0.18)] hover:-translate-y-0.5 hover:bg-primary",
        danger: dangerClasses,
        destructive: dangerClasses,
        link: "min-h-0 rounded-none px-0 text-primary underline-offset-4 shadow-none hover:text-primary/80 hover:underline",
      },
      size: {
        default: "min-h-12",
        md: "min-h-11 px-4",
        sm: "min-h-10 px-4",
        lg: "min-h-12 px-6 text-[15px]",
        icon: "size-11 min-h-0 p-0",
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
