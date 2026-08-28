"use client"

import {
  CalendarClock,
  Eye,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ReasonConfirmationDialog } from "@/components/feedback/reason-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Field } from "@/components/ui/field"
import { FileInput } from "@/components/ui/file-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  deletePortalUploadAction,
  getPortalUploadDownloadAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalDocument } from "@/features/dashboard/data/portal-client"
import { uploadPortalFile } from "@/features/dashboard/data/upload-portal-file"
import { AssetPreviewDialog } from "@/features/onboarding/components/asset-preview-dialog"
import { expiryRequiredForDocument } from "@/features/onboarding/schemas/onboarding.schemas"
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/shared/constants/platform"

const documentTypes = [
  "identity",
  "certificate",
  "license",
  "trade_proof",
  "professional_proof",
  "company_authorization",
  "registration",
  "vat_proof",
  "other",
] as const

type DocumentType = (typeof documentTypes)[number]

function normalizeDocumentType(value: string | null) {
  const normalized = (value ?? "other").toLowerCase()
  return (documentTypes as readonly string[]).includes(normalized)
    ? (normalized as DocumentType)
    : "other"
}

async function resolvePortalUploadUrl(assetId: string) {
  const result = await getPortalUploadDownloadAction(assetId)
  if (!result.ok) throw new Error(result.message)
  return { url: result.file.url, mimeType: result.file.mimeType }
}

