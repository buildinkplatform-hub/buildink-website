"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { getPortalUploadDownloadAction } from "@/features/dashboard/actions/portal.actions"

export function DocumentLink({
  assetId,
  label,
}: {
  assetId: string
  label: string
}) {
  const t = useTranslations()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      className="text-primary text-sm font-semibold"
      disabled={pending}
      onClick={() => {
        setPending(true)
        void getPortalUploadDownloadAction(assetId).then((result) => {
          setPending(false)
          if (result.ok && "file" in result && result.file) {
            window.open(result.file.url, "_blank", "noopener,noreferrer")
          }
        })
      }}
    >
      {pending ? t("dashboard.documents.opening") : label}
    </button>
  )
}
