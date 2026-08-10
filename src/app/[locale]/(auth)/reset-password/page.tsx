import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return <ResetPasswordForm validSession={Boolean(data?.claims)} />
}
