"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-4 py-10 sm:px-6">
      <section className="bg-card text-card-foreground w-full max-w-xl overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/15 border-b p-6 sm:p-8">
          <span className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-xl">
            <AlertTriangle className="size-5" />
          </span>
          <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-[0.16em] uppercase">
            Workspace unavailable
          </p>
          <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight">
            This page could not be loaded
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
            The workspace hit an unexpected error. Your data has not been
            changed. Try loading this view again.
          </p>
        </div>
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-muted-foreground text-xs">
            {error.digest
              ? `Reference: ${error.digest}`
              : "You can safely retry this page."}
          </p>
          <Button type="button" onClick={reset} className="sm:w-auto">
            <RotateCcw className="size-4" />
            Try again
          </Button>
        </div>
      </section>
    </div>
  )
}
