"use client"

import { LayoutGrid } from "lucide-react"

import { Link, useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface TabItem {
  value: string
  label: string
  href?: string
  active?: boolean
  badge?: string | number
}

export function TabsNav({
  items,
  className,
}: {
  items: TabItem[]
  className?: string
}) {
  const router = useRouter()
  const active = items.find((item) => item.active) ?? items[0]

  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        "border-border/70 bg-card/90 rounded-[1.35rem] border p-1.5 shadow-[var(--shadow-sm)] backdrop-blur",
        className,
      )}
    >
      <div className="md:hidden">
        <div className="text-muted-foreground mb-1.5 flex items-center gap-2 px-2 text-[11px] font-semibold tracking-[0.07em] uppercase">
          <LayoutGrid className="text-primary size-3.5" />
          Section
        </div>
        <Select
          value={active?.value}
          onValueChange={(value) => {
            const item = items.find((candidate) => candidate.value === value)
            if (item?.href) router.push(item.href)
          }}
        >
          <SelectTrigger className="bg-muted/25 min-h-11 w-full border-0 font-semibold shadow-none">
            <SelectValue placeholder="Choose a section" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.badge !== undefined ? (
                    <span className="bg-primary/8 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="hidden gap-1 md:grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const itemClass = cn(
            "focus-visible:ring-primary/20 relative inline-flex min-h-10 min-w-0 w-full items-center justify-center gap-2 rounded-xl px-3.5 text-center text-sm font-semibold transition-[color,background-color,box-shadow] outline-none focus-visible:ring-3",
            item.active
              ? "bg-primary text-primary-foreground shadow-[0_6px_16px_rgb(23_107_255/0.22)]"
              : "text-foreground hover:bg-muted/60 hover:text-primary",
          )
          const content = (
            <>
              <span className="truncate">{item.label}</span>
              {item.badge !== undefined ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    item.active
                      ? "bg-white/16 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          )

          return item.href ? (
            <Link
              key={item.value}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={itemClass}
            >
              {content}
            </Link>
          ) : (
            <span key={item.value} className={itemClass}>
              {content}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
