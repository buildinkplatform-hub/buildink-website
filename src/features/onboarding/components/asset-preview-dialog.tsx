"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ExternalLink, LoaderCircle, X } from "lucide-react"
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
}) {
  const [resolved, setResolved] = useState<{
    assetId: string
    url: string
  }>()
  const [failedAssetId, setFailedAssetId] = useState<string>()

  useEffect(() => {
    if (!open || !asset || localUrl) return

    let active = true
    startTransition(() => {
      void getUploadDownloadUrlAction(asset.id)
        .then((result) => {
          if (active) {
            setResolved({ assetId: asset.id, url: result.url })
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
  }, [asset, localUrl, open])

  const url =
    localUrl ??
    (resolved?.assetId === asset?.id ? resolved?.url : undefined)
  const failed = failedAssetId === asset?.id
  const loading = Boolean(open && asset && !url && !failed)
  const isImage = asset?.mimeType.startsWith("image/")
  const isPdf = asset?.mimeType === "application/pdf"

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm" />
        <DialogPrimitive.Content className="bg-surface fixed inset-4 z-[100] flex flex-col overflow-hidden rounded-2xl shadow-2xl outline-none sm:inset-8">
          <div className="border-line flex min-h-16 items-center gap-3 border-b px-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-brand-navy truncate font-semibold">
                {asset?.name ?? labels.preview}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-muted text-xs">
                {labels.preview}
              </DialogPrimitive.Description>
            </div>
            {url ? (
              <Button asChild size="sm" variant="secondary">
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">{labels.openNewTab}</span>
                </a>
              </Button>
            ) : null}
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="text-muted hover:bg-light-blue hover:text-brand-navy flex size-10 items-center justify-center rounded-lg"
                aria-label={labels.close}
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="bg-slate-100 relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-5">
            {loading ? (
              <div className="text-muted flex items-center gap-2 text-sm">
                <LoaderCircle className="text-primary size-5 animate-spin" />
                {labels.loading}
              </div>
            ) : failed || !asset ? (
              <p className="text-danger text-sm" role="alert">
                {labels.failed}
              </p>
            ) : url && isImage ? (
              <div className="relative size-full min-h-72">
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
                className="size-full min-h-[70vh] rounded-lg bg-white"
              />
            ) : url ? (
              <div className="text-center">
                <p className="text-muted mb-4 text-sm">{labels.preview}</p>
                <Button asChild>
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
