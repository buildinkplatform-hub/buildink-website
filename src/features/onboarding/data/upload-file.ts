"use client"

import {
  completeUploadAction,
  createUploadIntentAction,
  deleteUploadAction,
} from "@/features/onboarding/actions/onboarding.actions"
import { createClient } from "@/lib/supabase/client"

export async function uploadOnboardingFile(file: File, metadata: Record<string, unknown>) {
  const intent = await createUploadIntentAction({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    ...metadata,
  })
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(intent.bucket)
    .uploadToSignedUrl(intent.path, intent.token, file, { contentType: file.type })
  if (error) {
    await deleteUploadAction(intent.assetId).catch(() => undefined)
    throw error
  }
  await completeUploadAction(intent.assetId)
  return intent.assetId
}
