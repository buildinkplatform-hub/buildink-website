"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function Command({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-line overflow-hidden rounded-xl border bg-white",
        className,
      )}
      {...props}
    />
  )
}
export function CommandInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <div className="border-line flex items-center gap-2 border-b px-3">
      <Search className="text-muted size-4" />
      <input
        className="placeholder:text-muted min-h-11 w-full bg-transparent text-sm outline-none"
        {...props}
      />
    </div>
  )
}
export function CommandList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("max-h-52 overflow-y-auto p-1", className)}
      role="listbox"
      {...props}
    />
  )
}
export function CommandItem({
  className,
  "aria-selected": ariaSelected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
        className,
      )}
      role="option"
      aria-selected={ariaSelected ?? false}
      {...props}
    />
  )
}
