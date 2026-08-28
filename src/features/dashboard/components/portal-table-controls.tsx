"use client"

import {
  ArrowDownAZ,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
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
      if (value === undefined || value === "" || value === "all") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    const suffix = next.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname)
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
    <div className="bg-muted/20 space-y-3 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.06em] uppercase">
          <span className="bg-primary/8 text-primary grid size-7 place-items-center rounded-lg">
            <SlidersHorizontal className="size-3.5" />
          </span>
          Filters and sorting
        </div>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-xl text-xs"
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
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_minmax(10rem,.35fr)_minmax(10rem,.3fr)]">
        <label className="relative">
          <span className="sr-only">{labels.search}</span>
          <Search className="text-muted-foreground pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) =>
              setDraft({ base: serverQuery, value: event.target.value })
            }
            placeholder={labels.search}
            className="bg-card h-12 rounded-2xl ps-11 pe-10"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              className="text-muted-foreground hover:bg-muted hover:text-foreground absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg transition-colors"
              onClick={() => {
                setDraft({ base: serverQuery, value: "" })
              }}
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
              className="bg-card w-full"
            >
              <SelectValue placeholder={labels.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allStatuses}</SelectItem>
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
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
            <SelectTrigger aria-label={labels.sort} className="bg-card w-full">
              <ArrowDownAZ className="text-muted-foreground size-4 shrink-0" />
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
      </div>
    </div>
  )
}
