"use client"

import { useMemo } from "react"
import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { DocumentLink } from "@/features/dashboard/components/document-link"
import { StatusBadge } from "@/features/dashboard/components/status-badge"

export type VerificationDocumentRow = {
  id: string
  originalName: string
  documentType: string | null
  status: string
  expiresAt: string | null
  createdAt: string
}

function expiryState(value?: string | null) {
  if (!value) return undefined
  const expiry = new Date(value)
  if (Number.isNaN(expiry.getTime())) return undefined
  const days = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  if (days < 0) return "EXPIRED"
  if (days <= 30) return "EXPIRING_SOON"
  return "VALID"
}

function formatDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

export function VerificationDocumentsTable({
  documents,
  empty,
  labels,
  locale,
}: {
  documents: VerificationDocumentRow[]
  empty: string
  labels: PortalTableLabels
  locale: string
}) {
  const t = useTranslations()
  const rows = useMemo(
    () =>
      documents.map((item) => ({
        id: item.id,
        title: item.originalName,
        documentTypeLabel: item.documentType?.replaceAll("_", " ") ?? "-",
        statusLabel: item.status,
        statusText: item.status.replaceAll("_", " "),
        expiresAtLabel: item.expiresAt
          ? formatDate(item.expiresAt, locale)
          : "-",
        createdAtLabel: formatDate(item.createdAt, locale),
        statuses: [
          item.documentType ?? "",
          item.status,
          expiryState(item.expiresAt),
        ],
        actions: <DocumentLink assetId={item.id} label={item.originalName} />,
      })),
    [documents, locale],
  )

  return (
    <PortalDataTable
      empty={empty}
      labels={labels}
      filters={<VerificationDocumentFilterSummary documents={documents} />}
      columns={[
        {
          id: "document",
          header: t("dashboard.documents.document"),
          className: "min-w-[260px]",
          render: (row) => (
            <div className="flex items-center gap-3">
              <div className="border-primary/10 bg-primary/8 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl border">
                <FileText className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {row.title}
                </p>
                <p className="text-muted-foreground mt-1 text-xs capitalize">
                  {String(row.documentTypeLabel ?? "-").toLowerCase()}
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "status",
          header: t("dashboard.table.status"),
          render: (row) => (
            <StatusBadge
              status={String(row.statusLabel ?? "UPLOADED")}
              label={String(row.statusText ?? row.statusLabel ?? "-")}
            />
          ),
        },
        {
          id: "expiry",
          header: t("dashboard.documents.expires"),
          render: (row) => (
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {String(row.expiresAtLabel ?? "-")}
            </span>
          ),
        },
        {
          id: "uploaded",
          header: t("dashboard.documents.uploaded"),
          render: (row) => (
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {String(row.createdAtLabel ?? "-")}
            </span>
          ),
        },
        {
          id: "actions",
          header: t("dashboard.table.actions"),
          cellClassName: "w-[1%] whitespace-nowrap",
          render: (row) => row.actions,
        },
      ]}
      rows={rows}
    />
  )
}

function VerificationDocumentFilterSummary({
  documents,
}: {
  documents: VerificationDocumentRow[]
}) {
  const t = useTranslations()
  const typeCount = new Set(
    documents
      .map((item) => item.documentType)
      .filter((value): value is string => Boolean(value)),
  ).size
  const expiringCount = documents.filter(
    (item) => expiryState(item.expiresAt) === "EXPIRING_SOON",
  ).length
  const expiredCount = documents.filter(
    (item) => expiryState(item.expiresAt) === "EXPIRED",
  ).length
  const reviewCount = documents.filter((item) =>
    ["AWAITING_REVIEW", "PENDING", "SUBMITTED", "UNDER_REVIEW"].includes(
      item.status,
    ),
  ).length
  const items = [
    { label: t("dashboard.documents.total"), value: documents.length },
    { label: t("dashboard.documents.types"), value: typeCount },
    { label: t("dashboard.documents.inReview"), value: reviewCount },
    { label: t("dashboard.documents.expiringSoon"), value: expiringCount },
    { label: t("dashboard.documents.expired"), value: expiredCount },
  ]
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-border/80 bg-card rounded-xl border px-3.5 py-3 shadow-[var(--shadow-xs)]"
        >
          <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-[0.05em] uppercase">
            {item.label}
          </p>
          <p className="text-foreground mt-1 text-lg leading-none font-bold tabular-nums">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
