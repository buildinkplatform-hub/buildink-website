"use client"

import {
  ArrowDownAZ,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ListFilter,
  Search,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export interface PortalTableRow {
  id: string
  title: string
  secondary?: string | null
  meta?: string | null
  badge?: string
  statuses?: Array<string | null | undefined>
  detailHref?: string
  actions?: ReactNode
  [key: string]: unknown
}

export interface PortalTableColumn {
  id: string
  header: string
  className?: string
  cellClassName?: string
  render: (row: PortalTableRow) => ReactNode
}

export interface PortalTableLabels {
  search: string
  status: string
  allStatuses: string
  sort: string
  newest: string
  titleAsc: string
  details: string
  actions: string
  previous: string
  next: string
  showing: string
  reference?: string
  direction?: string
  submitted?: string
  revisions?: string
  totalRecords?: string
  rows?: string
  statusLabels?: Record<string, string>
}

const pageSize = 10

export interface PortalServerTableState {
  query?: string
  status?: string
  sort?: "newest" | "title"
  statusOptions?: string[]
  sortOptions?: Array<"newest" | "title">
  pageInfo: {
    page: number
    pageSize: number
    total: number
    hasNextPage: boolean
  }
}

function humanizeValue(value: string) {
  const normalized = value.trim().replaceAll("_", " ").replace(/\s+/g, " ")
  if (!normalized) return value
  const lower = normalized.toLocaleLowerCase()
  return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`
}

export function PortalDataTable({
  rows,
  empty,
  labels,
  server,
  columns,
  filters,
  mobileCard,
  showFooter = false,
  tableClassName,
  attachedFooter = false,
}: {
  rows: PortalTableRow[]
  empty: string
  labels: PortalTableLabels
  server?: PortalServerTableState
  columns?: PortalTableColumn[]
  filters?: ReactNode
  mobileCard?: (row: PortalTableRow) => ReactNode
  showFooter?: boolean
  tableClassName?: string
  attachedFooter?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const serverQuery = server?.query ?? ""
  const [queryDraft, setQueryDraft] = useState({
    base: serverQuery,
    value: serverQuery,
  })
  const [status, setStatus] = useState(server?.status ?? "all")
  const [sort, setSort] = useState<"newest" | "title">(server?.sort ?? "newest")
  const [page, setPage] = useState(1)
  const query =
    server && queryDraft.base !== serverQuery ? serverQuery : queryDraft.value
  const statusValue = server?.status ?? status
  const sortValue = server?.sort ?? sort

  function updateUrl(updates: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "all") {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    }
    const suffix = next.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    if (!server || query === (server.query ?? "")) return
    const timeout = setTimeout(
      () => updateUrl({ q: query.trim() || undefined, page: 1 }),
      350,
    )
    return () => clearTimeout(timeout)
    // updateUrl intentionally uses the current URL snapshot when the debounce fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, server?.query])

  const statuses = useMemo(
    () =>
      server
        ? (server.statusOptions ?? [])
        : [
            ...new Set(
              rows
                .flatMap((row) => row.statuses ?? [])
                .filter((value): value is string => Boolean(value)),
            ),
          ].sort(),
    [rows, server],
  )

  const filtered = useMemo(() => {
    if (server) return rows
    const normalized = query.trim().toLocaleLowerCase()
    const result = rows.filter((row) => {
      const matchesText =
        !normalized ||
        [row.title, row.secondary, row.meta, ...(row.statuses ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized)
      const matchesStatus =
        statusValue === "all" || row.statuses?.includes(statusValue)
      return matchesText && matchesStatus
    })
    return sortValue === "title"
      ? [...result].sort((a, b) => a.title.localeCompare(b.title))
      : result
  }, [query, rows, server, sortValue, statusValue])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const visible = server
    ? rows
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const sortOptions = server?.sortOptions ?? ["newest", "title"]

  function resetPage() {
    setPage(1)
  }

  function clearSearch() {
    setQueryDraft({ base: serverQuery, value: "" })
    if (!server) resetPage()
  }

  const tableColumns: PortalTableColumn[] = columns ?? [
    {
      id: "details",
      header: labels.details,
      className: "w-[42%]",
      render: (row: PortalTableRow) => (
        <div className="space-y-1">
          <div className="flex items-start gap-3">
            <p className="text-foreground min-w-0 flex-1 text-sm font-semibold tracking-[-0.01em]">
              {row.title}
            </p>
            {row.badge ? (
              <span className="bg-primary/8 text-primary border-primary/10 shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold">
                {row.badge}
              </span>
            ) : null}
          </div>
          {row.secondary ? (
            <p className="text-muted-foreground text-xs font-medium">
              {row.secondary}
            </p>
          ) : null}
          {row.meta ? (
            <p className="text-muted-foreground line-clamp-2 max-w-2xl text-xs leading-5">
              {row.meta}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: labels.status,
      className: "w-[24%]",
      render: (row: PortalTableRow) => (
        <StatusList values={row.statuses} labels={labels.statusLabels} />
      ),
    },
    {
      id: "actions",
      header: labels.actions,
      render: (row: PortalTableRow) => (
        <div className="flex flex-wrap items-center gap-2">
          {row.detailHref ? (
            <Button asChild size="sm" variant="outline">
              <Link href={row.detailHref}>{labels.details}</Link>
            </Button>
          ) : null}
          {row.actions}
        </div>
      ),
    },
  ]

  const pagination = {
    currentPage: server?.pageInfo.page ?? currentPage,
    pageSize: server?.pageInfo.pageSize ?? pageSize,
    pages: server
      ? Math.max(1, Math.ceil(server.pageInfo.total / server.pageInfo.pageSize))
      : pages,
    total: server?.pageInfo.total ?? filtered.length,
    onPrevious: () =>
      server
        ? updateUrl({ page: Math.max(1, server.pageInfo.page - 1) })
        : setPage((value) => Math.max(1, value - 1)),
    onNext: () =>
      server
        ? updateUrl({ page: server.pageInfo.page + 1 })
        : setPage((value) => Math.min(pages, value + 1)),
  }

  const shouldShowPagination = server
    ? server.pageInfo.total > 0
    : (showFooter || filtered.length > pageSize) && filtered.length > 0

  return (
    <div className="space-y-4">
      <div className="border-primary/10 bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)]">
        {filters ? (
          <div className="border-primary/10 bg-primary/[0.02] border-b px-4 py-3.5 sm:px-5">
            {filters}
          </div>
        ) : null}
        <div className="grid gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,.98),rgba(246,250,255,.98))] px-4 py-3.5 sm:grid-cols-[minmax(16rem,1fr)_minmax(10rem,.35fr)_minmax(10rem,.3fr)] sm:px-5">
          <label className="group relative">
            <span className="sr-only">{labels.search}</span>
            <span className="bg-primary/[0.07] text-primary group-focus-within:bg-primary/10 pointer-events-none absolute start-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition-colors">
              <Search className="size-4" strokeWidth={2.1} />
            </span>
            <Input
              value={query}
              onChange={(event) => {
                setQueryDraft({ base: serverQuery, value: event.target.value })
                if (!server) resetPage()
              }}
              placeholder={labels.search}
              className="border-primary/10 bg-card hover:border-primary/20 focus-visible:border-primary/35 focus-visible:ring-primary/10 h-11 min-h-11 rounded-xl ps-12 pe-10 shadow-none transition-[border-color,box-shadow]"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="text-muted-foreground hover:bg-primary/[0.07] hover:text-primary focus-visible:ring-primary/20 absolute end-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={clearSearch}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>

          {statuses.length ? (
            <Select
              value={statusValue}
              onValueChange={(value) => {
                if (server) updateUrl({ status: value, page: 1 })
                else {
                  setStatus(value)
                  resetPage()
                }
              }}
            >
              <SelectTrigger
                aria-label={labels.status}
                className="border-primary/10 bg-card hover:border-primary/20 h-11 min-h-11 w-full gap-2 rounded-xl shadow-none"
              >
                <ListFilter className="text-primary size-4 shrink-0" />
                <SelectValue placeholder={labels.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.allStatuses}</SelectItem>
                {statuses.map((value) => (
                  <SelectItem key={value} value={value}>
                    {labels.statusLabels?.[value] ?? humanizeValue(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {sortOptions.length > 1 ? (
            <Select
              value={sortValue}
              onValueChange={(value) => {
                if (server) updateUrl({ sort: value, page: 1 })
                else setSort(value as typeof sort)
              }}
            >
              <SelectTrigger
                aria-label={labels.sort}
                className="border-primary/10 bg-card hover:border-primary/20 h-11 min-h-11 w-full gap-2 rounded-xl shadow-none"
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
        </div>
      </div>

      {!visible.length ? (
        <Card className="border-primary/10 grid min-h-64 place-items-center border-dashed p-8 text-center">
          <div className="max-w-sm">
            <div className="border-primary/10 bg-primary/[0.07] text-primary mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border">
              <Inbox className="size-5" aria-hidden="true" />
            </div>
            <p className="text-foreground font-semibold tracking-[-0.015em]">
              {empty}
            </p>
          </div>
        </Card>
      ) : null}

      {visible.length ? (
        <>
          <div className="border-primary/10 bg-card hidden overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)] md:block">
            <div className="portal-scrollbar overflow-x-auto">
              <table
                className={cn("w-full text-start text-sm", tableClassName)}
              >
                <thead className="bg-primary/[0.035] border-primary/10 border-b">
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column.id}
                        className={cn(
                          "text-muted-foreground h-11 px-4 text-start align-middle text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase sm:px-5",
                          column.className,
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {visible.map((row) => (
                    <tr
                      key={row.id}
                      className="border-primary/[0.07] hover:bg-primary/[0.025] border-b transition-colors"
                    >
                      {tableColumns.map((column) => (
                        <td
                          key={`${row.id}-${column.id}`}
                          className={cn(
                            "px-4 py-3.5 align-middle sm:px-5",
                            column.cellClassName,
                          )}
                        >
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {attachedFooter && shouldShowPagination ? (
              <PaginationBar {...pagination} labels={labels} attached />
            ) : null}
          </div>

          <div className="grid gap-3 md:hidden">
            {visible.map((row) => (
              <Card
                key={row.id}
                className="border-primary/10 p-4 shadow-[var(--shadow-xs)]"
              >
                {mobileCard ? (
                  mobileCard(row)
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground font-semibold tracking-[-0.01em]">
                        {row.title}
                      </p>
                      {row.badge ? (
                        <span className="bg-primary/8 text-primary border-primary/10 shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold">
                          {row.badge}
                        </span>
                      ) : null}
                    </div>
                    {row.secondary ? (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {row.secondary}
                      </p>
                    ) : null}
                    {row.meta ? (
                      <p className="text-muted-foreground mt-2 text-xs leading-5">
                        {row.meta}
                      </p>
                    ) : null}
                    <div className="mt-3">
                      <StatusList
                        values={row.statuses}
                        labels={labels.statusLabels}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {row.detailHref ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={row.detailHref}>{labels.details}</Link>
                        </Button>
                      ) : null}
                      {row.actions}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {shouldShowPagination ? (
        <div className={cn(attachedFooter && "md:hidden")}>
          <PaginationBar {...pagination} labels={labels} />
        </div>
      ) : null}
    </div>
  )
}

function PaginationBar({
  currentPage,
  pageSize,
  pages,
  total,
  labels,
  onPrevious,
  onNext,
  attached = false,
}: {
  currentPage: number
  pageSize: number
  pages: number
  total: number
  labels: PortalTableLabels
  onPrevious: () => void
  onNext: () => void
  attached?: boolean
}) {
  if (!total) return null

  return (
    <div
      className={cn(
        "bg-primary/[0.025] flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5",
        attached
          ? "border-primary/10 border-t"
          : "border-primary/10 rounded-2xl border shadow-[var(--shadow-xs)]",
      )}
    >
      <p className="text-muted-foreground text-xs">
        {total} {labels.totalRecords ?? "total records"}
      </p>
      <div className="flex items-center gap-2">
        <span className="border-primary/10 bg-card text-muted-foreground hidden rounded-lg border px-2.5 py-1.5 text-xs font-medium sm:inline-flex">
          {pageSize} {labels.rows ?? "rows"}
        </span>
        <span
          className="bg-primary/8 text-primary border-primary/10 inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-semibold tabular-nums"
          aria-label={`${currentPage} / ${pages}`}
        >
          {currentPage}
          <span className="text-muted-foreground mx-1">/</span>
          {pages}
        </span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="border-primary/10 bg-card hover:bg-primary/[0.04] size-9"
          disabled={currentPage === 1}
          aria-label={labels.previous}
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="border-primary/10 bg-card hover:bg-primary/[0.04] size-9"
          disabled={currentPage === pages}
          aria-label={labels.next}
          onClick={onNext}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  )
}

function StatusList({
  values = [],
  labels,
}: {
  values?: Array<string | null | undefined>
  labels?: Record<string, string>
}) {
  const statuses = values.filter((value): value is string => Boolean(value))
  if (!statuses.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((value) => (
        <StatusBadge key={value} status={value} label={labels?.[value]} />
      ))}
    </div>
  )
}
