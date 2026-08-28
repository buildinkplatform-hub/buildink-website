"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

export function SheetContent({
  children,
  className,
  side = "right",
}: {
  children: ReactNode
  className?: string
  side?: "left" | "right"
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-brand-navy/52 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[90] backdrop-blur-[4px] duration-200 motion-reduce:animate-none" />
      <Dialog.Content
        className={cn(
          "bg-card text-card-foreground border-border/80 data-[state=closed]:animate-out data-[state=open]:animate-in fixed inset-y-0 z-[100] w-[min(92vw,410px)] overflow-y-auto p-5 shadow-[var(--shadow-floating)] duration-200 outline-none motion-reduce:animate-none sm:p-6",
          side === "left"
            ? "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left start-0 border-e"
            : "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right end-0 border-s",
          className,
        )}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function SheetHeader({
  title,
  children,
  className,
}: {
  title: string
  children?: ReactNode
  className?: string
}) {
  const t = useTranslations("common")
  return (
    <div
      className={cn(
        "border-border/70 -mx-5 -mt-5 mb-5 flex min-h-16 items-center justify-between gap-3 border-b px-5 sm:-mx-6 sm:-mt-6 sm:px-6",
        className,
      )}
    >
      <Dialog.Title className="text-foreground text-lg font-bold tracking-[-0.025em]">
        {title}
      </Dialog.Title>
      {children ?? (
        <SheetClose asChild>
          <button
            type="button"
            className="border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary/20 inline-flex size-9 items-center justify-center rounded-xl border transition-colors outline-none focus-visible:ring-3"
            aria-label={t("closeDialog")}
          >
            <X className="size-4" />
          </button>
        </SheetClose>
      )}
    </div>
  )
}
