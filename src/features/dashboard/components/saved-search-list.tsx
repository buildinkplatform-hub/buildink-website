"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { BellRing, Search, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { PortalInlineAlert } from "@/features/dashboard/components/portal-form-layout"
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
      <div className="border-border/80 bg-muted/10 grid min-h-40 place-items-center rounded-xl border border-dashed p-6 text-center">
        <div className="max-w-sm">
          <span className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-xl">
            <Search className="size-4" aria-hidden="true" />
          </span>
          <p className="text-foreground mt-3 text-sm font-semibold">
            {t("dashboard.savedSearch.empty")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3" aria-busy={Boolean(pendingId)}>
      <div className="border-border/80 overflow-hidden rounded-xl border">
        <div className="divide-border/70 divide-y">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="hover:bg-muted/18 flex flex-col gap-3 px-4 py-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="border-primary/10 bg-primary/8 text-primary grid size-9 shrink-0 place-items-center rounded-xl border">
                  {item.alert?.enabled ? (
                    <BellRing className="size-4" aria-hidden="true" />
                  ) : (
                    <Search className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
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
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/8 hover:text-destructive self-start sm:self-auto"
                disabled={Boolean(pendingId)}
                onClick={() => setSelected(item)}
              >
                <Trash2 className="size-4" />
                {t("dashboard.savedSearch.delete")}
              </Button>
            </article>
          ))}
        </div>
      </div>

      {message ? (
        <PortalInlineAlert tone="error">{message}</PortalInlineAlert>
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
