import { Skeleton } from "@/components/ui/skeleton"

export function PortalWorkspaceSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1380px] space-y-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading portal workspace"
    >
      <div className="bg-card text-card-foreground overflow-hidden rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-5 w-56 max-w-[60vw]" />
              <Skeleton className="h-3.5 w-80 max-w-[70vw]" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl sm:w-36" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-card rounded-2xl border p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-36 max-w-full" />
              </div>
              <Skeleton className="size-11 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/15 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-80 max-w-[80vw]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-xl" />
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border">
            <div className="bg-muted/30 grid grid-cols-[1.5fr_repeat(3,1fr)] gap-3 border-b p-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-3.5 w-20" />
              ))}
            </div>
            <div className="divide-y">
              {Array.from({ length: 6 }, (_, row) => (
                <div
                  key={row}
                  className="grid grid-cols-[1.5fr_repeat(3,1fr)] items-center gap-3 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-36 max-w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading portal workspace...</span>
    </div>
  )
}
