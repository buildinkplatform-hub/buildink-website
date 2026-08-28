"use client"

import { useTransition } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { exportPayrollAction } from "@/features/dashboard/actions/operations-completion.actions"

export function PayrollExportActions({
  companyId,
  periodId,
}: {
  companyId: string
  periodId: string
}) {
  const t = useTranslations("operations.completion")
  const [pending, startTransition] = useTransition()
  function download(format: "csv" | "pdf") {
    startTransition(async () => {
      try {
        const file = await exportPayrollAction(companyId, periodId, format)
        const bytes = Uint8Array.from(atob(file.contentBase64), (character) =>
          character.charCodeAt(0),
        )
        const url = URL.createObjectURL(
          new Blob([bytes], { type: file.mimeType }),
        )
        const link = document.createElement("a")
        link.href = url
        link.download = file.fileName
        link.click()
        URL.revokeObjectURL(url)
        toast.success(t("exportDownloaded", { format: format.toUpperCase() }))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("exportFailed"))
      }
    })
  }
  return (
    <div className="flex flex-wrap gap-1">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => download("csv")}
      >
        <Download className="size-3.5" />
        CSV
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => download("pdf")}
      >
        <Download className="size-3.5" />
        PDF
      </Button>
    </div>
  )
}
