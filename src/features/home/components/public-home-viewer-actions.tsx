import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getPublicViewer } from "@/lib/auth/session"
import type { Locale } from "@/shared/types/platform"

export async function PublicHomePostAction({
  locale,
  signedInLabel,
  signedOutLabel,
}: {
  locale: Locale
  signedInLabel: string
  signedOutLabel: string
}) {
  const viewer = await getPublicViewer(locale)
  const canEnterPortal = viewer?.nextAction === "enter_portal"

  return (
    <Button asChild variant="secondary" size="sm">
      <Link href={canEnterPortal ? "/dashboard/opportunities" : "/register"}>
        {canEnterPortal ? signedInLabel : signedOutLabel}
      </Link>
    </Button>
  )
}

export async function PublicHomeDashboardAction({
  locale,
  signedInLabel,
  signedOutLabel,
}: {
  locale: Locale
  signedInLabel: string
  signedOutLabel: string
}) {
  const viewer = await getPublicViewer(locale)

  return (
    <Button asChild variant="secondary">
      <Link href={viewer?.profileHref ?? "/register"}>
        {viewer ? signedInLabel : signedOutLabel}
      </Link>
    </Button>
  )
}
