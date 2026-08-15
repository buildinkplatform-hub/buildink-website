"use client"

import * as Dialog from "@radix-ui/react-dialog"
import type { ReactNode } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { useTranslations } from "next-intl"

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
      <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-navy/45 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "bg-surface fixed inset-y-0 z-50 w-[min(88vw,360px)] overflow-y-auto p-5 shadow-2xl",
          side === "left" ? "start-0" : "end-0",
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
}: {
  title: string
  children?: ReactNode
}) {
  const t = useTranslations("common")
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Dialog.Title className="text-brand-navy text-lg font-bold">
        {title}
      </Dialog.Title>
      {children ?? (
        <SheetClose asChild>
          <button
            type="button"
            className="border-line inline-flex size-11 items-center justify-center rounded-xl border bg-white"
            aria-label={t("closeDialog")}
          >
            <X className="size-5" />
          </button>
        </SheetClose>
      )}
    </div>
  )
}