export function ProfileDocumentsManager({
  documents,
}: {
  documents: PortalDocument[]
}) {
  const t = useTranslations()
  const [items, setItems] = useState(documents)
  const [showEditor, setShowEditor] = useState(documents.length === 0)
  const [replaceTargetId, setReplaceTargetId] = useState<string>()
  const [deleteTarget, setDeleteTarget] = useState<PortalDocument>()
  const [documentType, setDocumentType] = useState<DocumentType>("identity")
  const [issuedAt, setIssuedAt] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [selectedFile, setSelectedFile] = useState<File>()
  const [fileError, setFileError] = useState<string>()
  const [actionError, setActionError] = useState<string>()
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string>()
  const [previewId, setPreviewId] = useState<string>()

  const previewDocument = items.find((item) => item.id === previewId)

  function chooseFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setFileError(undefined)
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setSelectedFile(undefined)
      setFileError(t("dashboard.profileDocuments.fileType"))
      return
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      setSelectedFile(undefined)
      setFileError(t("dashboard.profileDocuments.fileSize"))
      return
    }
    setSelectedFile(file)
  }

  function resetEditor() {
    setSelectedFile(undefined)
    setFileError(undefined)
    setIssuedAt("")
    setExpiresAt("")
    setDocumentType("identity")
    setReplaceTargetId(undefined)
  }

  function openReplace(document: PortalDocument) {
    setReplaceTargetId(document.id)
    setDocumentType(normalizeDocumentType(document.documentType))
    setIssuedAt(document.issuedAt ?? "")
    setExpiresAt(document.expiresAt ?? "")
    setShowEditor(true)
  }

  async function submitUpload() {
    if (!selectedFile) {
      setFileError(t("dashboard.profileDocuments.fileRequired"))
      return
    }
    if (expiryRequiredForDocument(documentType) && !expiresAt) {
      setFileError(t("dashboard.profileDocuments.expiryRequired"))
      return
    }

    setUploading(true)
    setActionError(undefined)
    try {
      const uploaded = await uploadPortalFile(selectedFile, {
        documentType,
        expiresAt: expiresAt || undefined,
        issuedAt: issuedAt || undefined,
      })
      if (replaceTargetId) await deletePortalUploadAction(replaceTargetId)

      const created: PortalDocument = {
        id: uploaded.id,
        originalName: selectedFile.name,
        documentType: uploaded.documentType ?? documentType,
        purpose: uploaded.purpose ?? "document",
        issuedAt: issuedAt || null,
        expiresAt: expiresAt || null,
        status: uploaded.status,
        expiryRequired: expiryRequiredForDocument(documentType),
        expiryMissing: expiryRequiredForDocument(documentType) && !expiresAt,
      }
      setItems((current) => [
        created,
        ...current.filter((item) => item.id !== replaceTargetId),
      ])
      resetEditor()
      setShowEditor(false)
    } catch {
      setActionError(t("dashboard.profileDocuments.uploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  async function removeDocument(id: string) {
    setBusyId(id)
    setActionError(undefined)
    const result = await deletePortalUploadAction(id)
    setBusyId(undefined)
    if (!result.ok) {
      setActionError(result.message)
      throw new Error(result.message)
    }
    setItems((current) => current.filter((item) => item.id !== id))
    if (replaceTargetId === id) resetEditor()
    setDeleteTarget(undefined)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">
          {t("dashboard.profileDocuments.description")}
        </p>
        {!showEditor ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => {
              resetEditor()
              setShowEditor(true)
            }}
          >
            <Plus className="size-4" />
            {t("dashboard.profileDocuments.add")}
          </Button>
        ) : null}
      </div>

      {actionError ? (
        <div
          role="alert"
          className="border-destructive/15 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {showEditor ? (
        <section className="surface-panel overflow-hidden rounded-[1.5rem]">
          <div className="bg-muted/22 flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-foreground text-lg font-semibold tracking-[-0.02em]">
                {replaceTargetId
                  ? t("dashboard.profileDocuments.replaceTitle")
                  : t("dashboard.profileDocuments.addTitle")}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {replaceTargetId
                  ? t("dashboard.profileDocuments.replaceHint")
                  : t("dashboard.profileDocuments.addHint")}
              </p>
            </div>
            {items.length ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label={t("dashboard.profileDocuments.cancel")}
                disabled={uploading}
                onClick={() => {
                  resetEditor()
                  setShowEditor(false)
                }}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-3">
              <Field
                label={t("dashboard.profileDocuments.documentType")}
                htmlFor="portal-document-type"
                required
              >
                <Select
                  value={documentType}
                  onValueChange={(value) =>
                    setDocumentType(value as DocumentType)
                  }
                >
                  <SelectTrigger id="portal-document-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`onboarding.options.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label={t("dashboard.profileDocuments.issuedAt")}
                htmlFor="portal-document-issued"
              >
                <DatePicker
                  id="portal-document-issued"
                  value={issuedAt}
                  onChange={setIssuedAt}
                  placeholder={t("onboarding.selectDate")}
                />
              </Field>
              <Field
                label={t("dashboard.profileDocuments.expiresAt")}
                htmlFor="portal-document-expires"
                required={expiryRequiredForDocument(documentType)}
                error={
                  expiryRequiredForDocument(documentType) && !expiresAt
                    ? t("dashboard.profileDocuments.expiryRequired")
                    : undefined
                }
              >
                <DatePicker
                  id="portal-document-expires"
                  value={expiresAt}
                  onChange={setExpiresAt}
                  placeholder={t("onboarding.selectDate")}
                />
              </Field>
            </div>

            <FileInput
              accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv"
              loading={uploading}
              label={
                uploading
                  ? t("dashboard.profileDocuments.uploading")
                  : (selectedFile?.name ??
                    t("dashboard.profileDocuments.chooseFile"))
              }
              description={
                selectedFile
                  ? t("onboarding.selectedFile", {
                      size: (selectedFile.size / 1024 / 1024).toFixed(2),
                    })
                  : t("dashboard.profileDocuments.fileRequirements")
              }
              onFilesSelected={chooseFile}
            />

            {fileError ? (
              <div
                role="alert"
                className="border-destructive/15 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              {items.length ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploading}
                  onClick={() => {
                    resetEditor()
                    setShowEditor(false)
                  }}
                >
                  {t("dashboard.profileDocuments.cancel")}
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={uploading}
                onClick={() => void submitUpload()}
              >
                {uploading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : replaceTargetId ? (
                  <RefreshCw className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {replaceTargetId
                  ? t("dashboard.profileDocuments.replace")
                  : t("dashboard.profileDocuments.add")}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {items.length ? (
        <ul className="grid gap-3">
          {items.map((document) => {
            const type = normalizeDocumentType(document.documentType)
            const statusLabel = document.status
              .replaceAll("_", " ")
              .toLowerCase()
            return (
              <li
                key={document.id}
                className="border-border/80 bg-card hover:border-primary/18 grid gap-3 rounded-[1.25rem] border p-4 transition-[border-color,box-shadow] hover:shadow-[var(--shadow-sm)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="border-primary/10 bg-primary/8 text-primary grid size-11 place-items-center rounded-2xl border">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-foreground ltr-content min-w-0 truncate text-sm font-semibold"
                      title={document.originalName}
                    >
                      {document.originalName}
                    </p>
                    <Badge className="min-h-6 rounded-full px-2 text-[10px]">
                      {statusLabel}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5">
                    <span>{t(`onboarding.options.${type}`)}</span>
                    {document.issuedAt ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          {t("dashboard.profileDocuments.issuedAtLabel", {
                            date: document.issuedAt,
                          })}
                        </span>
                      </>
                    ) : null}
                    {document.expiresAt ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3.5" />
                          {t("dashboard.profileDocuments.expiresAtLabel", {
                            date: document.expiresAt,
                          })}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {document.expiryMissing ? (
                    <p className="text-destructive mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                      <TriangleAlert className="size-3.5" />
                      {t("dashboard.documents.expiryMissing")}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t pt-3 sm:border-t-0 sm:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    aria-label={`${t("dashboard.profileDocuments.view")} ${document.originalName}`}
                    disabled={Boolean(busyId) || uploading}
                    onClick={() => setPreviewId(document.id)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    aria-label={`${t("dashboard.profileDocuments.replace")} ${document.originalName}`}
                    disabled={Boolean(busyId) || uploading}
                    onClick={() => openReplace(document)}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/8 hover:text-destructive rounded-xl"
                    aria-label={`${t("dashboard.profileDocuments.delete")} ${document.originalName}`}
                    disabled={Boolean(busyId) || uploading}
                    onClick={() => setDeleteTarget(document)}
                  >
                    {busyId === document.id ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : !showEditor ? (
        <div className="border-border/80 bg-muted/18 grid min-h-40 place-items-center rounded-2xl border border-dashed p-6 text-center">
          <div>
            <span className="border-primary/10 bg-primary/8 text-primary mx-auto grid size-10 place-items-center rounded-xl border">
              <FileText className="size-4" />
            </span>
            <p className="text-muted-foreground mt-3 text-sm">
              {t("dashboard.documentsEmpty")}
            </p>
          </div>
        </div>
      ) : null}

      <ReasonConfirmationDialog
        action={
          deleteTarget
            ? {
                title: `${t("dashboard.profileDocuments.delete")} ${deleteTarget.originalName}`,
                description: t("dashboard.profileDocuments.description"),
                confirmLabel: t("dashboard.profileDocuments.delete"),
                cancelLabel: t("dashboard.profileDocuments.cancel"),
                destructive: true,
                onConfirm: async () => {
                  await removeDocument(deleteTarget.id)
                },
              }
            : null
        }
        onOpenChange={(open) => {
          if (!open && !busyId) setDeleteTarget(undefined)
        }}
      />

      <AssetPreviewDialog
        asset={
          previewDocument
            ? {
                id: previewDocument.id,
                name: previewDocument.originalName,
                size: 0,
                mimeType: "application/pdf",
              }
            : undefined
        }
        open={Boolean(previewDocument)}
        onOpenChange={(open) => {
          if (!open) setPreviewId(undefined)
        }}
        resolveUrl={resolvePortalUploadUrl}
        labels={{
          preview: t("onboarding.preview"),
          loading: t("onboarding.previewLoading"),
          failed: t("onboarding.errors.previewFailed"),
          openNewTab: t("onboarding.openNewTab"),
          close: t("onboarding.closePreview"),
        }}
      />
    </div>
  )
}
