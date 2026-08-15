"use client"

import { ArrowDownAZ, ChevronLeft, ChevronRight, Search } from "lucide-react"
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
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import {
  statusTone,
  type StatusTone,
} from "@/features/dashboard/components/status-badge"

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
}

const pageSize = 8

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

export function PortalDataTable({
  rows,
  empty,
  labels,
  server,
  columns,
  filters,
  mobileCard,
}: {
  rows: PortalTableRow[]
  empty: string
  labels: PortalTableLabels
  server?: PortalServerTableState
  columns?: PortalTableColumn[]
  filters?: ReactNode
  mobileCard?: (row: PortalTableRow) => ReactNode
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
    router.replace(suffix ? `${pathname}?${suffix}` : pathname)
  }

  useEffect(() => {
    if (!server || query === (server.query ?? "")) return
    const timeout = setTimeout(
      () => updateUrl({ q: query.trim(), page: 1 }),
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

  const tableColumns: PortalTableColumn[] = columns ?? [
    {
      id: "details",
      header: labels.details,
      className: "w-[42%]",
      render: (row: PortalTableRow) => (
        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <p className="text-brand-navy min-w-0 flex-1 text-sm font-semibold">
              {row.title}
            </p>
            {row.badge ? (
              <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                {row.badge}
              </span>
            ) : null}
          </div>
          {row.secondary ? (
            <p className="text-muted text-xs font-medium">{row.secondary}</p>
          ) : null}
          {row.meta ? (
            <p className="text-muted line-clamp-2 max-w-2xl text-xs leading-5">
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
      render: (row: PortalTableRow) => <StatusList values={row.statuses} />,
    },
    {
      id: "actions",
      header: labels.actions,
      render: (row: PortalTableRow) => (
        <div className="flex flex-wrap items-center gap-2.5">
          {row.detailHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={row.detailHref}>{labels.details}</Link>
            </Button>
          ) : null}
          {row.actions}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        {filters ? (
          <div className="border-b bg-slate-50/80 px-4 py-4 sm:px-5">
            {filters}
          </div>
        ) : null}
        <div className="grid gap-3 border-b bg-slate-50/80 px-4 py-4 sm:grid-cols-[minmax(16rem,1fr)_minmax(10rem,.35fr)_minmax(10rem,.3fr)] sm:px-5">
          <label className="relative">
            <span className="sr-only">{labels.search}</span>
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => {
                setQueryDraft({ base: serverQuery, value: event.target.value })
                if (!server) resetPage()
              }}
              placeholder={labels.search}
              className="bg-white ps-9"
            />
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
                className="w-full bg-white"
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
              value={sortValue}
              onValueChange={(value) => {
                if (server) updateUrl({ sort: value, page: 1 })
                else setSort(value as typeof sort)
              }}
            >
              <SelectTrigger
                aria-label={labels.sort}
                className="w-full bg-white"
              >
                <ArrowDownAZ className="text-muted-foreground size-4" />
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
        <Card className="rounded-xl border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">{empty}</p>
        </Card>
      ) : null}

      {visible.length ? (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)] md:block">
            <table className="w-full text-start text-sm">
              <thead className="border-b bg-slate-50/80 text-xs">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column.id}
                      className={cn(
                        "text-muted-foreground h-12 px-5 text-start align-middle text-xs font-semibold whitespace-nowrap",
                        column.className,
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white [&_tr:last-child]:border-0">
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-slate-50/70"
                  >
                    {tableColumns.map((column) => (
                      <td
                        key={`${row.id}-${column.id}`}
                        className={cn("px-5 py-4 align-middle", column.cellClassName)}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {visible.map((row) => (
              <Card key={row.id} className="rounded-xl p-4 shadow-none">
                {mobileCard ? (
                  mobileCard(row)
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-brand-navy font-semibold">{row.title}</p>
                      {row.badge ? (
                        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                          {row.badge}
                        </span>
                      ) : null}
                    </div>
                    {row.secondary ? (
                      <p className="text-muted mt-1 text-sm">{row.secondary}</p>
                    ) : null}
                    {row.meta ? (
                      <p className="text-muted mt-2 text-xs leading-5">
                        {row.meta}
                      </p>
                    ) : null}
                    <div className="mt-3">
                      <StatusList values={row.statuses} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {row.detailHref ? (
                        <Button asChild size="sm" variant="secondary">
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

      {server ? (
        server.pageInfo.total ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50/70 px-4 py-3 sm:px-5">
            <p className="text-muted-foreground text-xs">
              {server.pageInfo.total} total record{server.pageInfo.total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={server.pageInfo.page === 1}
                aria-label={labels.previous}
                onClick={() => updateUrl({ page: server.pageInfo.page - 1 })}
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!server.pageInfo.hasNextPage}
                aria-label={labels.next}
                onClick={() => updateUrl({ page: server.pageInfo.page + 1 })}
              >
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        ) : null
      ) : filtered.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50/70 px-4 py-3 sm:px-5">
          <p className="text-muted-foreground text-xs">
            {filtered.length} total record{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={currentPage === 1}
              aria-label={labels.previous}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={currentPage === pages}
              aria-label={labels.next}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const chipTone: Record<StatusTone, string> = {
  neutral: "bg-canvas text-muted",
  info: "bg-light-blue text-brand-navy",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
}

function StatusList({
  values = [],
}: {
  values?: Array<string | null | undefined>
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values
        .filter((value): value is string => Boolean(value))
        .map((value) => (
          <span
            key={value}
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
              chipTone[statusTone(value)],
            )}
          >
            {value.replaceAll("_", " ")}
          </span>
        ))}
    </div>
  )
}
