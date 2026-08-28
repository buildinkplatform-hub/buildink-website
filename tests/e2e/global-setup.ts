import { createClient } from "@supabase/supabase-js"

import { ensureE2EEnvironment } from "./e2e-env"

export default async function globalSetup() {
  if (process.env.E2E_SKIP_AUTH === "true") return

  const environment = ensureE2EEnvironment()
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
  const { data, error } = await admin.auth.admin.createUser({
    email: required.E2E_USER_EMAIL!,
    password: required.E2E_USER_PASSWORD!,
    email_confirm: true,
    user_metadata: {
      name: "Buildink E2E User",
      preferred_locale: "en",
    },
  })
  if (error || !data.user) {
    throw new Error(
      `Unable to provision the E2E user: ${error?.message ?? "unknown error"}`,
    )
  }

  return async () => {
    const { error: deleteError } = await admin.auth.admin.deleteUser(
      data.user.id,
    )
    if (deleteError) {
      process.stderr.write(
        `Unable to remove the E2E user: ${deleteError.message}\n`,
      )
    }
  }
}
