"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { deleteSavedSearchCachedAction } from "@/features/dashboard/actions/portal-saved.actions"
import type { PortalSavedSearch } from "@/features/dashboard/data/portal-client"
import { portalQueryKeys } from "@/features/dashboard/query/portal-query-keys"
import { useSavedSearchesQuery } from "@/features/dashboard/query/portal-saved-query"

export function SavedSearchList({ items }: { items: PortalSavedSearch[] }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const query = useSavedSearchesQuery({ items })
  const visibleItems = query.data?.items ?? items
  const [pendingId, setPendingId] = useState<string>()
  const [selected, setSelected] = useState<PortalSavedSearch>()
  const [message, setMessage] = useState<string>()

  if (!visibleItems.length && !selected) {
    return (
      <p className="text-muted-foreground">
        {t("dashboard.savedSearch.empty")}
      </p>
    )
  }

  return (
    <div className="space-y-3" aria-busy={Boolean(pendingId)}>
      {visibleItems.map((item) => (
        <Card
          key={item.id}
          className="flex items-start justify-between gap-4 p-4"
        >
          <div>
            <p className="text-foreground font-semibold">{item.name}</p>
            <p className="text-muted-foreground mt-1 text-sm">
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
            onClick={() => setSelected(item)}
          >
            {t("dashboard.savedSearch.delete")}
          </Button>
        </Card>
      ))}
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
          name: selected?.name ?? "",
        })}
        confirmLabel={t("dashboard.savedSearch.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        pending={Boolean(pendingId)}
        onConfirm={() => {
          if (!selected || pendingId) return
          const item = selected
          const key = portalQueryKeys.resource("saved-searches")
          const previous = queryClient.getQueryData<{
            items: PortalSavedSearch[]
          }>(key)
          queryClient.setQueryData<{ items: PortalSavedSearch[] }>(
            key,
            (current) => ({
              items: (current?.items ?? visibleItems).filter(
                (entry) => entry.id !== item.id,
              ),
            }),
          )
          setPendingId(item.id)
          setMessage(undefined)
          void deleteSavedSearchCachedAction(item.id).then((result) => {
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
