import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PortalInlineAlert } from "@/features/dashboard/components/portal-form-layout"
import { PortalPageHeader } from "@/features/dashboard/components/portal-page-header"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import { VerificationDocumentsTable } from "@/features/dashboard/components/verification-documents-table"
import { VerificationRequirements } from "@/features/dashboard/components/verification-requirements"
import { VerificationSubmitClient } from "@/features/dashboard/components/verification-submit-client"
import {
  getPortalVerification,
  getPortalVerificationStatus,
} from "@/features/dashboard/data/portal-client"
import { Link } from "@/i18n/navigation"

function humanize(value?: string | null) {
  if (!value) return "-"
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase())
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

function statusTitle(
  status: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  const key = status.toUpperCase()
  if (["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(key)) {
    return t("dashboard.verification.statusTitles.PENDING")
  }
  if (key === "CHANGES_REQUESTED") {
    return t("dashboard.verification.statusTitles.CHANGES_REQUESTED")
  }
  if (["VERIFIED", "APPROVED"].includes(key)) {
    return t("dashboard.verification.statusTitles.VERIFIED")
  }
  if (key === "REJECTED") {
    return t("dashboard.verification.statusTitles.REJECTED")
  }
  if (key === "EXPIRED") return t("dashboard.verification.statusTitles.EXPIRED")
  return t("dashboard.verification.statusTitles.NOT_SUBMITTED")
}

function statusBody(
  status: string,
  blocked: boolean,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  const key = status.toUpperCase()
  if (["SUBMITTED", "PENDING", "UNDER_REVIEW"].includes(key)) {
    return t("dashboard.verification.statusBodies.PENDING")
  }
  if (key === "CHANGES_REQUESTED") {
    return t("dashboard.verification.statusBodies.CHANGES_REQUESTED")
  }
  if (["VERIFIED", "APPROVED"].includes(key)) {
    return t("dashboard.verification.statusBodies.VERIFIED")
  }
  if (key === "REJECTED")
    return t("dashboard.verification.statusBodies.REJECTED")
  if (key === "EXPIRED") return t("dashboard.verification.statusBodies.EXPIRED")
  return blocked
    ? t("dashboard.verification.statusBodies.BLOCKED")
    : t("dashboard.verification.statusBodies.READY")
}

export async function PortalVerificationPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const [overview, status] = await Promise.all([
    getPortalVerification().catch(() => null),
    getPortalVerificationStatus().catch(() => null),
  ])

  if (!overview && !status) {
    return (
      <div className="w-full space-y-6">
        <PortalPageHeader
          title={t("dashboard.nav.verification")}
          description={t("dashboard.descriptions.verification")}
          breadcrumbs={[
            { label: t("common.dashboard"), href: "/dashboard" },
            { label: t("dashboard.nav.verification") },
          ]}
        />
        <Card className="border-dashed p-6">
          <p className="text-muted-foreground text-sm">
            {t("dashboard.bootstrapUnavailable")}
          </p>
        </Card>
      </div>
    )
  }

  const statusValue =
    status?.submission?.status ??
    status?.verificationStatus ??
    overview?.submission?.status ??
    overview?.verificationStatus ??
    "NOT_SUBMITTED"
  const inReview = ["SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(
    statusValue.toUpperCase(),
  )
  const terminal = ["VERIFIED", "APPROVED", "REJECTED", "EXPIRED"].includes(
    statusValue.toUpperCase(),
  )
  const requirements = overview?.requirements ?? []
  const requiredCount = requirements.filter((item) => item.required).length
  const fulfilledRequiredCount = requirements.filter(
    (item) => item.required && item.uploaded,
  ).length
  const documents = status?.documents ?? []
  const blockedReasons: string[] = []

  if (!requirements.length && !overview?.submission) {
    blockedReasons.push(t("dashboard.verification.blocked.noPolicy"))
  }
  if (!documents.length) {
    blockedReasons.push(t("dashboard.verification.blocked.noDocuments"))
  }
  if (overview?.missingRequired.length) {
    blockedReasons.push(t("onboarding.errors.requiredDocuments"))
  }
  if (inReview)
    blockedReasons.push(t("dashboard.verification.blocked.inReview"))
  if (
    terminal &&
    statusValue.toUpperCase() !== "REJECTED" &&
    statusValue.toUpperCase() !== "EXPIRED"
  ) {
    blockedReasons.push(t("dashboard.verification.blocked.terminal"))
  }

  const latestDecision = status?.submission?.decisions[0]
  const tableLabels = {
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

  return (
    <div className="w-full space-y-6">
      <PortalPageHeader
        title={t("dashboard.nav.verification")}
        description={t("dashboard.descriptions.verification")}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/dashboard" },
          { label: t("dashboard.nav.verification") },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#071A33,#0D4E66)] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl min-w-0">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={statusValue}
                  label={humanize(statusValue)}
                />
                {overview?.primaryAccountType ? (
                  <StatusBadge
                    status="ACTIVE"
                    label={humanize(overview.primaryAccountType)}
                  />
                ) : null}
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] sm:text-2xl">
                {statusTitle(statusValue, t)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                {statusBody(statusValue, blockedReasons.length > 0, t)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm sm:min-w-44">
              <p className="text-xs text-white/60">
                {t("dashboard.verification.progress.latestDecision")}
              </p>
              <p className="mt-1 font-semibold">
                {latestDecision
                  ? humanize(latestDecision.decision)
                  : humanize(statusValue)}
              </p>
              {status?.submission?.submittedAt ? (
                <p className="mt-1.5 text-xs text-white/60">
                  {formatDate(status.submission.submittedAt, locale)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
          {[
            {
              label: t("dashboard.trust.accountType"),
              value: humanize(overview?.primaryAccountType),
            },
            {
              label: t("dashboard.verification.progress.policy"),
              value:
                overview?.submission?.policyName ??
                (requirements.length
                  ? t("dashboard.verification.progress.activePolicy")
                  : "-"),
            },
            {
              label: t("dashboard.verification.progress.required"),
              value: `${fulfilledRequiredCount}/${requiredCount}`,
            },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3.5 sm:px-5">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.05em] uppercase">
                {item.label}
              </p>
              <p className="text-foreground mt-1 truncate text-base font-bold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-primary text-[10px] font-bold tracking-[0.06em] uppercase">
              {t("dashboard.verification.next.title")}
            </p>
            <p className="text-foreground mt-1.5 text-base font-semibold">
              {inReview
                ? t("dashboard.verification.next.wait")
                : status?.openIssues.length
                  ? t("dashboard.verification.next.resolveIssues")
                  : blockedReasons.length
                    ? t("dashboard.verification.next.upload")
                    : ["VERIFIED", "APPROVED"].includes(
                          statusValue.toUpperCase(),
                        )
                      ? t("dashboard.verification.next.verified")
                      : t("dashboard.verification.next.submit")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/profile?tab=documents">
                {t("dashboard.verification.manageDocuments")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/support">
                {t("dashboard.nav.support")}
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {requirements.length ? (
        <Card className="p-5">
          <VerificationRequirements requirements={requirements} />
        </Card>
      ) : null}

      {status?.openIssues.length ? (
        <PortalInlineAlert
          tone="warning"
          title={t("dashboard.verification.openIssues")}
        >
          <div className="mt-1 grid gap-2">
            {status.openIssues.map((issue) => (
              <div
                key={issue.id}
                className="border-warning/20 bg-card rounded-xl border p-3"
              >
                <p className="text-foreground font-semibold">{issue.title}</p>
                {issue.description ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {issue.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </PortalInlineAlert>
      ) : null}

      {status?.submission?.decisions.length ? (
        <Card className="overflow-hidden">
          <div className="bg-muted/18 border-b px-4 py-3.5 sm:px-5">
            <h2 className="text-foreground text-base font-semibold">
              {t("dashboard.verification.decisions")}
            </h2>
          </div>
          <div className="divide-border/70 divide-y">
            {status.submission.decisions.map((decision) => (
              <div key={decision.id} className="px-4 py-3.5 text-sm sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-foreground font-semibold">
                    {humanize(decision.decision)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(decision.createdAt, locale)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {t("dashboard.verification.reviewer")}: {decision.reviewer}
                </p>
                {decision.reason ? (
                  <p className="text-foreground mt-2 leading-6">
                    {decision.reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {status ? (
        <Card className="p-5">
          <VerificationSubmitClient
            disabledReasons={blockedReasons}
            documentIds={documents.map((item) => item.id)}
            fulfilledRequiredCount={fulfilledRequiredCount}
            issueCount={status.openIssues.length}
            requiredCount={requiredCount}
          />
        </Card>
      ) : null}

      {status ? (
        <VerificationDocumentsTable
          documents={documents}
          empty={t("dashboard.documentsEmpty")}
          labels={tableLabels}
          locale={locale}
        />
      ) : null}
    </div>
  )
}
