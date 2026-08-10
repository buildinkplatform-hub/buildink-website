import { PublicUserMenu } from "@/components/layout/public-user-menu"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { Locale, PublicViewer } from "@/shared/types/platform"

function initialsFromName(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return letters || "B"
}

export function PublicAuthControls({
  locale,
  viewer,
  profileImageUrl,
  labels,
}: {
  locale: Locale
  viewer: PublicViewer | null
  profileImageUrl?: string | null
  labels: {
    login: string
    register: string
    dashboard: string
    logout: string
    confirmLogoutTitle: string
    confirmLogoutBody: string
    confirmLogoutAction: string
    cancel: string
  }
}) {
  if (!viewer) {
    return (
      <>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link href="/login">{labels.login}</Link>
        </Button>
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/register">{labels.register}</Link>
        </Button>
      </>
    )
  }

  return (
    <PublicUserMenu
      locale={locale}
      name={viewer.name}
      email={viewer.email}
      dashboardHref={viewer.profileHref}
      profileImageUrl={profileImageUrl}
      initials={initialsFromName(viewer.name)}
      dashboardLabel={labels.dashboard}
      logoutLabel={labels.logout}
      confirmTitle={labels.confirmLogoutTitle}
      confirmBody={labels.confirmLogoutBody}
      confirmActionLabel={labels.confirmLogoutAction}
      cancelLabel={labels.cancel}
    />
  )
}
