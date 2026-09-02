import type { ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import type { PortalTableRow } from "@/features/dashboard/components/portal-data-table"
import { PortalTableControls } from "@/features/dashboard/components/portal-table-controls"

export interface PortalServerTableColumn {
  id: string
  header: ReactNode
  className?: string
  cellClassName?: string
  render: (row: PortalTableRow) => ReactNode
}

export interface PortalServerTableLabels {
  search: string
  status: string
  allStatuses: string
  sort: string
  newest: string
  titleAsc: string
  previous: string
  next: string
  totalRecords?: string
  rows?: string
  goToPage?: (page: number) => string
  details?: string
}

export function PortalServerTable({
  rows,
  empty,
  emptyDescription,
  labels,
  basePath,
  server,
  columns,
  filters,
  mobileCard,
  queryParams,
}: {
  rows: PortalTableRow[]
  empty: string
  emptyDescription?: string
  labels: PortalServerTableLabels
  basePath: string
  server?: {
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
  columns: PortalServerTableColumn[]
  filters?: ReactNode
  mobileCard?: (row: PortalTableRow) => ReactNode
  queryParams?: Record<string, string | undefined>
}) {
  const pageCount = server
    ? Math.max(1, Math.ceil(server.pageInfo.total / server.pageInfo.pageSize))
    : 1
  const currentPage = server
    ? Math.min(Math.max(1, server.pageInfo.page), pageCount)
    : 1
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(
      (page) =>
        page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1,
    )
    .slice(0, 7)
  const firstRecord = server?.pageInfo.total
    ? (currentPage - 1) * server.pageInfo.pageSize + 1
    : 0
  const lastRecord = server
    ? Math.min(server.pageInfo.total, currentPage * server.pageInfo.pageSize)
    : 0

  function pageHref(page: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(queryParams ?? {})) {
      if (value) params.set(key, value)
    }
    if (server?.query) params.set("q", server.query)
    if (server?.status) params.set("status", server.status)
    if (server?.sort && server.sort !== "newest")
      params.set("sort", server.sort)
    if (page > 1) params.set("page", String(page))
    const suffix = params.toString()
    return suffix ? `${basePath}?${suffix}` : basePath
  }

  return (
    <div className="space-y-3">
      <section className="border-primary/10 bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)]">
        {filters ? (
          <div className="border-primary/10 bg-primary/[0.025] border-b px-4 py-3.5 sm:px-5">
            <div className="text-brand-navy mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
              <span className="bg-primary/[0.08] text-primary grid size-7 place-items-center rounded-lg">
                <SlidersHorizontal className="size-3.5" />
              </span>
              Additional filters
            </div>
            {filters}
          </div>
        ) : null}
        <PortalTableControls
          labels={{
            search: labels.search,
            status: labels.status,
            allStatuses: labels.allStatuses,
            sort: labels.sort,
            newest: labels.newest,
            titleAsc: labels.titleAsc,
          }}
          state={{
            query: server?.query,
            status: server?.status,
            sort: server?.sort,
            statusOptions: server?.statusOptions,
            sortOptions: server?.sortOptions,
          }}
        />
      </section>

      {!rows.length ? (
        <section className="border-primary/10 bg-card grid min-h-64 place-items-center rounded-2xl border border-dashed p-8 text-center shadow-[var(--shadow-xs)]">
          <div className="max-w-sm">
            <span className="border-primary/10 bg-primary/[0.07] text-primary mx-auto mb-4 grid size-11 place-items-center rounded-xl border">
              <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="text-foreground font-semibold tracking-[-0.01em]">
              {empty}
            </p>
            {emptyDescription ? (
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">
                {emptyDescription}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {rows.length ? (
        <section className="border-primary/10 bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)]">
          <div className="portal-scrollbar hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-start text-sm">
              <thead className="border-primary/10 bg-primary/[0.035] border-b text-xs dark:bg-white/[0.025]">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={cn(
                        "text-muted-foreground h-11 px-4 text-start align-middle text-[11px] font-semibold tracking-[0.035em] whitespace-nowrap uppercase sm:px-5",
                        column.className,
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card [&_tr:last-child]:border-0">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-primary/[0.07] hover:bg-primary/[0.025] border-b transition-colors dark:hover:bg-white/[0.035]"
                  >
                    {columns.map((column) => (
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

          <div className="bg-primary/[0.012] grid gap-3 p-3 md:hidden">
            {rows.map((row) => (
              <Card
                key={row.id}
                className="border-primary/10 rounded-xl p-4 shadow-none"
              >
                {mobileCard ? (
                  mobileCard(row)
                ) : (
                  <>
                    <p className="text-foreground font-semibold">{row.title}</p>
                    <div className="border-primary/10 mt-4 flex flex-wrap gap-2 border-t pt-3">
                      {row.detailHref ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href={row.detailHref}>
                            {labels.details ?? "Details"}
                          </Link>
                        </Button>
                      ) : null}
                      {row.actions}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>

          {server && server.pageInfo.total ? (
            <footer className="border-primary/10 bg-primary/[0.025] flex flex-col gap-3 border-t px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between dark:bg-white/[0.02]">
              <div>
                <p className="text-foreground text-xs font-medium tabular-nums">
                  {firstRecord}–{lastRecord} of {server.pageInfo.total}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Page {currentPage} of {pageCount} · {server.pageInfo.pageSize}{" "}
                  rows
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="border-primary/10 bg-card hidden items-center gap-1 rounded-lg border p-1 sm:flex">
                  {pageNumbers.map((page, index) => (
                    <span key={page} className="contents">
                      {index > 0 && page - pageNumbers[index - 1]! > 1 ? (
                        <span className="text-muted-foreground px-1 text-xs">
                          …
                        </span>
                      ) : null}
                      <Button
                        asChild
                        size="icon"
                        variant={page === currentPage ? "primary" : "ghost"}
                        className="size-8 min-h-0 rounded-md px-0 text-xs"
                        aria-label={
                          labels.goToPage?.(page) ?? `Go to page ${page}`
                        }
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        <Link href={pageHref(page)}>{page}</Link>
                      </Button>
                    </span>
                  ))}
                </div>
                <span className="text-muted-foreground min-w-16 text-center text-xs tabular-nums sm:hidden">
                  {currentPage} / {pageCount}
                </span>
                <Button
                  asChild={currentPage > 1}
                  size="icon"
                  variant="secondary"
                  className="size-9 min-h-0 rounded-lg px-0"
                  disabled={currentPage === 1}
                  aria-label={labels.previous}
                >
                  {currentPage > 1 ? (
                    <Link href={pageHref(currentPage - 1)}>
                      <ChevronLeft className="size-4 rtl:rotate-180" />
                    </Link>
                  ) : (
                    <ChevronLeft className="size-4 rtl:rotate-180" />
                  )}
                </Button>
                <Button
                  asChild={server.pageInfo.hasNextPage}
                  size="icon"
                  variant="secondary"
                  className="size-9 min-h-0 rounded-lg px-0"
                  disabled={!server.pageInfo.hasNextPage}
                  aria-label={labels.next}
                >
                  {server.pageInfo.hasNextPage ? (
                    <Link href={pageHref(currentPage + 1)}>
                      <ChevronRight className="size-4 rtl:rotate-180" />
                    </Link>
                  ) : (
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  )}
                </Button>
              </div>
            </footer>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
