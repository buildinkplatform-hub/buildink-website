"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils/cn"

export function OpportunityListFilters({
  allTypesLabel,
  kind,
  kinds,
  ownedLabel,
  scope,
  discoverLabel,
}: {
  allTypesLabel: string
  kind?: string
  kinds: Array<{ value: string; label: string }>
  ownedLabel: string
  scope: "owned" | "discover"
  discoverLabel: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function update(updates: { kind?: string; scope?: "owned" | "discover" }) {
    const next = new URLSearchParams(searchParams.toString())
    if (updates.scope) {
      if (updates.scope === "owned") next.delete("scope")
      else next.set("scope", updates.scope)
    }
    if (updates.kind === undefined || updates.kind === "all")
      next.delete("kind")
    else next.set("kind", updates.kind)
    next.delete("page")
    const suffix = next.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="border-line inline-flex w-fit rounded-xl border bg-white p-1 shadow-sm">
        <button
          type="button"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            scope === "owned"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-brand-navy hover:bg-slate-50",
          )}
          onClick={() => update({ scope: "owned", kind })}
        >
          {ownedLabel}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            scope === "discover"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-brand-navy hover:bg-slate-50",
          )}
          onClick={() => update({ scope: "discover", kind })}
        >
          {discoverLabel}
        </button>
      </div>
      <Select
        value={kind ?? "all"}
        onValueChange={(value) => update({ kind: value })}
      >
        <SelectTrigger
          aria-label={allTypesLabel}
          className="w-full bg-white sm:w-64"
        >
          <SelectValue placeholder={allTypesLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allTypesLabel}</SelectItem>
          {kinds.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
