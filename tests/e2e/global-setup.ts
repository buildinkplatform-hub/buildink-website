import { createClient } from "@supabase/supabase-js"

export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.E2E_SUPABASE_SECRET_KEY
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD
  if (!url || !secret || !email || !password) {
    throw new Error(
      "E2E Supabase configuration is missing; provide the project URL, secret key, email, and password",
    )
  }

  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
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
