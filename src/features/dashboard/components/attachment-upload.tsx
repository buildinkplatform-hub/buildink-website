"use client"

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
                uploaded.push(await uploadPortalFile(file))
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
        <p key={asset.id} className="text-muted text-xs">
          {asset.name}
        </p>
      ))}
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </div>
  )
}
