"use server"

import { revalidatePath } from "next/cache"

import { backendApi } from "@/lib/backend/api"

type Outcome = { ok: true; id?: string } | { ok: false; message: string }

async function mutate(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
  revalidate: string,
): Promise<Outcome> {
  try {
    const result = await backendApi<{ id?: string }>(path, {
      method,
      body: JSON.stringify(body),
    })
    revalidatePath(revalidate)
    return { ok: true, id: result.id }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The operation could not be completed.",
    }
  }
}

export async function createProjectSiteAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/sites`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/sites`,
  )
}

export async function createWorkTaskAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/tasks`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/tasks`,
  )
}

export async function createProductionEntryAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/production`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/production`,
  )
}

export async function createProjectCostAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/costs`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/costs`,
  )
}

export async function createProjectForecastAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/forecasts`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/forecast`,
  )
}

export async function createSalAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/sal`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/sal`,
  )
}

export async function createMaterialAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/materials`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/materials`,
  )
}
export async function createMaterialTransactionAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/materials/transactions`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/materials`,
  )
}
export async function createMaterialTransferAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/materials/transfers`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/materials`,
  )
}
export async function createEquipmentResourceAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/equipment-usage/resources`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/equipment`,
  )
}
export async function createEquipmentUsageAction(
  companyId: string,
  projectId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/equipment-usage`,
    "POST",
    body,
    `/dashboard/projects/${projectId}/equipment`,
  )
}

export async function createManualShiftAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/workforce/attendance`,
    "POST",
    body,
    "/dashboard/workforce/attendance",
  )
}

export async function createPayrollAction(
  companyId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/workforce/payroll`,
    "POST",
    body,
    "/dashboard/workforce/payroll",
  )
}

export async function workerCheckInAction(body: Record<string, unknown>) {
  return await mutate(
    "/api/v1/me/workforce/operations/check-in",
    "POST",
    body,
    "/dashboard/operations/attendance/check-in",
  )
}

export async function workerCheckOutAction(
  shiftId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/me/workforce/operations/shifts/${shiftId}/check-out`,
    "POST",
    body,
    "/dashboard/operations/attendance/check-in",
  )
}

export async function workerLocationAction(
  shiftId: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/me/workforce/operations/shifts/${shiftId}/location`,
    "POST",
    body,
    "/dashboard/operations/attendance/check-in",
  )
}

export async function transitionOperationsRecordAction(
  companyId: string,
  projectId: string,
  resource:
    | "production"
    | "costs"
    | "materials/transactions"
    | "equipment-usage"
    | "forecasts"
    | "sal",
  id: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/projects/${projectId}/${resource}/${id}/status`,
    "PATCH",
    body,
    `/dashboard/projects/${projectId}/${resource.startsWith("materials") ? "materials" : resource}`,
  )
}

export async function transitionPayrollAction(
  companyId: string,
  id: string,
  body: Record<string, unknown>,
) {
  return await mutate(
    `/api/v1/workspaces/${companyId}/operations/payroll/${id}/status`,
    "PATCH",
    body,
    "/dashboard/operations/payroll",
  )
}
