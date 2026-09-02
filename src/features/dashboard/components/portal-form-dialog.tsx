"use client"

import { Plus } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function PortalFormDialog({
  triggerLabel,
  title,
  description,
  children,
}: {
  triggerLabel: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-1.5rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col overflow-hidden rounded-2xl p-0 sm:w-[calc(100%-2rem)] sm:rounded-2xl">
        <DialogHeader className="border-border/70 shrink-0 border-b bg-slate-50/60 px-5 py-5 pe-14 sm:px-6 sm:py-5 dark:bg-white/[0.02]">
          <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-2xl">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="portal-scrollbar min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
