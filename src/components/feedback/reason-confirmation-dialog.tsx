"use client"

import { useState, type ReactNode } from "react"
import {
  AlertTriangle,
  Loader2,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react"

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
import { cn } from "@/lib/utils/cn"

export interface ReasonedAction {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  pendingLabel?: string
  destructive?: boolean
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  onConfirm: (reason: string) => unknown | Promise<unknown>
}

export function ReasonConfirmationDialog({
  action,
  onOpenChange,
  children,
}: {
  action: ReasonedAction | null
  onOpenChange: (open: boolean) => void
  children?: ReactNode
}) {
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(false)

  const close = () => {
    setReason("")
    setPending(false)
    onOpenChange(false)
  }

  const confirm = async () => {
    if (!action || pending) return
    setPending(true)
    try {
      await action.onConfirm(reason.trim())
      close()
    } catch {
      setPending(false)
    }
  }

  const reasonInvalid = Boolean(
    action?.requireReason && reason.trim().length < 8,
  )
  const destructive = Boolean(action?.destructive)
  const Icon = destructive ? ShieldAlert : AlertTriangle

  return (
    <Dialog
      open={Boolean(action)}
      onOpenChange={(open) => {
        if (pending) return
        if (!open) close()
      }}
    >
      <DialogContent showClose={!pending} className="max-w-lg">
        <DialogHeader>
          <div
            className={cn(
              "mb-2 grid size-12 place-items-center rounded-2xl border",
              destructive
                ? "border-destructive/15 bg-destructive/8 text-destructive"
                : "border-warning/15 bg-warning/8 text-warning",
            )}
          >
            <Icon className="size-5" />
          </div>
          <DialogTitle>{action?.title}</DialogTitle>
          <DialogDescription>{action?.description}</DialogDescription>
        </DialogHeader>

        {children ? (
          <div className="border-border/80 bg-muted/25 rounded-2xl border p-4">
            {children}
          </div>
        ) : null}

        {action?.requireReason ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <MessageSquareText className="text-primary size-4" />
                {action.reasonLabel ?? "Reason"}
              </label>
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  reasonInvalid ? "text-warning" : "text-muted-foreground",
                )}
              >
                {reason.trim().length}/8 minimum
              </span>
            </div>
            <Textarea
              value={reason}
              disabled={pending}
              aria-invalid={reasonInvalid && reason.length > 0}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                action.reasonPlaceholder ??
                "Explain the decision clearly so it is understandable later…"
              }
              rows={4}
              className="min-h-28 resize-y"
            />
            <p className="text-muted-foreground text-xs leading-5">
              This note helps maintain context for future reviews and account
              activity.
            </p>
          </div>
        ) : null}

        {destructive ? (
          <div className="border-destructive/15 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-xs leading-5">
            This action can remove or permanently change data. Confirm that the
            selected item and reason are correct.
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => close()}
          >
            {action?.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={reasonInvalid || pending}
            onClick={() => void confirm()}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {action?.pendingLabel ?? "Processing..."}
              </>
            ) : (
              action?.confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
