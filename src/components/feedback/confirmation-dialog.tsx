"use client"

import { LoaderCircle, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils/cn"

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending = false,
  destructive = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  pending?: boolean
  destructive?: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showClose={!pending}
        className="max-w-md overflow-hidden rounded-[22px] p-0 sm:rounded-[24px]"
      >
        <DialogHeader className="gap-0 p-5 pe-14 sm:p-6 sm:pe-16">
          <span
            className={cn(
              "mb-4 flex size-11 items-center justify-center rounded-xl border",
              destructive
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-warning/20 bg-warning/10 text-warning",
            )}
          >
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle className="text-xl sm:text-[22px]">{title}</DialogTitle>
          <DialogDescription className="mt-2 max-w-sm text-sm leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-muted/25 mt-0 border-t px-5 py-4 sm:px-6 sm:py-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "primary"}
            size="md"
            disabled={pending}
            aria-busy={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            <span>{pending ? `${confirmLabel}…` : confirmLabel}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
