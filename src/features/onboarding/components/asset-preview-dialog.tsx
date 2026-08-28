"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ExternalLink,
  FileQuestion,
  FileText,
  ImageIcon,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react"
import Image from "next/image"
import { startTransition, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { getUploadDownloadUrlAction } from "@/features/onboarding/actions/onboarding.actions"
import type { OnboardingFile } from "@/shared/types/platform"

export function AssetPreviewDialog({
  asset,
  open,
  onOpenChange,
  localUrl,
  labels,
  resolveUrl,
}: {
  asset?: OnboardingFile
  open: boolean
  onOpenChange: (open: boolean) => void
  localUrl?: string
  labels: {
    preview: string
    loading: string
    failed: string
    openNewTab: string
    close: string
  }
  resolveUrl?: (assetId: string) => Promise<{ url: string; mimeType?: string }>
}) {
  const [resolved, setResolved] = useState<{
    assetId: string
    url: string
    mimeType?: string
  }>()
  const [failedAssetId, setFailedAssetId] = useState<string>()

  useEffect(() => {
    if (!open || !asset || localUrl) return

    let active = true
    const fetchUrl = resolveUrl
      ? () => resolveUrl(asset.id)
      : () => getUploadDownloadUrlAction(asset.id)
    startTransition(() => {
      void fetchUrl()
        .then((result) => {
          if (active) {
            setResolved({
              assetId: asset.id,
              url: result.url,
              mimeType: result.mimeType,
            })
            setFailedAssetId(undefined)
          }
        })
        .catch(() => {
          if (active) setFailedAssetId(asset.id)
        })
    })

    return () => {
      active = false
    }
  }, [asset, localUrl, open, resolveUrl])

  const url =
    localUrl ?? (resolved?.assetId === asset?.id ? resolved?.url : undefined)
  const failed = failedAssetId === asset?.id
  const loading = Boolean(open && asset && !url && !failed)
  const mimeType =
    resolved?.assetId === asset?.id ? resolved?.mimeType : undefined
  const effectiveMimeType = mimeType ?? asset?.mimeType ?? ""
  const isImage = effectiveMimeType.startsWith("image/")
  const isPdf = effectiveMimeType === "application/pdf"
  const PreviewIcon = isImage ? ImageIcon : isPdf ? FileText : FileQuestion

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[110] bg-slate-950/78 backdrop-blur-md duration-200 motion-reduce:animate-none" />
        <DialogPrimitive.Content className="bg-card data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-2 z-[120] flex flex-col overflow-hidden rounded-[1.4rem] border border-white/10 shadow-[0_36px_120px_rgb(0_0_0/0.42)] duration-200 outline-none motion-reduce:animate-none sm:inset-5 sm:rounded-[1.75rem] lg:inset-8">
          <div className="border-border/70 bg-card/95 flex min-h-16 items-center gap-3 border-b px-3 backdrop-blur sm:px-5">
            <span className="bg-primary/8 text-primary grid size-9 shrink-0 place-items-center rounded-xl">
              <PreviewIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-foreground ltr-content truncate text-sm font-semibold sm:text-base">
                {asset?.name ?? labels.preview}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                <span>{labels.preview}</span>
                {effectiveMimeType ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{effectiveMimeType}</span>
                  </>
                ) : null}
              </DialogPrimitive.Description>
            </div>
            {url ? (
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="shrink-0 px-2 sm:px-3"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={labels.openNewTab}
                >
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">{labels.openNewTab}</span>
                </a>
              </Button>
            ) : null}
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary/20 grid size-10 shrink-0 place-items-center rounded-xl transition-colors outline-none focus-visible:ring-3"
                aria-label={labels.close}
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_50%_0%,rgb(23_107_255/0.08),transparent_32rem),#eef2f7] p-2 sm:p-4 dark:bg-[radial-gradient(circle_at_50%_0%,rgb(23_107_255/0.12),transparent_32rem),#050b14]">
            {loading ? (
              <div className="bg-card/90 border-border flex max-w-sm flex-col items-center rounded-2xl border px-6 py-7 text-center shadow-[var(--shadow-card)]">
                <span className="bg-primary/8 text-primary grid size-12 place-items-center rounded-2xl">
                  <LoaderCircle className="size-5 animate-spin" />
                </span>
                <p className="text-foreground mt-3 text-sm font-semibold">
                  {labels.loading}
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  Preparing a secure preview of this file.
                </p>
              </div>
            ) : failed || !asset ? (
              <div
                className="bg-card/90 border-destructive/15 flex max-w-sm flex-col items-center rounded-2xl border px-6 py-7 text-center shadow-[var(--shadow-card)]"
                role="alert"
              >
                <span className="bg-destructive/8 text-destructive grid size-12 place-items-center rounded-2xl">
                  <TriangleAlert className="size-5" />
                </span>
                <p className="text-foreground mt-3 text-sm font-semibold">
                  {labels.failed}
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  The preview link may have expired. Close this viewer and try
                  opening the file again.
                </p>
              </div>
            ) : url && isImage ? (
              <div className="relative size-full min-h-72 overflow-hidden rounded-xl">
                <Image
                  src={url}
                  alt={asset.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                />
              </div>
            ) : url && isPdf ? (
              <iframe
                src={url}
                title={asset.name}
                className="bg-card border-border size-full min-h-[70vh] rounded-xl border shadow-[var(--shadow-card)]"
              />
            ) : url ? (
              <div className="bg-card border-border max-w-sm rounded-2xl border p-6 text-center shadow-[var(--shadow-card)]">
                <span className="bg-primary/8 text-primary mx-auto grid size-12 place-items-center rounded-2xl">
                  <FileQuestion className="size-5" />
                </span>
                <p className="text-foreground mt-3 font-semibold">
                  Preview is not available for this file type.
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Open the document in a new tab to view it with the appropriate
                  application.
                </p>
                <Button asChild className="mt-4">
                  <a href={url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    {labels.openNewTab}
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
