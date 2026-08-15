"use client"

import { Heart, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createSavedItemAction } from "@/features/dashboard/actions/portal.actions"
import type { SavedEntityType } from "@/features/saved/saved-items.utils"
import { Link } from "@/i18n/navigation"

export function SaveItemButton({
  entityType,
  entityId,
  label,
  slug,
  module,
  kind,
  isAuthenticated,
  loginHref,
  variant = "public",
}: {
  entityType: SavedEntityType
  entityId?: string
  label: string
  slug?: string
  module?: string
  kind?: string
  isAuthenticated: boolean
  loginHref?: string
  variant?: "public" | "dashboard"
}) {
  const t = useTranslations(variant === "public" ? "publicSite" : "dashboard")
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState<string>()

  if (!entityId) return null

  if (!isAuthenticated && loginHref) {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href={loginHref}>{t("actions.saveItem")}</Link>
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={saved ? "secondary" : "primary"}
        className={variant === "public" ? "w-full" : undefined}
        disabled={pending || saved}
        onClick={() => {
          setPending(true)
          setMessage(undefined)
          void createSavedItemAction({
            entityType,
            entityId,
            label,
            metadata: {
              ...(slug ? { slug } : {}),
              ...(module ? { module } : {}),
              ...(kind ? { kind } : {}),
            },
          }).then((result) => {
            setPending(false)
            if (result.ok) {
              setSaved(true)
              return
            }
            setMessage(result.message)
          })
        }}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
        )}
        {saved
          ? variant === "public"
            ? t("actions.savedItem")
            : t("savedItem.saved")
          : variant === "public"
            ? t("actions.saveToFavorites")
            : t("savedItem.save")}
      </Button>
      {saved ? (
        <p className="text-muted text-center text-xs">
          <Link href="/dashboard/saved" className="text-primary font-semibold">
            {variant === "public" ? t("actions.viewSaved") : t("savedItem.viewAll")}
          </Link>
        </p>
      ) : null}
      {message ? (
        <p className="text-danger text-center text-xs">{message}</p>
      ) : null}
    </div>
  )
}
