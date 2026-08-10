"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Eye,
  FileText,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Field } from "@/components/ui/field"
import { FileInput } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteUploadAction } from "@/features/onboarding/actions/onboarding.actions"
import { AssetPreviewDialog } from "@/features/onboarding/components/asset-preview-dialog"
import { uploadOnboardingFile } from "@/features/onboarding/data/upload-file"
import {
  documentMetadataSchema,
  type DocumentMetadata,
} from "@/features/onboarding/schemas/onboarding.schemas"
import { Link, useRouter } from "@/i18n/navigation"
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/shared/constants/platform"
import type { CountryOption, OnboardingDocument } from "@/shared/types/platform"
import { OnboardingFrame } from "./onboarding-frame"
import { useOnboardingDraft } from "./onboarding-provider"

const documentTypes = [
  "identity",
  "certificate",
  "license",
  "company_authorization",
  "trade_proof",
  "professional_proof",
  "registration",
  "vat_proof",
  "other",
] as const

export function DocumentsForm({ countries }: { countries: CountryOption[] }) {
  const t = useTranslations()
  const router = useRouter()
  const { draft, updateDraft } = useOnboardingDraft()
  const [fileError, setFileError] = useState<string>()
  const [selectedFile, setSelectedFile] = useState<File>()
  const [showEditor, setShowEditor] = useState(
    () => draft.documents.length === 0,
  )
  const [uploading, setUploading] = useState(false)
  const [removingId, setRemovingId] = useState<string>()
  const [deleteError, setDeleteError] = useState<string>()
  const [continuePending, setContinuePending] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<OnboardingDocument>()
  const {
    control,
    register,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm<DocumentMetadata>({
    resolver: zodResolver(documentMetadataSchema),
    defaultValues: {
      documentType: "identity",
      expiryDate: "",
      issuingCountry: "IT",
      ownerName: draft.account.name,
    },
  })

  function chooseFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setFileError(undefined)
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setSelectedFile(undefined)
      setFileError(t("onboarding.errors.fileType"))
      return
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      setSelectedFile(undefined)
      setFileError(t("onboarding.errors.fileSize"))
      return
    }
    setSelectedFile(file)
  }

  async function uploadDocument() {
    if (!selectedFile) {
      setFileError(t("onboarding.errors.fileRequired"))
      return
    }
    const valid = await trigger()
    if (!valid) return
    const metadata = documentMetadataSchema.safeParse(getValues())
    if (!metadata.success) return

    setUploading(true)
    setFileError(undefined)
    try {
      const id = await uploadOnboardingFile(selectedFile, {
        kind: "document",
        purpose: "document",
        documentType: metadata.data.documentType,
        ownerName: metadata.data.ownerName,
        issuingCountry: metadata.data.issuingCountry,
        expiresAt: metadata.data.expiryDate,
      })
      const document: OnboardingDocument = {
        id,
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type,
        purpose: "document",
        status: "uploaded",
        ...metadata.data,
      }
      updateDraft({ documents: [...draft.documents, document] })
      setSelectedFile(undefined)
      reset({
        documentType: "identity",
        expiryDate: "",
        issuingCountry: metadata.data.issuingCountry,
        ownerName: metadata.data.ownerName,
      })
      setShowEditor(false)
    } catch {
      setFileError(t("onboarding.errors.uploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  return (
    <OnboardingFrame step={3}>
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("onboarding.documentsTitle")}
      </h1>
      <p className="text-muted mt-3 leading-7">
        {t("onboarding.documentsBody")}
      </p>
      <div className="border-primary/20 bg-light-blue/50 mt-5 flex gap-3 rounded-xl border p-4 text-sm leading-6">
        <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
        <p>{t("onboarding.documentPrivacy")}</p>
      </div>

      {showEditor ? (
        <section className="border-line bg-surface mt-7 rounded-2xl border p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-brand-navy text-lg font-semibold">
                {t("onboarding.documentMetadataTitle")}
              </h2>
              <p className="text-muted mt-1 text-sm">
                {t("onboarding.documentMetadataBody")}
              </p>
            </div>
            {draft.documents.length ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("onboarding.cancelAddDocument")}
                disabled={uploading}
                onClick={() => {
                  setSelectedFile(undefined)
                  setFileError(undefined)
                  setShowEditor(false)
                }}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("onboarding.fields.documentType")}
              htmlFor="document-type"
              error={
                errors.documentType ? t("onboarding.errors.field") : undefined
              }
              required
            >
              <Controller
                name="documentType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="document-type" onBlur={field.onBlur}>
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
                )}
              />
            </Field>
            <Field
              label={t("onboarding.fields.expiryDate")}
              htmlFor="expiry-date"
              error={
                errors.expiryDate ? t("onboarding.errors.field") : undefined
              }
              required
            >
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="expiry-date"
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    placeholder={t("onboarding.selectDate")}
                    fromDate={new Date()}
                  />
                )}
              />
            </Field>
            <Field
              label={t("onboarding.fields.issuingCountry")}
              htmlFor="issuing-country"
              error={
                errors.issuingCountry ? t("onboarding.errors.field") : undefined
              }
              required
            >
              <Controller
                name="issuingCountry"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="issuing-country" onBlur={field.onBlur}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label={t("onboarding.fields.ownerName")}
              htmlFor="owner-name"
              error={
                errors.ownerName ? t("onboarding.errors.field") : undefined
              }
              required
            >
              <Input id="owner-name" {...register("ownerName")} />
            </Field>
          </div>

          <FileInput
            className="mt-6"
            accept=".pdf,.jpg,.jpeg,.png"
            loading={uploading}
            label={
              uploading
                ? t("onboarding.uploading")
                : (selectedFile?.name ?? t("onboarding.chooseFiles"))
            }
            description={
              selectedFile
                ? t("onboarding.selectedFile", {
                    size: (selectedFile.size / 1024 / 1024).toFixed(2),
                  })
                : t("onboarding.fileRequirements")
            }
            onFilesSelected={chooseFile}
          />
          {fileError ? (
            <p role="alert" className="text-danger mt-3 text-sm">
              {fileError}
            </p>
          ) : null}
          <div className="mt-5 flex justify-end">
            <Button type="button" disabled={uploading} onClick={uploadDocument}>
              {uploading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {uploading
                ? t("onboarding.uploading")
                : t("onboarding.addDocument")}
            </Button>
          </div>
        </section>
      ) : null}

      {draft.documents.length ? (
        <div className="mt-7 flex items-center justify-between gap-3">
          <h2 className="text-brand-navy font-semibold">
            {t("onboarding.uploadedDocuments", {
              count: draft.documents.length,
            })}
          </h2>
        </div>
      ) : null}
      {deleteError ? (
        <p role="alert" className="text-danger mt-3 text-sm">
          {deleteError}
        </p>
      ) : null}
      <div className={draft.documents.length ? "mt-3 space-y-3" : ""}>
        {draft.documents.length ? (
          draft.documents.map((document) => (
            <div
              key={document.id}
              className="border-line bg-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border p-3 transition-shadow hover:shadow-sm sm:p-4"
            >
              <span className="bg-light-blue text-primary flex size-10 items-center justify-center rounded-xl">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-brand-navy ltr-content truncate text-sm font-semibold"
                  title={document.name}
                >
                  {document.name}
                </p>
                <div className="text-muted mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs leading-5">
                  <span>
                    {t(`onboarding.options.${document.documentType}`)}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{document.ownerName}</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {countries.find(
                      (country) => country.code === document.issuingCountry,
                    )?.name ?? document.issuingCountry}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {t("onboarding.expires", { date: document.expiryDate })}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="ltr-content">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`${t("onboarding.viewFull")} ${document.name}`}
                  disabled={Boolean(removingId)}
                  onClick={() => setPreviewDocument(document)}
                >
                  <Eye className="size-4" />
                </Button>
                <button
                  type="button"
                  className="text-muted hover:bg-danger/5 hover:text-danger flex size-11 shrink-0 items-center justify-center rounded-lg disabled:opacity-50"
                  aria-label={`${t("onboarding.remove")} ${document.name}`}
                  disabled={Boolean(removingId)}
                  onClick={async () => {
                    setRemovingId(document.id)
                    setDeleteError(undefined)
                    try {
                      await deleteUploadAction(document.id)
                      const remainingDocuments = draft.documents.filter(
                        (item) => item.id !== document.id,
                      )
                      updateDraft({ documents: remainingDocuments })
                      if (!remainingDocuments.length) {
                        setSelectedFile(undefined)
                        setFileError(undefined)
                        setShowEditor(true)
                      }
                      if (previewDocument?.id === document.id)
                        setPreviewDocument(undefined)
                    } catch {
                      setDeleteError(t("onboarding.errors.deleteFailed"))
                    } finally {
                      setRemovingId(undefined)
                    }
                  }}
                >
                  {removingId === document.id ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : !showEditor ? (
          <p className="text-muted py-3 text-center text-sm">
            {t("onboarding.noFiles")}
          </p>
        ) : null}
      </div>
      {draft.documents.length > 0 && !showEditor ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          disabled={Boolean(removingId)}
          onClick={() => {
            setFileError(undefined)
            setShowEditor(true)
          }}
        >
          <Plus className="size-4" />
          {t("onboarding.addAnotherDocument")}
        </Button>
      ) : null}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/profile">{t("common.back")}</Link>
        </Button>
        <Button
          disabled={!draft.documents.length || uploading || continuePending}
          onClick={() => {
            if (!draft.documents.length)
              return setFileError(t("onboarding.errors.documentRequired"))
            setContinuePending(true)
            router.push("/onboarding/review")
          }}
        >
          {continuePending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {t("onboarding.uploadContinue")}
        </Button>
      </div>
      <AssetPreviewDialog
        asset={previewDocument}
        open={Boolean(previewDocument)}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(undefined)
        }}
        labels={{
          preview: t("onboarding.preview"),
          loading: t("onboarding.previewLoading"),
          failed: t("onboarding.errors.previewFailed"),
          openNewTab: t("onboarding.openNewTab"),
          close: t("onboarding.closePreview"),
        }}
      />
    </OnboardingFrame>
  )
}
