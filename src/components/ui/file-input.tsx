"use client"

import { ImagePlus, LoaderCircle, UploadCloud } from "lucide-react"
import { useId, useRef } from "react"

import { cn } from "@/lib/utils/cn"

export function FileInput({
  id,
  accept,
  multiple = false,
  label,
  description,
  variant = "document",
  disabled = false,
  loading = false,
  onFilesSelected,
  className,
}: {
  id?: string
  accept: string
  multiple?: boolean
  label: string
  description: string
  variant?: "image" | "document"
  disabled?: boolean
  loading?: boolean
  onFilesSelected: (files: FileList | null) => void
  className?: string
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const Icon = variant === "image" ? ImagePlus : UploadCloud

  function openPicker() {
    if (disabled || loading) return
    inputRef.current?.click()
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || loading}
        className={cn(
          "border-primary/40 bg-light-blue/40 hover:bg-light-blue focus:ring-primary/25 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition outline-none focus:ring-3",
          "disabled:pointer-events-none disabled:opacity-60",
          variant === "document" ? "min-h-40" : "min-h-32",
        )}
        aria-controls={inputId}
      >
        <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
          {loading ? (
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <Icon className="size-6" aria-hidden="true" />
          )}
        </span>
        <span
          className="text-brand-navy mt-3 block w-full truncate px-2 font-semibold"
          title={label}
        >
          {label}
        </span>
        <span className="text-muted mt-1 max-w-full px-2 text-xs leading-5">
          {description}
        </span>
      </button>
      <input
        ref={inputRef}
        id={inputId}
        className="sr-only"
        type="file"
        disabled={disabled || loading}
        multiple={multiple}
        accept={accept}
        onChange={(event) => {
          onFilesSelected(event.target.files)
          event.currentTarget.value = ""
        }}
      />
    </div>
  )
}
