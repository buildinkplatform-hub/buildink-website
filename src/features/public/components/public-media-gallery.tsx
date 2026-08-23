"use client"

import Image from "next/image"
import { FileText, Images } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
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
        <Card className="overflow-hidden rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-brand-navy text-lg font-bold">{title}</h3>
              <p className="text-muted mt-1 text-sm">Public image gallery</p>
            </div>
            <Badge>
              <Images className="size-3.5" />
              {images.length}
            </Badge>
          </div>
          {selected ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative block h-72 w-full overflow-hidden rounded-[24px] border border-white/70 bg-slate-50 text-start"
                >
                  <Image
                    src={selected.url}
                    alt={selected.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    unoptimized
                  />
                </button>
              </DialogTrigger>
              <DialogContent className="w-[min(calc(100%-2rem),72rem)] max-w-none p-4 sm:p-5">
                <DialogHeader>
                  <DialogTitle>{selected.name}</DialogTitle>
                </DialogHeader>
                <div className="relative mt-4 h-[70vh] overflow-hidden rounded-[24px] bg-slate-950/95">
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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative h-24 overflow-hidden rounded-[18px] border border-white/70 bg-slate-50",
                  index === selectedIndex && "ring-2 ring-primary/30",
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
        <Card className="rounded-[30px] border-white/70 p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-brand-navy text-lg font-bold">Public documents</h3>
              <p className="text-muted mt-1 text-sm">Approved files shared on this public page</p>
            </div>
            <Badge>
              <FileText className="size-3.5" />
              {files.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {files.map((file) => {
              const previewable =
                file.mimeType.includes("pdf") || file.mimeType.startsWith("image/")
              return (
                <div
                  key={file.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f8fbff_100%)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-brand-navy truncate text-sm font-semibold">
                      {file.name}
                    </p>
                    <p className="text-muted mt-1 text-xs">{file.mimeType}</p>
                  </div>
                  <div className="flex gap-2">
                    {previewable ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-brand-navy">
                            View
                          </button>
                        </DialogTrigger>
                        <DialogContent className="w-[min(calc(100%-2rem),72rem)] max-w-none p-4 sm:p-5">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 h-[75vh] overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                            {file.mimeType.startsWith("image/") ? (
                              <div className="relative h-full w-full">
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
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-brand-navy"
                    >
                      Open
                    </a>
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
