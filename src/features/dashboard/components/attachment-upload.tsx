"use client"

import { FileText, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { FileInput } from "@/components/ui/file-input"
import { PortalInlineAlert } from "@/features/dashboard/components/portal-form-layout"
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
    <div className="space-y-3" aria-busy={loading}>
      <FileInput
        accept=".pdf,.doc,.docx,.xlsx,.csv,.jpg,.jpeg,.png,application/pdf"
        multiple
        label={t("dashboard.create.uploadAttachments")}
        description={t("dashboard.create.uploadHint")}
        loading={loading}
        onFilesSelected={(files) => {
          if (!files?.length || loading) return
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

      {assets.length ? (
        <ul className="border-border/80 divide-border/70 divide-y overflow-hidden rounded-xl border">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="bg-card flex min-w-0 items-center gap-3 px-3.5 py-2.5"
            >
              <span className="border-primary/10 bg-primary/8 text-primary grid size-9 shrink-0 place-items-center rounded-xl border">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-foreground ltr-content truncate text-sm font-medium"
                  title={asset.name}
                >
                  {asset.name}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase">
                  {asset.usage ?? "DOCUMENT"}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive hover:bg-destructive/8 hover:text-destructive shrink-0"
                disabled={loading}
                onClick={() =>
                  onChange(assets.filter((item) => item.id !== asset.id))
                }
                aria-label={`${t("common.remove")} ${asset.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <PortalInlineAlert tone="error">{error}</PortalInlineAlert>
      ) : null}
    </div>
  )
}
