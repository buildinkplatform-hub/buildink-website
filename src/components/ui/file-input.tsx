"use client"

import {
  FileUp,
  ImagePlus,
  LoaderCircle,
  MousePointerClick,
  UploadCloud,
} from "lucide-react"
import { useId, useRef, useState } from "react"

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
  const [dragActive, setDragActive] = useState(false)
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
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled && !loading) setDragActive(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !loading) setDragActive(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setDragActive(false)
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          if (disabled || loading) return
          onFilesSelected(event.dataTransfer.files)
        }}
        disabled={disabled || loading}
        className={cn(
          "border-primary/25 bg-primary/[0.025] hover:border-primary/45 hover:bg-primary/[0.045] focus-visible:ring-primary/15 relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border border-dashed p-6 text-center transition-[border-color,background-color,box-shadow,transform] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none",
          variant === "document" ? "min-h-44" : "min-h-36",
          dragActive &&
            "border-primary bg-primary/[0.07] ring-primary/10 scale-[1.005] ring-4",
        )}
        aria-controls={inputId}
      >
        <span
          aria-hidden
          className="bg-primary/6 pointer-events-none absolute -end-12 -top-12 size-36 rounded-full blur-3xl"
        />
        <span className="border-primary/10 bg-card text-primary relative flex size-12 items-center justify-center rounded-2xl border shadow-[0_8px_20px_rgb(23_107_255/0.08)]">
          {loading ? (
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          ) : dragActive ? (
            <FileUp className="size-6" aria-hidden="true" />
          ) : (
            <Icon className="size-6" aria-hidden="true" />
          )}
        </span>
        <span
          className="text-foreground relative mt-3 block w-full truncate px-2 font-semibold"
          title={label}
        >
          {dragActive ? "Drop files to upload" : label}
        </span>
        <span className="text-muted-foreground relative mt-1 max-w-xl px-2 text-xs leading-5">
          {description}
        </span>
        {!loading ? (
          <span className="border-border bg-card text-foreground relative mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs">
            <MousePointerClick className="text-primary size-3.5" />
            Browse files
          </span>
        ) : (
          <span className="text-primary relative mt-4 text-xs font-semibold">
            Upload in progress…
          </span>
        )}
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
