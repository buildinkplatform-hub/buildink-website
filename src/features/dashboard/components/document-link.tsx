"use client"

import { Eye } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { getPortalUploadDownloadAction } from "@/features/dashboard/actions/portal.actions"
import { AssetPreviewDialog } from "@/features/onboarding/components/asset-preview-dialog"

export function DocumentLink({
  assetId,
  label,
}: {
  assetId: string
  label: string
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [asset, setAsset] = useState<{
    id: string
    name: string
    size: number
    mimeType: string
    purpose: "document"
    status: string
  }>()

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-label={t("dashboard.documents.viewDocument", { name: label })}
        onClick={() => {
          setAsset({
            id: assetId,
            name: label,
            size: 0,
            mimeType: "",
            purpose: "document",
            status: "UPLOADED",
          })
          setOpen(true)
        }}
      >
        <Eye className="size-4" />
        <span className="hidden sm:inline">
          {t("dashboard.documents.view")}
        </span>
      </Button>
      <AssetPreviewDialog
        asset={asset}
        open={open}
        onOpenChange={setOpen}
        labels={{
          preview: t("dashboard.documents.preview"),
          loading: t("dashboard.documents.loading"),
          failed: t("dashboard.documents.failed"),
          openNewTab: t("dashboard.documents.openNewTab"),
          close: t("dashboard.documents.close"),
        }}
        resolveUrl={async (id) => {
          const result = await getPortalUploadDownloadAction(id)
          if (!result.ok || !("file" in result) || !result.file) {
            throw new Error("DOCUMENT_PREVIEW_FAILED")
          }
          return {
            url: result.file.url,
            mimeType: result.file.mimeType,
          }
        }}
      />
    </>
  )
}
