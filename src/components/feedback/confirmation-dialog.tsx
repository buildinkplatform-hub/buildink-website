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
      <DialogContent showClose={!pending} className="max-w-lg">
        <DialogHeader>
          <span
            className={cn(
              "mb-2 grid size-12 place-items-center rounded-2xl border",
              destructive
                ? "border-destructive/15 bg-destructive/8 text-destructive"
                : "border-warning/15 bg-warning/8 text-warning",
            )}
          >
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="max-w-md leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "primary"}
            disabled={pending}
            aria-busy={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {pending ? `${confirmLabel}…` : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
