"use client"

import Image from "next/image"
import { ExternalLink, Expand, FileText, Images } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils/cn"
import type { PublicMediaAsset } from "@/features/public/types/public.types"

export function PublicMediaGallery({
  title,
  gallery,
  documents,
}: {
  title: string
  gallery?: PublicMediaAsset[]
  documents?: PublicMediaAsset[]
}) {
  const images = gallery ?? []
  const files = documents ?? []
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = images[selectedIndex] ?? images[0] ?? null

  if (!images.length && !files.length) return null

  return (
    <div className="space-y-6">
      {images.length ? (
        <Card className="surface-panel overflow-hidden rounded-[1.75rem] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-foreground text-lg font-bold tracking-[-0.02em]">
                {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Browse verified images shared for this listing.
              </p>
            </div>
            <Badge className="rounded-full">
              <Images className="size-3.5" />
              {images.length} image{images.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {selected ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group border-border bg-muted/20 relative block h-64 w-full overflow-hidden rounded-[1.4rem] border text-start sm:h-80"
                >
                  <Image
                    src={selected.url}
                    alt={selected.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    unoptimized
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-slate-950/70 to-transparent p-4 pt-14 text-white">
                    <span className="min-w-0 truncate text-sm font-semibold">
                      {selected.name}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/14 backdrop-blur">
                      <Expand className="size-4" />
                    </span>
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-1rem)] max-w-6xl p-3 sm:p-4">
                <DialogHeader className="px-1">
                  <DialogTitle>{selected.name}</DialogTitle>
                </DialogHeader>
                <div className="relative mt-1 h-[min(76vh,760px)] overflow-hidden rounded-[1.25rem] bg-slate-950">
                  <Image
                    src={selected.url}
                    alt={selected.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          <div className="scrollbar-styled mt-4 flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show ${image.name}`}
                aria-pressed={index === selectedIndex}
                className={cn(
                  "border-border bg-muted/20 focus-visible:ring-primary/20 relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition-[box-shadow,border-color,transform] outline-none focus-visible:ring-3 sm:h-24 sm:w-36",
                  index === selectedIndex
                    ? "border-primary/40 ring-primary/15 ring-3"
                    : "hover:border-primary/20 hover:-translate-y-0.5",
                )}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {files.length ? (
        <Card className="surface-panel rounded-[1.75rem] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-foreground text-lg font-bold tracking-[-0.02em]">
                Public documents
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Approved files shared on this public page.
              </p>
            </div>
            <Badge className="rounded-full">
              <FileText className="size-3.5" />
              {files.length} file{files.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="grid gap-3">
            {files.map((file) => {
              const previewable =
                file.mimeType.includes("pdf") ||
                file.mimeType.startsWith("image/")
              return (
                <div
                  key={file.id}
                  className="border-border/80 bg-muted/18 hover:border-primary/20 flex flex-col gap-3 rounded-[1.25rem] border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="border-primary/10 bg-primary/8 text-primary grid size-10 shrink-0 place-items-center rounded-xl border">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground ltr-content truncate text-sm font-semibold">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {file.mimeType || "Document"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {previewable ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" size="sm" variant="secondary">
                            <Expand className="size-4" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100%-1rem)] max-w-6xl p-3 sm:p-4">
                          <DialogHeader className="px-1">
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="border-border bg-card mt-1 h-[min(76vh,780px)] overflow-hidden rounded-[1.25rem] border">
                            {file.mimeType.startsWith("image/") ? (
                              <div className="relative h-full w-full bg-slate-950">
                                <Image
                                  src={file.url}
                                  alt={file.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <iframe
                                src={file.url}
                                title={file.name}
                                className="h-full w-full"
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                    <Button asChild size="sm" variant="secondary">
                      <a href={file.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
