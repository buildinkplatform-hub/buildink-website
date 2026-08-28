"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import { FileInput } from "@/components/ui/file-input"
import { uploadPortalFile } from "@/features/dashboard/data/upload-portal-file"

export function AttachmentUpload({
  assets,
  onChange,
}: {
  assets: Array<{
    id: string
    name: string
    usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
  }>
  onChange: (
    assets: Array<{
      id: string
      name: string
      usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
    }>,
  ) => void
}) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  return (
    <div className="space-y-2">
      <FileInput
        accept=".pdf,.doc,.docx,.xlsx,.csv,.jpg,.jpeg,.png,application/pdf"
        multiple
        label={t("dashboard.create.uploadAttachments")}
        description={t("dashboard.create.uploadHint")}
        loading={loading}
        onFilesSelected={(files) => {
          if (!files?.length) return
          setLoading(true)
          setError(undefined)
          void (async () => {
            try {
              const uploaded: Array<{
                id: string
                name: string
                usage?: "IMAGE" | "DOCUMENT" | "LOGO" | "COVER"
              }> = []
              for (const file of Array.from(files)) {
                const asset = await uploadPortalFile(file, {
                  documentType: "other",
                })
                uploaded.push({
                  id: asset.id,
                  name: asset.originalName ?? file.name,
                  usage: "DOCUMENT",
                })
              }
              onChange([...assets, ...uploaded])
            } catch (caught) {
              setError(
                caught instanceof Error
                  ? caught.message
                  : t("dashboard.create.uploadError"),
              )
            } finally {
              setLoading(false)
            }
          })()
        }}
      />
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center justify-between gap-2 text-xs"
        >
          <p className="text-muted truncate">{asset.name}</p>
          <button
            type="button"
            className="text-danger inline-flex shrink-0 items-center gap-1 font-medium hover:underline"
            onClick={() =>
              onChange(assets.filter((item) => item.id !== asset.id))
            }
            aria-label={`${t("common.remove")} ${asset.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {t("common.remove")}
          </button>
        </div>
      ))}
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </div>
  )
}
