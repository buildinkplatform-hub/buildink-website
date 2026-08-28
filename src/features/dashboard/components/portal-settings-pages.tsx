import { getTranslations } from "next-intl/server"

import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { PortalSupportCenter } from "@/features/dashboard/components/portal-support-center"
import { SettingsModuleClient } from "@/features/dashboard/components/portal-settings-support"
import {
  getPortalNotificationPreferences,
  getPortalSupportTicket,
  listPortalSupportTickets,
} from "@/features/dashboard/data/portal-client"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"

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
  const resolvedId = query?.id ?? detailId
  if (resolvedId) {
    const ticket = await getPortalSupportTicket(resolvedId).catch(
      () => undefined,
    )
    return <PortalSupportCenter detailId={resolvedId} initialTicket={ticket} />
  }

  const page = Math.max(1, Number(query?.page ?? 1) || 1)
  const tickets = await listPortalSupportTickets(page).catch(() => undefined)
  return <PortalSupportCenter initialTickets={tickets} initialPage={page} />
}
