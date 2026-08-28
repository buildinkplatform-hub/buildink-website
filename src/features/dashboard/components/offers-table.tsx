"use client"

import type { ReactNode } from "react"

import {
  PortalDataTable,
  type PortalTableColumn,
  type PortalTableLabels,
  type PortalTableRow,
} from "@/features/dashboard/components/portal-data-table"
import { StatusBadge } from "@/features/dashboard/components/status-badge"

export type OfferTableRow = PortalTableRow & {
  amount: string
  status: string
  statusLabel?: string
  reference?: string
  inbox?: string
  submitted?: string
  revisions?: number
  actions?: ReactNode
}

/**
 * Keeps table render callbacks inside a client component. Server components
 * may pass rows and action slots, but must not pass callback props across the
 * React Server Component boundary.
 */
export function OffersTable({
  rows,
  empty,
  labels,
  offerLabel,
  amountLabel,
}: {
  rows: OfferTableRow[]
  empty: string
  labels: PortalTableLabels
  offerLabel: string
  amountLabel: string
}) {
  const columns: PortalTableColumn[] = [
    {
      id: "offer",
      header: offerLabel,
      render: (row) => (
        <div>
          <p className="text-brand-navy font-semibold">{row.title}</p>
          <p className="text-muted text-xs">{String(row.secondary ?? "")}</p>
        </div>
      ),
    },
    {
      id: "reference",
      header: labels.reference ?? "Reference",
      render: (row) => (
        <span className="text-muted font-mono text-xs">
          {String(row.reference ?? "-")}
        </span>
      ),
    },
    {
      id: "amount",
      header: amountLabel,
      render: (row) => (
        <span className="font-medium">{String(row.amount)}</span>
      ),
    },
    {
      id: "inbox",
      header: labels.direction ?? "Direction",
      render: (row) => (
        <span className="text-sm">{String(row.inbox ?? "-")}</span>
      ),
    },
    {
      id: "submitted",
      header: labels.submitted ?? "Submitted",
      render: (row) => (
        <span className="text-muted text-sm whitespace-nowrap">
          {String(row.submitted ?? "-")}
        </span>
      ),
    },
    {
      id: "revisions",
      header: labels.revisions ?? "Revisions",
      render: (row) => (
        <span className="font-medium">{String(row.revisions ?? 0)}</span>
      ),
    },
    {
      id: "status",
      header: labels.status,
      render: (row) => (
        <StatusBadge
          status={String(row.status)}
          label={
            typeof row.statusLabel === "string"
              ? row.statusLabel
              : String(row.status)
          }
        />
      ),
    },
    {
      id: "actions",
      header: labels.actions,
      className:
        "sticky end-0 z-20 min-w-24 bg-slate-50/95 shadow-[-10px_0_12px_-12px_rgba(15,23,42,0.35)]",
      cellClassName:
        "sticky end-0 z-10 min-w-24 bg-white shadow-[-10px_0_12px_-12px_rgba(15,23,42,0.35)]",
      render: (row) => <div className="flex justify-end">{row.actions}</div>,
    },
  ]

  return (
    <PortalDataTable
      empty={empty}
      labels={labels}
      columns={columns}
      rows={rows}
      showFooter
      tableClassName="min-w-[1180px]"
      attachedFooter
    />
  )
}
