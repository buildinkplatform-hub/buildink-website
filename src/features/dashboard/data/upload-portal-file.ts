"use client"

import {
  completePortalUploadAction,
  createPortalUploadIntentAction,
  deletePortalUploadAction,
} from "@/features/dashboard/actions/portal.actions"
import { createClient } from "@/lib/supabase/client"

export interface PortalUploadMetadata {
  documentType: string
  expiresAt?: string
  issuedAt?: string
}

export async function uploadPortalFile(
  file: File,
  metadata: PortalUploadMetadata = { documentType: "other" },
) {
  const result = await createPortalUploadIntentAction({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    kind: "document",
    purpose: "document",
    documentType: metadata.documentType,
    expiresAt: metadata.expiresAt || undefined,
    issuedAt: metadata.issuedAt || undefined,
  })
  if (!result.ok) throw new Error(result.message)
  const intent = result.intent
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(intent.bucket)
    .uploadToSignedUrl(intent.path, intent.token, file, {
      contentType: file.type,
    })
  if (error) {
    await deletePortalUploadAction(intent.assetId).catch(() => undefined)
    throw error
  }
  const complete = await completePortalUploadAction(intent.assetId)
  if (!complete.ok) throw new Error(complete.message)
  return complete.upload
}
