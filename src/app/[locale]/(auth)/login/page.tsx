import { LoginForm } from "@/features/auth/components/login-form"
import { Reveal } from "@/components/motion/reveal"
import { redirectSignedInUser } from "@/lib/auth/signed-in-guard"

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string }>
}) {
  const { locale } = await params
  const { next } = await searchParams
  await redirectSignedInUser(locale, next)
  return (
    <Reveal>
      <LoginForm next={next} />
    </Reveal>
  )
}
