"use server"

import { revalidatePath } from "next/cache"

import { backendApi } from "@/lib/backend/api"

export async function previewOperationsImportAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  try {
    return {
      ok: true as const,
      batch: await backendApi<Record<string, unknown>>(
        `/api/v1/workspaces/${companyId}/imports/preview`,
        { method: "POST", body: JSON.stringify(body) },
      ),
    }
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error ? error.message : "Import preview failed.",
    }
  }
}

export async function commitOperationsImportAction(
  companyId: string,
  batchId: string,
) {
  try {
    const batch = await backendApi<Record<string, unknown>>(
      `/api/v1/workspaces/${companyId}/imports/${batchId}/commit`,
      { method: "POST", body: JSON.stringify({ version: 1 }) },
    )
    revalidatePath("/dashboard/operations")
    return { ok: true as const, batch }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Import commit failed.",
    }
  }
}

export async function getImportErrorsAction(
  companyId: string,
  batchId: string,
) {
  return backendApi<{
    fileName: string
    mimeType: string
    contentBase64: string
  }>(`/api/v1/workspaces/${companyId}/imports/${batchId}/errors`)
}

export async function exportPayrollAction(
  companyId: string,
  periodId: string,
  format: "csv" | "pdf",
) {
  return backendApi<{
    fileName: string
    mimeType: string
    contentBase64: string
  }>(
    `/api/v1/workspaces/${companyId}/operations/payroll/${periodId}/export/${format}`,
  )
}

export async function listSavedViewsAction(
  companyId: string,
  resource: string,
) {
  return backendApi<{
    items: Array<{
      id: string
      name: string
      columns: string[]
      filters: Record<string, string>
      isDefault: boolean
    }>
  }>(
    `/api/v1/workspaces/${companyId}/operations/saved-views?resource=${encodeURIComponent(resource)}`,
  )
}

export async function saveOperationsViewAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  return backendApi<{ id: string }>(
    `/api/v1/workspaces/${companyId}/operations/saved-views`,
    { method: "POST", body: JSON.stringify(body) },
  )
}

export async function attachOperationsEvidenceAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  return backendApi<{ id: string }>(
    `/api/v1/workspaces/${companyId}/operations/evidence`,
    { method: "POST", body: JSON.stringify(body) },
  )
}

export async function listOperationsEvidenceAction(
  companyId: string,
  entityType: string,
  entityId: string,
) {
  return backendApi<{
    items: Array<{
      id: string
      label: string | null
      asset: {
        id: string
        originalName: string
        mimeType: string
        sizeBytes: string
        status: string
      }
    }>
  }>(
    `/api/v1/workspaces/${companyId}/operations/evidence/${encodeURIComponent(entityType)}/${entityId}`,
  )
}

type OperationMutationRecord = Record<string, unknown> & { id: string }

export async function assignComplianceAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  const result = await backendApi<OperationMutationRecord>(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/compliance/assignments`,
    { method: "POST", body: JSON.stringify(body) },
  )
  revalidatePath(`/dashboard/projects/${projectId}/compliance`)
  return result
}

export async function transitionComplianceAction(
  companyId: string,
  projectId: string,
  id: string,
  body: Record<string, unknown>,
) {
  const result = await backendApi<OperationMutationRecord>(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/compliance/assignments/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
  )
  revalidatePath(`/dashboard/projects/${projectId}/compliance`)
  return result
}

export async function listAlertRulesAction(companyId: string) {
  return backendApi<{ items: Array<Record<string, unknown>> }>(
    `/api/v1/workspaces/${companyId}/operations/alert-rules`,
  )
}

export async function saveAlertRuleAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  const result = await backendApi<{ id: string }>(
    `/api/v1/workspaces/${companyId}/operations/alert-rules`,
    { method: "POST", body: JSON.stringify(body) },
  )
  revalidatePath("/dashboard/operations/alerts")
  return result
}

export async function transitionAlertAction(
  companyId: string,
  id: string,
  body: Record<string, unknown>,
) {
  const result = await backendApi<{ id: string }>(
    `/api/v1/workspaces/${companyId}/workforce/alerts/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
  )
  revalidatePath("/dashboard/operations/alerts")
  return result
}
