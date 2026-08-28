"use server"

import { BackendApiError } from "@/lib/backend/api"
import {
  createPortalSavedItem,
  createPortalSavedSearch,
  deletePortalSavedItem,
  deletePortalSavedSearch,
  updatePortalSavedSearch,
} from "@/features/dashboard/data/portal-client"

function fail(error: unknown, fallback: string) {
  return {
    ok: false as const,
    code: error instanceof BackendApiError ? error.code : fallback,
    message: error instanceof Error ? error.message : fallback,
  }
}

export async function createSavedItemCachedAction(input: {
  entityType: string
  entityId: string
  label?: string
  metadata?: { slug?: string; module?: string; kind?: string }
}) {
  try {
    const item = await createPortalSavedItem(input)
    return { ok: true as const, item }
  } catch (error) {
    return fail(error, "SAVED_ITEM_CREATE_FAILED")
  }
}

export async function deleteSavedItemCachedAction(id: string) {
  try {
    await deletePortalSavedItem(id)
    return { ok: true as const, id }
  } catch (error) {
    return fail(error, "SAVED_ITEM_DELETE_FAILED")
  }
}

export async function createSavedSearchCachedAction(input: {
  name: string
  kind: string
  query?: string | null
  alert?: {
    enabled: boolean
    frequency: "IMMEDIATE" | "DAILY" | "WEEKLY" | "MONTHLY"
    emailEnabled: boolean
    pushEnabled: boolean
    inAppEnabled: boolean
  }
}) {
  try {
    const search = await createPortalSavedSearch(input)
    return { ok: true as const, search }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_CREATE_FAILED")
  }
}

export async function updateSavedSearchCachedAction(
  id: string,
  input: Record<string, unknown>,
  version: number,
) {
  try {
    const search = await updatePortalSavedSearch(id, input, version)
    return { ok: true as const, search }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_UPDATE_FAILED")
  }
}

export async function deleteSavedSearchCachedAction(id: string) {
  try {
    await deletePortalSavedSearch(id)
    return { ok: true as const, id }
  } catch (error) {
    return fail(error, "SAVED_SEARCH_DELETE_FAILED")
  }
}
