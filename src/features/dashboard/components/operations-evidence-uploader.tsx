"use client"

import { useRef, useState } from "react"
import { Download, Paperclip, Upload } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  attachOperationsEvidenceAction,
  listOperationsEvidenceAction,
} from "@/features/dashboard/actions/operations-completion.actions"
import { getPortalUploadDownloadAction } from "@/features/dashboard/actions/portal.actions"
import { uploadPortalFile } from "@/features/dashboard/data/upload-portal-file"

type Evidence = {
  id: string
  label: string | null
  asset: {
    id: string
    originalName: string
    mimeType: string
    sizeBytes: string
    status: string
  }
}

export function OperationsEvidenceUploader({
  companyId,
  projectId,
  entityType,
  entityId,
}: {
  companyId: string
  projectId?: string
  entityType: string
  entityId: string
}) {
  const t = useTranslations("operations.completion")
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Evidence[]>([])
  async function load() {
    try {
      setItems(
        (await listOperationsEvidenceAction(companyId, entityType, entityId))
          .items,
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("evidenceLoadFailed"),
      )
    }
  }
  async function upload(file?: File) {
    if (!file) return
    setPending(true)
    try {
      const asset = await uploadPortalFile(file, { documentType: "other" })
      await attachOperationsEvidenceAction(companyId, {
        projectId,
        entityType,
        entityId,
        assetId: asset.id,
        label: file.name,
      })
      await load()
      toast.success(t("evidenceAttached"))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("evidenceUploadFailed"),
      )
    } finally {
      setPending(false)
      if (input.current) input.current.value = ""
    }
  }
  async function download(assetId: string) {
    const result = await getPortalUploadDownloadAction(assetId)
    if (!result.ok) return toast.error(result.message)
    window.open(result.file.url, "_blank", "noopener,noreferrer")
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) void load()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Paperclip className="size-3.5" />
          {t("evidence")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("privateEvidence")}</DialogTitle>
          <DialogDescription>
            {t("privateEvidenceDescription")}
          </DialogDescription>
        </DialogHeader>
        <input
          ref={input}
          type="file"
          hidden
          accept="image/jpeg,image/png,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button
          className="mt-4"
          variant="secondary"
          disabled={pending}
          onClick={() => input.current?.click()}
        >
          <Upload className="size-4" />
          {pending ? t("uploading") : t("attachEvidence")}
        </Button>
        <div className="mt-4 grid gap-2">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.label || item.asset.originalName}
                  </p>
                  <p className="text-muted text-xs">
                    {item.asset.mimeType} ·{" "}
                    {Math.ceil(Number(item.asset.sizeBytes) / 1024)} KB
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void download(item.asset.id)}
                >
                  <Download className="size-3.5" />
                  {t("open")}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted rounded-xl border border-dashed p-5 text-center text-sm">
              {t("noEvidence")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
