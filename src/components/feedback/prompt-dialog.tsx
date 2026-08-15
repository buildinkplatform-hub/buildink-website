"use client"

import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  value,
  onValueChange,
  confirmLabel,
  cancelLabel,
  pending = false,
  minLength = 1,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  value: string
  onValueChange: (value: string) => void
  confirmLabel: string
  cancelLabel: string
  pending?: boolean
  minLength?: number
  onConfirm: () => void
}) {
  const valid = value.trim().length >= minLength

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent showClose={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          className="mt-5 min-h-28"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              (event.ctrlKey || event.metaKey) &&
              event.key === "Enter" &&
              valid
            ) {
              event.preventDefault()
              onConfirm()
            }
          }}
        />
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
            disabled={pending || !valid}
            onClick={onConfirm}
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
