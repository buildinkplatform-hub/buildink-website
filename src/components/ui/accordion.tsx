"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils/cn"

export interface AccordionItemData {
  id: string
  title: string
  content: string
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[]
  className?: string
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div key={item.id} className="border-line overflow-hidden rounded-2xl border bg-white">
            <button
              type="button"
              className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-start"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="text-brand-navy text-base font-semibold">
                {item.title}
              </span>
              <ChevronDown
                className={cn("text-muted size-5 transition-transform", open && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {open ? (
              <div className="text-muted px-5 pb-5 leading-7">{item.content}</div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
