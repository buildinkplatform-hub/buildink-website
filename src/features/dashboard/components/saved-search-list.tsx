"use client"

import { startTransition, useOptimistic, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { deleteSavedSearchAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalSavedSearch } from "@/features/dashboard/data/portal-client"

export function SavedSearchList({ items }: { items: PortalSavedSearch[] }) {
  const t = useTranslations()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string>()
  const [selected, setSelected] = useState<PortalSavedSearch>()
  const [message, setMessage] = useState<string>()
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (current, id: string) => current.filter((item) => item.id !== id),
  )

  if (!optimisticItems.length && !selected) {
    return <p className="text-muted">{t("dashboard.savedSearch.empty")}</p>
  }

  return (
    <div className="space-y-3">
      {optimisticItems.map((item) => (
        <Card
          key={item.id}
          className="flex items-start justify-between gap-4 p-4"
        >
          <div>
            <p className="text-brand-navy font-semibold">{item.name}</p>
            <p className="text-muted mt-1 text-sm">
              {t(`dashboard.savedSearch.kinds.${item.kind}`)}
              {item.query ? ` · ${item.query}` : ""}
            </p>
            {item.alert?.enabled ? (
              <p className="text-primary mt-1 text-xs font-semibold">
                {t("dashboard.savedSearch.alertFrequency", {
                  frequency: t(
                    `dashboard.savedSearch.frequencies.${item.alert.frequency}`,
                  ),
                })}
              </p>
            ) : null}
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
      ))}
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
          name: selected?.name ?? "",
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
            const result = await deleteSavedSearchAction(item.id)
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
