import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { PublicViewer } from "@/shared/types/platform"

export function PublicHeroActions({
  viewer,
  labels,
}: {
  viewer: PublicViewer | null
  labels: {
    register: string
    login: string
    profile: string
    dashboard: string
  }
}) {
  if (viewer) {
    const primaryLabel =
      viewer.nextAction === "enter_portal" ? labels.dashboard : labels.profile

    return (
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={viewer.profileHref}>
            {primaryLabel}{" "}
            <ArrowRight
              aria-hidden="true"
              className="size-4 rtl:rotate-180"
            />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      <Button asChild>
        <Link href="/register">
          {labels.register}{" "}
          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/login">{labels.login}</Link>
      </Button>
    </div>
  )
}
