import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return (
    <ResetPasswordForm
      validSession={Boolean(data?.claims)}
      next={params.next}
    />
  )
}
