"use client"

import {
  useEffect,
  useId,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { Columns3, Save } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  listSavedViewsAction,
  saveOperationsViewAction,
} from "@/features/dashboard/actions/operations-completion.actions"

type View = {
  id: string
  name: string
  columns: string[]
  filters: Record<string, string>
  isDefault: boolean
}

export function OperationsTablePreferences({
  companyId,
  resource,
  columns,
  children,
}: {
  companyId?: string
  resource?: string
  columns: Array<{ key: string; label: string }>
  children: ReactNode
}) {
  const t = useTranslations("operations.completion")
  const reactId = useId().replaceAll(":", "")
  const [visible, setVisible] = useState(columns.map((column) => column.key))
  const [views, setViews] = useState<View[]>([])
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()
  const search = useSearchParams()
  const storageKey =
    companyId && resource
      ? `buildink:operations-view:${companyId}:${resource}`
      : undefined

  useEffect(() => {
    if (!storageKey) return
    const saved = localStorage.getItem(storageKey)
    if (saved)
      try {
        const savedColumns = JSON.parse(saved) as string[]
        queueMicrotask(() => setVisible(savedColumns))
      } catch {
        localStorage.removeItem(storageKey)
      }
    if (companyId && resource)
      void listSavedViewsAction(companyId, resource).then((result) => {
        setViews(result.items)
        const selected = result.items.find((view) => view.isDefault)
        if (selected?.columns.length) setVisible(selected.columns)
      })
  }, [companyId, resource, storageKey])

  function change(next: string[]) {
    if (!next.length) return toast.error(t("oneColumnRequired"))
    setVisible(next)
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next))
  }

  function save() {
    if (!companyId || !resource || !name.trim()) return
    startTransition(async () => {
      try {
        await saveOperationsViewAction(companyId, {
          resource,
          name: name.trim(),
          columns: visible,
          filters: Object.fromEntries(search.entries()),
          sort: [],
          isDefault: false,
        })
        const result = await listSavedViewsAction(companyId, resource)
        setViews(result.items)
        setName("")
        toast.success(t("viewSaved"))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("viewSaveFailed"),
        )
      }
    })
  }

  const hidden = columns
    .filter((column) => !visible.includes(column.key))
    .map(
      (column) =>
        `[data-operations-table="${reactId}"] [data-column="${column.key.replace(/[^a-zA-Z0-9_-]/g, "")}"]{display:none!important}`,
    )
    .join("")
  return (
    <div className="space-y-3" data-operations-table={reactId}>
      <style>{hidden}</style>
      <div className="border-line/70 flex flex-wrap items-center justify-end gap-2 rounded-2xl border bg-white p-2.5">
        {views.length ? (
          <Select
            onValueChange={(id) => {
              const view = views.find((item) => item.id === id)
              if (view?.columns.length) change(view.columns)
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("savedViews")} />
            </SelectTrigger>
            <SelectContent>
              {views.map((view) => (
                <SelectItem key={view.id} value={view.id}>
                  {view.name}
                  {view.isDefault ? ` · ${t("default")}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <Columns3 className="size-4" />
              {t("columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("visibleColumns")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visible.includes(column.key)}
                onCheckedChange={(checked) =>
                  change(
                    checked
                      ? [...visible, column.key]
                      : visible.filter((key) => key !== column.key),
                  )
                }
                onSelect={(event) => event.preventDefault()}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {companyId && resource ? (
          <>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("viewName")}
              className="w-full sm:w-40"
            />
            <Button
              variant="secondary"
              disabled={pending || !name.trim()}
              onClick={save}
            >
              <Save className="size-4" />
              {t("saveView")}
            </Button>
          </>
        ) : null}
      </div>
      {children}
    </div>
  )
}
