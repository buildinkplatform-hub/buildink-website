import * as Label from "@radix-ui/react-label"
import type { ReactNode } from "react"

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label.Root
        className="text-brand-navy text-sm font-semibold"
        htmlFor={htmlFor}
      >
        {label}
        {required ? (
          <span className="text-danger ms-1" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label.Root>
      {children}
      {hint && !error ? <p className="text-muted text-xs">{hint}</p> : null}
      {error ? (
        <p className="text-danger text-sm" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
