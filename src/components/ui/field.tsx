import * as Label from "@radix-ui/react-label"
import { CircleAlert, Info } from "lucide-react"
import type { ReactNode } from "react"

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  hideLabel = false,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  hideLabel?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      {hideLabel ? null : (
        <div className="flex items-baseline justify-between gap-3">
          <Label.Root
            className="text-foreground text-sm font-semibold"
            htmlFor={htmlFor}
          >
            {label}
            {required ? (
              <span className="text-destructive ms-1" aria-hidden="true">
                *
              </span>
            ) : null}
          </Label.Root>
          {!required ? (
            <span className="text-muted-foreground text-[10px] font-medium uppercase">
              Optional
            </span>
          ) : null}
        </div>
      )}
      {children}
      {hint && !error ? (
        <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-5">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>{hint}</span>
        </p>
      ) : null}
      {error ? (
        <p
          className="text-destructive flex items-start gap-1.5 text-xs leading-5 font-medium"
          id={`${htmlFor}-error`}
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}
