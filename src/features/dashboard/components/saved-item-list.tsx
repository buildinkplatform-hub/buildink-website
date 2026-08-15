"use client"

import { useTranslations } from "next-intl"
import { startTransition, useOptimistic, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { deleteSavedItemAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalSavedItem } from "@/features/dashboard/data/portal-client"
import {
  savedEntityLabelKey,
  savedItemHref,
} from "@/features/saved/saved-items.utils"
import { Link, useRouter } from "@/i18n/navigation"

export function SavedItemList({ items }: { items: PortalSavedItem[] }) {
  const t = useTranslations()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string>()
  const [selected, setSelected] = useState<PortalSavedItem>()
  const [message, setMessage] = useState<string>()
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (current, id: string) => current.filter((item) => item.id !== id),
  )

  if (!optimisticItems.length && !selected)
    return <p className="text-muted">{t("dashboard.savedEmpty")}</p>

  return (
    <div className="space-y-3">
      {optimisticItems.map((item) => {
        const href = savedItemHref(item)
        const typeLabel = t(savedEntityLabelKey(item.entityType))
        return (
          <Card
            key={item.id}
            className="flex items-start justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              {href ? (
                <Link
                  href={href}
                  className="text-brand-navy font-semibold hover:text-primary"
                >
                  {item.label || typeLabel}
                </Link>
              ) : (
                <p className="text-brand-navy font-semibold">
                  {item.label || typeLabel}
                </p>
              )}
              <p className="text-muted mt-1 text-sm">{typeLabel}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={pendingId === item.id}
              onClick={() => setSelected(item)}
            >
              {t("dashboard.savedSearch.delete")}
            </Button>
          </Card>
        )
      })}
      {message ? (
        <p role="alert" className="text-danger text-sm">
          {message}
        </p>
      ) : null}
      <ConfirmationDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
        title={t("common.removeConfirmTitle")}
        description={t("common.removeConfirmBody", {
          name: selected?.label || selected?.entityType || "",
        })}
        confirmLabel={t("dashboard.savedSearch.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        pending={Boolean(pendingId)}
        onConfirm={() => {
          if (!selected) return
          const item = selected
          setPendingId(item.id)
          setMessage(undefined)
          startTransition(async () => {
            removeOptimistic(item.id)
            const result = await deleteSavedItemAction(item.id)
            setPendingId(undefined)
            setSelected(undefined)
            if (result.ok) router.refresh()
            else setMessage(result.message)
          })
        }}
      />
    </div>
  )
}
