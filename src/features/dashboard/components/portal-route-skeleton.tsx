"use client"

import { usePathname } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { PortalFormSkeleton } from "@/features/dashboard/components/portal-form-skeleton"
import { PortalWorkspaceSkeleton } from "@/features/dashboard/components/portal-workspace-skeleton"

const detailModules = new Set([
  "members",
  "projects",
  "opportunities",
  "offers",
  "applications",
  "tenders",
  "catalogue",
  "equipment",
  "engagements",
  "messages",
  "support",
])

export function PortalRouteSkeleton() {
  const pathname = usePathname()
  const route = pathname.split("/dashboard/")[1] ?? ""
  const parts = route.split("/").filter(Boolean)
  const isForm = parts.at(-1) === "create" || parts.at(-1) === "edit"
  const isDetail =
    !isForm && parts.length === 2 && detailModules.has(parts[0] ?? "")

  if (isForm) return <FormRouteSkeleton />
  if (isDetail) return <DetailRouteSkeleton />
  return <PortalWorkspaceSkeleton />
}

function HeaderSkeleton() {
  return (
    <div className="border-line/80 bg-card relative isolate overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.42)] sm:p-6">
      <div
        aria-hidden
        className="bg-interactive/10 pointer-events-none absolute -end-20 -top-24 -z-10 size-64 rounded-full blur-3xl"
      />
      <Skeleton className="h-3 w-40 rounded-md" />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-9 w-72 max-w-[78vw] rounded-lg" />
          <Skeleton className="h-4 w-[32rem] max-w-[88vw] rounded-md" />
        </div>
        <div className="border-line/70 bg-card/80 flex gap-2 rounded-2xl border p-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="hidden h-10 w-24 rounded-xl sm:block" />
        </div>
      </div>
    </div>
  )
}

function FormRouteSkeleton() {
  return (
    <div
      className="w-full space-y-6"
      role="status"
      aria-label="Loading form"
      aria-busy="true"
      aria-live="polite"
    >
      <HeaderSkeleton />
      <PortalFormSkeleton
        sections={[
          { fields: 4, title: true, description: true, columns: 2 },
          { fields: 3, title: true, columns: 2 },
        ]}
      />
      <span className="sr-only">Loading form...</span>
    </div>
  )
}

function DetailRouteSkeleton() {
  return (
    <div
      className="w-full space-y-6"
      role="status"
      aria-label="Loading details"
      aria-busy="true"
      aria-live="polite"
    >
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="bg-card border-line/90 rounded-2xl border p-5 shadow-[var(--shadow-xs)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-3 w-full max-w-36 rounded-md" />
              </div>
              <Skeleton className="size-11 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="bg-card border-line/90 rounded-2xl border p-5 shadow-[var(--shadow-xs)] sm:p-6">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="mt-2 h-3.5 w-72 max-w-full rounded-md" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-5 w-full max-w-52 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border-line/90 h-fit rounded-2xl border p-5 shadow-[var(--shadow-xs)]">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="mt-2 h-3.5 w-full rounded-md" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading details...</span>
    </div>
  )
}
