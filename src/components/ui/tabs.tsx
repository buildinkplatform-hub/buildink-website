"use client"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export interface TabItem {
  value: string
  label: string
  href?: string
  active?: boolean
}

export function TabsNav({
  items,
  className,
}: {
  items: TabItem[]
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex min-w-max gap-2">
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.value}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                item.active
                  ? "bg-primary text-white"
                  : "border-line bg-white text-brand-navy hover:bg-accent",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.value}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold",
                item.active
                  ? "bg-primary text-white"
                  : "border-line bg-white text-brand-navy",
              )}
            >
              {item.label}
            </span>
          ),
        )}
      </div>
    </div>
  )
}
