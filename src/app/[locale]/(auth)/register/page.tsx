import { RegisterForm } from "@/features/auth/components/register-form"
import { Reveal } from "@/components/motion/reveal"
import { redirectSignedInUser } from "@/lib/auth/signed-in-guard"

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await redirectSignedInUser(locale)
  return (
    <Reveal>
      <RegisterForm />
    </Reveal>
  )
}
