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
    <div className="space-y-3">
      <Skeleton className="h-3.5 w-28 rounded-md" />
      <Skeleton className="h-8 w-full max-w-sm rounded-lg" />
      <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
    </div>
  )
}

function FormRouteSkeleton() {
  return (
    <div
      className="w-full space-y-6"
      aria-label="Loading form"
      aria-busy="true"
    >
      <HeaderSkeleton />
      <PortalFormSkeleton
        sections={[
          { fields: 4, title: true, description: true, columns: 2 },
          { fields: 3, title: true, columns: 2 },
        ]}
      />
    </div>
  )
}

function DetailRouteSkeleton() {
  return (
    <div
      className="w-full space-y-6"
      aria-label="Loading details"
      aria-busy="true"
    >
      <HeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-card rounded-2xl border p-4 shadow-sm">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="mt-3 h-7 w-20 rounded-md" />
            <Skeleton className="mt-2 h-3 w-full max-w-36 rounded-md" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-5 w-full max-w-52 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card h-fit rounded-2xl border p-5 shadow-sm">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
