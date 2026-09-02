import type * as React from "react"

import { cn } from "@/lib/utils/cn"

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="portal-scrollbar w-full overflow-x-auto overscroll-x-contain">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "border-border/70 border-b bg-slate-50/80 dark:bg-white/[0.025] [&_tr]:border-b",
        className,
      )}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-border/60 dark:data-[state=selected]:bg-primary/10 border-b transition-colors hover:bg-slate-50/70 data-[state=selected]:bg-blue-50 dark:hover:bg-white/[0.035]",
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "text-muted-foreground h-11 px-4 text-start align-middle text-xs font-semibold whitespace-nowrap",
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />
}
