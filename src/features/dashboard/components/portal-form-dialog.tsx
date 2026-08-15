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
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,56rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
