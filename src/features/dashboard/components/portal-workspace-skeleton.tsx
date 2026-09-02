import { Skeleton } from "@/components/ui/skeleton"

export function PortalWorkspaceSkeleton() {
  return (
    <div
      className="w-full space-y-5 sm:space-y-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading portal workspace"
    >
      <HeaderSkeleton />
      <MetricsSkeleton />
      <ToolbarSkeleton />
      <TableSkeleton />
      <span className="sr-only">Loading portal workspace...</span>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="flex min-h-[88px] flex-col justify-center gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-8 w-64 max-w-[75vw] rounded-lg" />
        <Skeleton className="h-4 w-[30rem] max-w-[86vw] rounded-md" />
      </div>
      <div className="flex shrink-0 gap-2">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="hidden h-10 w-24 rounded-xl sm:block" />
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="bg-card text-card-foreground border-border/90 rounded-2xl border p-5 shadow-[var(--shadow-xs)]"
        >
          <div className="flex min-h-[72px] items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-3 w-32 max-w-full rounded-md" />
            </div>
            <Skeleton className="size-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ToolbarSkeleton() {
  return (
    <div className="border-border/90 bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)]">
      <div className="bg-muted/18 flex flex-wrap gap-3 p-4 sm:px-5 sm:py-3.5">
        <Skeleton className="h-11 min-w-56 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="border-border/90 bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)]">
      <div className="bg-muted/35 border-border/70 hidden grid-cols-[1.5fr_repeat(4,1fr)_5rem] gap-4 border-b px-5 py-3.5 md:grid">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-3.5 w-20 max-w-full rounded-md" />
        ))}
      </div>
      <div className="divide-border/70 divide-y">
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-4 py-3.5 md:grid-cols-[1.5fr_repeat(4,1fr)_5rem] md:items-center md:gap-4 md:px-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36 max-w-full rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            {Array.from({ length: 4 }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="hidden h-4 w-24 max-w-full rounded-md md:block"
              />
            ))}
            <Skeleton className="hidden h-9 w-16 rounded-lg md:block" />
          </div>
        ))}
      </div>
      <div className="bg-muted/18 border-border/70 flex items-center justify-between gap-4 border-t px-4 py-3 sm:px-5">
        <Skeleton className="h-3 w-28 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
