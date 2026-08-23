import Image from "next/image"

import { Skeleton } from "@/components/ui/skeleton"

export function PublicPageSkeleton() {
  return (
    <div className="page-container space-y-8 py-10">
      <Skeleton className="h-12 w-2/3 max-w-xl" />
      <Skeleton className="h-6 w-full max-w-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  )
}

export function PublicHomeSkeleton() {
  return (
    <div
      className="page-container space-y-8 py-10"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading home"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-5 pt-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-16 w-full max-w-3xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-20 w-full rounded-[26px]" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-28 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[460px] w-full rounded-[34px]" />
      </div>
      <Skeleton className="h-24 w-full rounded-[28px]" />
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-5 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-52 rounded-[30px]" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-[28px]" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading home page...</span>
    </div>
  )
}

export function PublicDirectorySkeleton() {
  return (
    <div
      className="page-container space-y-6 py-10"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading directory"
    >
      <div className="overflow-hidden rounded-[34px] border border-line bg-white shadow-[var(--shadow-card)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-4 p-6 sm:p-8">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-13 w-full rounded-2xl" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Skeleton className="h-full min-h-72 w-full rounded-[28px]" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Skeleton className="hidden h-fit rounded-[28px] p-5 xl:block" />
        <div className="space-y-5">
          <Skeleton className="h-7 w-40 rounded-full" />
          <div className="grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-48 rounded-[26px]" />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="size-10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading directory...</span>
    </div>
  )
}

export function PortalPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1380px] space-y-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading portal workspace"
    >
      <div className="overflow-hidden rounded-2xl border border-[#d8e2f1] bg-[linear-gradient(135deg,#f7faff_0%,#edf3fb_100%)] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="loader-logo-ring flex size-16 items-center justify-center rounded-2xl border border-[#bdd0ea] bg-[#0b2344] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Image
                src="/brand/buildink-logo-mark.svg"
                width={34}
                height={34}
                alt=""
                priority
              />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-4 w-44 rounded-full" />
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-[#d8e4f4]">
              <div className="loader-progress h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#2d8cff,#31b5ff)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2.5">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-8 w-64 max-w-[75vw]" />
          <Skeleton className="h-4 w-[30rem] max-w-[88vw]" />
        </div>
        <Skeleton className="h-10 w-full rounded-[10px] sm:w-36" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="size-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <div className="rounded-xl border border-line bg-white p-5 xl:col-span-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="flex h-44 items-end gap-3 rounded-xl bg-slate-50 p-4">
            {[42, 64, 48, 78, 58, 88, 72, 96].map((height, index) => (
              <Skeleton
                key={index}
                className="min-w-2 flex-1 rounded-t-md rounded-b-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white p-5 xl:col-span-2">
          <Skeleton className="mb-6 h-5 w-40" />
          <div className="space-y-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-7" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 min-w-0 flex-1 rounded-[10px]" />
          <Skeleton className="h-10 w-full rounded-[10px] sm:w-40" />
          <Skeleton className="h-10 w-full rounded-[10px] sm:w-32" />
        </div>
        <div className="divide-y divide-line px-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 py-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-48 max-w-[70%]" />
                <Skeleton className="h-3 w-72 max-w-[90%]" />
              </div>
              <Skeleton className="hidden h-7 w-20 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading portal workspace...</span>
    </div>
  )
}

export function PortalWorkspaceLoader() {
  return (
    <div className="bg-brand-navy relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(49,181,255,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(23,107,255,0.12),transparent_30%)]" />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center text-white">
        <div className="loader-logo-ring flex size-26 items-center justify-center rounded-[28px] border border-white/12 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex size-18 items-center justify-center rounded-[22px] bg-[#0f2343] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Image
              src="/brand/buildink-logo-mark.svg"
              width={48}
              height={48}
              alt="Buildink"
              priority
            />
          </div>
        </div>
        <h1 className="mt-7 text-[2rem] font-bold tracking-[0.16em] text-white">
          BUILDINK
        </h1>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.28em] text-[#31b5ff] uppercase">
          Build Beyond Limits
        </p>
        <div className="mt-8 w-full max-w-[200px]">
          <div className="h-2 overflow-hidden rounded-full bg-white/12">
            <div className="loader-progress h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#2d8cff,#31b5ff)]" />
          </div>
        </div>
        <p className="mt-5 text-base text-white/72">Preparing your workspace</p>
      </div>
    </div>
  )
}

export function AuthPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-xl space-y-4 py-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-44 rounded-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-2 rounded-full" />
          ))}
        </div>
      </div>
      <div className="border-line space-y-6 rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-2/3 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function OnboardingPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading onboarding"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-44 rounded-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-2 rounded-full" />
          ))}
        </div>
      </div>
      <div className="border-line space-y-6 rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
          <Skeleton className="h-12 w-full rounded-xl sm:w-32" />
          <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
        </div>
      </div>
      <span className="sr-only">Loading onboarding step...</span>
    </div>
  )
}

export function HeaderAuthSkeleton() {
  return <Skeleton className="h-11 w-40 rounded-2xl" />
}
