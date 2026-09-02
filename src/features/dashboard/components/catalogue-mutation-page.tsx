import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import {
  CatalogueForm,
  type CatalogueFormInitial,
} from "@/features/dashboard/components/catalogue-form"
import { PermissionDeniedState } from "@/features/dashboard/components/permission-guard"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import type { PortalQuery } from "@/features/dashboard/components/portal-directory-modules"
import {
  getPortalCatalogue,
  listPortalTaxonomy,
  type PortalBootstrap,
} from "@/features/dashboard/data/portal-client"
import { getActiveCompanyId } from "@/features/dashboard/lib/active-workspace"

export async function CatalogueMutationPage({
  query,
  bootstrap,
}: {
  query: PortalQuery
  bootstrap: PortalBootstrap | null
}) {
  const t = await getTranslations()
  const companyId = getActiveCompanyId(bootstrap?.workspaces)

  if (!companyId) return <PermissionDeniedState />

  // Categories enhance the form but are not required to create or edit an
  // offering. A transient taxonomy failure must not make the whole mutation
  // route look dead.
  const categories = await listPortalTaxonomy("categories").catch(() => ({
    items: [],
  }))
  const editing = query.action === "edit"
  const detail =
    editing && query.id
      ? await getPortalCatalogue(companyId, query.id).catch(() => null)
      : null

  if (editing && (!query.id || !detail)) notFound()

  const title = editing
    ? t("dashboard.edit.catalogueTitle")
    : t("dashboard.publish.catalogueTitle")

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title={title}
        description={t("dashboard.descriptions.catalogue")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          {
            label: t("dashboard.nav.catalogue"),
            href: "/dashboard/catalogue",
          },
          ...(editing && detail
            ? [
                {
                  label: detail.name,
                  href: `/dashboard/catalogue/${detail.id}`,
                },
              ]
            : []),
          {
            label: editing
              ? t("dashboard.chrome.edit")
              : t("dashboard.chrome.create"),
          },
        ]}
      />
      <div className="max-w-5xl">
        <CatalogueForm
          mode={editing ? "edit" : "create"}
          companyId={companyId}
          categories={categories.items}
          initial={
            editing && detail
              ? (detail as unknown as CatalogueFormInitial)
              : undefined
          }
        />
      </div>
    </div>
  )
}
