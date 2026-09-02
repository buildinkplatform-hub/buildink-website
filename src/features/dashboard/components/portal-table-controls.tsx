"use client"

import { ArrowDownAZ, ListFilter, RotateCcw, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface PortalTableControlsState {
  query?: string
  status?: string
  sort?: "newest" | "title"
  statusOptions?: string[]
  sortOptions?: Array<"newest" | "title">
}

function humanizeFilterValue(value: string) {
  const normalized = value.trim().replaceAll("_", " ").replace(/\s+/g, " ")
  if (!normalized) return value
  const lower = normalized.toLocaleLowerCase()
  return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`
}

export function PortalTableControls({
  labels,
  state,
}: {
  labels: {
    search: string
    status: string
    allStatuses: string
    sort: string
    newest: string
    titleAsc: string
  }
  state: PortalTableControlsState
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const serverQuery = state.query ?? ""
  const [draft, setDraft] = useState({
    base: serverQuery,
    value: serverQuery,
  })
  const query = draft.base !== serverQuery ? serverQuery : draft.value

  function updateUrl(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "all")
        next.delete(key)
      else next.set(key, value)
    }
    const suffix = next.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    if (query === (state.query ?? "")) return
    const timeout = setTimeout(() => {
      updateUrl({ q: query.trim() || undefined, page: undefined })
    }, 350)
    return () => clearTimeout(timeout)
    // updateUrl intentionally uses the current URL snapshot when the debounce fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state.query])

  const statuses = state.statusOptions ?? []
  const sortOptions = state.sortOptions ?? ["newest", "title"]
  const hasFilters = Boolean(
    query || state.status || (state.sort && state.sort !== "newest"),
  )

  return (
    <div className="bg-[linear-gradient(180deg,rgba(255,255,255,.98),rgba(246,250,255,.98))] px-4 py-3.5 sm:px-5">
      <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_minmax(11rem,.34fr)_minmax(11rem,.3fr)_auto] md:items-center">
        <label className="group relative">
          <span className="sr-only">{labels.search}</span>
          <span className="bg-primary/[0.07] text-primary group-focus-within:bg-primary/10 pointer-events-none absolute start-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition-colors">
            <Search className="size-4" strokeWidth={2.1} />
          </span>
          <Input
            value={query}
            onChange={(event) =>
              setDraft({ base: serverQuery, value: event.target.value })
            }
            placeholder={labels.search}
            className="border-primary/10 bg-card hover:border-primary/20 focus-visible:border-primary/35 focus-visible:ring-primary/10 h-11 min-h-11 rounded-xl ps-12 pe-10 shadow-none transition-[border-color,box-shadow,background-color]"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              className="text-muted-foreground hover:bg-primary/[0.07] hover:text-primary focus-visible:ring-primary/20 absolute end-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setDraft({ base: serverQuery, value: "" })}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>

        {statuses.length ? (
          <Select
            value={state.status ?? "all"}
            onValueChange={(value) =>
              updateUrl({ status: value, page: undefined })
            }
          >
            <SelectTrigger
              aria-label={labels.status}
              className="border-primary/10 bg-card hover:border-primary/20 h-11 min-h-11 w-full gap-2 shadow-none"
            >
              <ListFilter className="text-primary size-4 shrink-0" />
              <SelectValue placeholder={labels.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allStatuses}</SelectItem>
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {humanizeFilterValue(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {sortOptions.length > 1 ? (
          <Select
            value={state.sort ?? "newest"}
            onValueChange={(value) =>
              updateUrl({ sort: value, page: undefined })
            }
          >
            <SelectTrigger
              aria-label={labels.sort}
              className="border-primary/10 bg-card hover:border-primary/20 h-11 min-h-11 w-full gap-2 shadow-none"
            >
              <ArrowDownAZ className="text-primary size-4 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.includes("newest") ? (
                <SelectItem value="newest">{labels.newest}</SelectItem>
              ) : null}
              {sortOptions.includes("title") ? (
                <SelectItem value="title">{labels.titleAsc}</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        ) : null}

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/[0.07] hover:text-primary h-10 justify-self-start rounded-lg px-3 text-xs md:justify-self-end"
            onClick={() => {
              setDraft({ base: "", value: "" })
              updateUrl({
                q: undefined,
                status: undefined,
                sort: undefined,
                page: undefined,
              })
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : (
          <span className="hidden md:block" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
