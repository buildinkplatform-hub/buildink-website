"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { deleteSavedItemCachedAction } from "@/features/dashboard/actions/portal-saved.actions"
import type { PortalSavedItem } from "@/features/dashboard/data/portal-client"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"
import { useSavedItemsQuery } from "@/features/dashboard/query/portal-saved-query"
import {
  savedEntityLabelKey,
  savedItemHref,
} from "@/features/saved/saved-items.utils"
import { Link } from "@/i18n/navigation"

export function SavedItemList({ items }: { items: PortalSavedItem[] }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const query = useSavedItemsQuery({ items })
  const visibleItems = query.data?.items ?? items
  const [pendingId, setPendingId] = useState<string>()
  const [selected, setSelected] = useState<PortalSavedItem>()
  const [message, setMessage] = useState<string>()

  if (!visibleItems.length && !selected) {
    return <p className="text-muted-foreground">{t("dashboard.savedEmpty")}</p>
  }

  return (
    <div className="space-y-3" aria-busy={Boolean(pendingId)}>
      {visibleItems.map((item) => {
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
                  prefetch
                  className="text-foreground hover:text-primary font-semibold"
                >
                  {item.label || typeLabel}
                </Link>
              ) : (
                <p className="text-foreground font-semibold">
                  {item.label || typeLabel}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-sm">{typeLabel}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(item)}
            >
              {t("dashboard.savedSearch.delete")}
            </Button>
          </Card>
        )
      })}
      {message ? (
        <p role="alert" className="text-destructive text-sm">
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
          if (!selected || pendingId) return
          const item = selected
          const key = portalQueryKeys.resource("saved-items")
          const previous = queryClient.getQueryData<{
            items: PortalSavedItem[]
          }>(key)
          queryClient.setQueryData<{ items: PortalSavedItem[] }>(
            key,
            (current) => ({
              items: (current?.items ?? visibleItems).filter(
                (entry) => entry.id !== item.id,
              ),
            }),
          )
          setPendingId(item.id)
          setMessage(undefined)
          void deleteSavedItemCachedAction(item.id).then((result) => {
            setPendingId(undefined)
            setSelected(undefined)
            if (!result.ok) {
              if (previous) queryClient.setQueryData(key, previous)
              setMessage(result.message)
            }
          })
        }}
      />
    </div>
  )
}
