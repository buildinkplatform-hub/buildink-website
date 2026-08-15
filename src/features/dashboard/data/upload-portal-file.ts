"use client"

import {
  completePortalUploadAction,
  createPortalUploadIntentAction,
  deletePortalUploadAction,
} from "@/features/dashboard/actions/portal.actions"
import { createClient } from "@/lib/supabase/client"

export async function uploadPortalFile(file: File) {
  const intentResult = await createPortalUploadIntentAction({
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    kind: file.type.startsWith("image/") ? "image" : "document",
    purpose: "attachment",
    documentType: "other",
  })
  if (!intentResult.ok || !("intent" in intentResult) || !intentResult.intent) {
    throw new Error(
      intentResult.ok ? "UPLOAD_INTENT_FAILED" : intentResult.message,
    )
  }
  const intent = intentResult.intent
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
  const completed = await completePortalUploadAction(intent.assetId)
  if (!completed.ok) {
    await deletePortalUploadAction(intent.assetId).catch(() => undefined)
    throw new Error(completed.message)
  }
  return {
    id: intent.assetId,
    name: file.name,
    usage: file.type.startsWith("image/")
      ? ("IMAGE" as const)
      : ("DOCUMENT" as const),
  }
}
