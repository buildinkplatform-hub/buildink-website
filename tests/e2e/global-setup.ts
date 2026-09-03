import { createClient } from "@supabase/supabase-js"

import { ensureE2EEnvironment } from "./e2e-env"

function isAlreadyRegistered(message?: string) {
  return Boolean(
    message && /already (?:been )?registered|already exists/i.test(message),
  )
}

export default async function globalSetup() {
  if (process.env.E2E_SKIP_AUTH === "true") return

  const environment = ensureE2EEnvironment()
  if (process.env.E2E_USE_MOCK_AUTH === "true") return
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: environment.supabaseUrl,
    E2E_SUPABASE_SECRET_KEY: environment.supabaseSecret,
    E2E_USER_EMAIL: environment.email,
    E2E_USER_PASSWORD: environment.password,
  }
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(
      `E2E Supabase configuration is missing: ${missing.join(", ")}. Configure NEXT_PUBLIC_SUPABASE_URL plus E2E_SUPABASE_SECRET_KEY (or SUPABASE_SECRET_KEY) in website/.env. E2E_USER_EMAIL and E2E_USER_PASSWORD are generated automatically when omitted.`,
    )
  }

  const admin = createClient(
    required.NEXT_PUBLIC_SUPABASE_URL!,
    required.E2E_SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  const attributes = {
    password: required.E2E_USER_PASSWORD!,
    user_metadata: {
      name: "Buildink E2E User",
      preferred_locale: "en",
    },
  }
  const created = await admin.auth.admin.createUser({
    email: required.E2E_USER_EMAIL!,
    ...attributes,
    email_confirm: true,
  })

  let user = created.data.user
  let createdByThisRun = Boolean(user)

  if (created.error || !user) {
    if (!isAlreadyRegistered(created.error?.message)) {
      throw new Error(
        `Unable to provision the E2E user: ${created.error?.message ?? "unknown error"}`,
      )
    }

    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listed.error) {
      throw new Error(
        `Unable to resolve the existing E2E user: ${listed.error.message}`,
      )
    }
    const email = required.E2E_USER_EMAIL!.toLowerCase()
    const existing = listed.data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    )
    if (!existing) {
      throw new Error(
        `Unable to resolve the existing E2E user for ${required.E2E_USER_EMAIL}`,
      )
    }

    const updated = await admin.auth.admin.updateUserById(
      existing.id,
      attributes,
    )
    if (updated.error || !updated.data.user) {
      throw new Error(
        `Unable to refresh the existing E2E user: ${updated.error?.message ?? "unknown error"}`,
      )
    }
    user = updated.data.user
    createdByThisRun = false
  }

  const provisionedUser = user
  if (!provisionedUser) {
    throw new Error("Unable to provision the E2E user: unknown error")
  }

  return async () => {
    if (!createdByThisRun) return
    const { error: deleteError } = await admin.auth.admin.deleteUser(
      provisionedUser.id,
    )
    if (deleteError) {
      process.stderr.write(
        `Unable to remove the E2E user: ${deleteError.message}\n`,
      )
    }
  }
}
