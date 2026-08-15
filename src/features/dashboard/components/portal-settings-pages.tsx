import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PortalDataTable,
  type PortalTableLabels,
} from "@/features/dashboard/components/portal-data-table"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import {
  SettingsModuleClient,
  SupportConversation,
  SupportTicketCreateForm,
} from "@/features/dashboard/components/portal-settings-support"
import {
  getPortalNotificationPreferences,
  getPortalSupportTicket,
  listPortalSupportTickets,
} from "@/features/dashboard/data/portal-client"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import { Link } from "@/i18n/navigation"

function tableLabels(
  t: Awaited<ReturnType<typeof getTranslations>>,
): PortalTableLabels {
  return {
    search: t("dashboard.table.search"),
    status: t("dashboard.table.status"),
    allStatuses: t("dashboard.table.allStatuses"),
    sort: t("dashboard.table.sort"),
    newest: t("dashboard.table.newest"),
    titleAsc: t("dashboard.table.titleAsc"),
    details: t("dashboard.table.details"),
    actions: t("dashboard.table.actions"),
    previous: t("dashboard.table.previous"),
    next: t("dashboard.table.next"),
    showing: t("dashboard.table.showing"),
  }
}

export async function SettingsModulePage() {
  const t = await getTranslations()
  const preferences = await getPortalNotificationPreferences().catch(() => null)
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.settings")}
        description={t("dashboard.descriptions.settings")}
      />
      <SettingsModuleClient preferences={preferences} />
    </div>
  )
}

export async function SupportModulePage({
  detailId,
  query,
}: {
  detailId?: string
  query?: PortalQuery
}) {
  const t = await getTranslations()
  const resolvedId = query?.id ?? detailId
  if (resolvedId) {
    const ticket = await getPortalSupportTicket(resolvedId)
    return (
      <div className="w-full space-y-6">
        {ticket ? (
          <>
            <PortalPageHeader
              eyebrow={t("common.dashboard")}
              title={ticket.subject}
              description={ticket.reference}
              actions={
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/support">
                    {t("dashboard.support.back")}
                  </Link>
                </Button>
              }
            />
            <Card className="rounded-[28px] border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
                <span>{ticket.status}</span>
                <span>{ticket.priority}</span>
                <span>{ticket.slaState}</span>
              </div>
            </Card>
            <SupportConversation
              ticketId={ticket.id}
              messages={ticket.messages ?? []}
            />
          </>
        ) : (
          <>
            <PortalPageHeader
              eyebrow={t("common.dashboard")}
              title={t("dashboard.nav.support")}
              description={t("dashboard.descriptions.support")}
            />
            <p className="text-muted">{t("dashboard.support.notFound")}</p>
          </>
        )}
      </div>
    )
  }

  const tickets = await listPortalSupportTickets()
  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        eyebrow={t("common.dashboard")}
        title={t("dashboard.nav.support")}
        description={t("dashboard.descriptions.support")}
      />
      <SupportTicketCreateForm />
      <PortalDataTable
        empty={t("dashboard.support.empty")}
        labels={tableLabels(t)}
        columns={[
          {
            id: "ticket",
            header: "Ticket",
            className: "min-w-[280px]",
            render: (row) => (
              <div className="space-y-1">
                <p className="font-semibold text-brand-navy">{row.title}</p>
                <p className="text-xs text-muted">{String(row.reference ?? "-")}</p>
              </div>
            ),
          },
          {
            id: "status",
            header: "Status",
            render: (row) => String(row.statusLabel ?? "-"),
          },
          {
            id: "priority",
            header: "Priority",
            render: (row) => String(row.priorityLabel ?? "-"),
          },
          {
            id: "sla",
            header: "SLA",
            render: (row) => String(row.slaLabel ?? "-"),
          },
          {
            id: "actions",
            header: "Actions",
            cellClassName: "w-[1%] whitespace-nowrap",
            render: (row) =>
              row.detailHref ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={String(row.detailHref)}>{tableLabels(t).details}</Link>
                </Button>
              ) : null,
          },
        ]}
        rows={tickets.items.map((item) => ({
          id: item.id,
          title: item.subject,
          reference: item.reference,
          statusLabel: item.status.replaceAll("_", " "),
          priorityLabel: item.priority.replaceAll("_", " "),
          slaLabel: item.slaState.replaceAll("_", " "),
          secondary: item.reference,
          statuses: [item.status, item.priority, item.slaState],
          detailHref: `/dashboard/support/${item.id}`,
        }))}
      />
    </div>
  )
}
