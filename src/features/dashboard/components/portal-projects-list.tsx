"use client"

import {
  Archive,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FolderKanban,
  Inbox,
  MoreHorizontal,
  Play,
  RotateCcw,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ReasonConfirmationDialog,
  type ReasonedAction,
} from "@/components/feedback/reason-confirmation-dialog"
import {
  archiveProjectAction,
  publishProjectAction,
  transitionProjectAction,
} from "@/features/dashboard/actions/portal.actions"
import { StatusBadge } from "@/features/dashboard/components/status-badge"
import type {
  PortalPageInfo,
  PortalProject,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"
import {
  hasPortalPermission,
  type CompanyPermission,
} from "@/features/dashboard/lib/portal-permissions"
import {
  portalDetailPath,
  portalEditPath,
} from "@/features/dashboard/config/portal-routes"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

const projectStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
  "ARCHIVED",
]

type ProjectListLabels = {
  stats: {
    active: string
    published: string
    inProgress: string
    portfolioValue: string
  }
  toolbar: {
    search: string
    allStatuses: string
    allCategories: string
    allLocations: string
    allTags: string
    deadlineFrom: string
    deadlineTo: string
    sortNewest: string
    sortTitle: string
    clearAll: string
    export: string
  }
  table: {
    project: string
    owner: string
    status: string
    location: string
    budget: string
    deadline: string
    packages: string
    actions: string
    details: string
    edit: string
    actionsFor: string
    confirmTitle: string
    confirmDescription: string
    reasonLabel: string
    reasonPlaceholder: string
    cancel: string
    processing: string
    statuses: Record<string, string>
    previous: string
    next: string
    totalRecords: string
  }
}

export function PortalProjectsList({
  categories,
  cities,
  empty,
  labels,
  locale,
  pageInfo,
  permissions,
  projects,
  tags,
}: {
  categories: PortalTaxonomyItem[]
  cities: PortalTaxonomyItem[]
  empty: string
  labels: ProjectListLabels
  locale: string
  pageInfo: PortalPageInfo
  permissions: readonly string[]
  projects: PortalProject[]
  tags: PortalTaxonomyItem[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [queryDraft, setQueryDraft] = useState(searchParams.get("q") ?? "")

  const filters = {
    status: searchParams.get("status") ?? "all",
    categoryId: searchParams.get("categoryId") ?? "all",
    cityId: searchParams.get("cityId") ?? "all",
    tagId: searchParams.get("tagId") ?? "all",
    deadlineFrom: searchParams.get("deadlineFrom") ?? "",
    deadlineTo: searchParams.get("deadlineTo") ?? "",
    sort: searchParams.get("sort") ?? "newest",
  }
  const hasActiveFilters =
    queryDraft.trim() ||
    Object.values(filters).some(
      (value) => value && value !== "all" && value !== "newest",
    )

  function updateUrl(updates: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || value === "newest") next.delete(key)
      else next.set(key, String(value))
    }
    if (!("page" in updates)) next.delete("page")
    const suffix = next.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? ""
    if (queryDraft === current) return
    const timeout = setTimeout(() => {
      updateUrl({ q: queryDraft.trim() || undefined })
    }, 350)
    return () => clearTimeout(timeout)
    // updateUrl intentionally uses the current URL snapshot when debounce fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDraft, searchParams])

  const rows = useMemo(
    () =>
      [...projects].sort((a, b) =>
        filters.sort === "title"
          ? a.title.localeCompare(b.title)
          : +new Date(b.updatedAt ?? b.createdAt ?? 0) -
            +new Date(a.updatedAt ?? a.createdAt ?? 0),
      ),
    [filters.sort, projects],
  )

  return (
    <div className="space-y-6">
      <ProjectStats labels={labels.stats} locale={locale} projects={projects} />
      <ProjectToolbar
        categories={categories}
        cities={cities}
        filters={filters}
        hasActiveFilters={Boolean(hasActiveFilters)}
        labels={labels.toolbar}
        locale={locale}
        onClearAll={() => {
          setQueryDraft("")
          router.replace(pathname, { scroll: false })
        }}
        onSearch={setQueryDraft}
        onUpdate={updateUrl}
        projects={rows}
        query={queryDraft}
        tags={tags}
      />
      <ProjectsTable
        empty={empty}
        labels={labels.table}
        locale={locale}
        onPageChange={(page) => updateUrl({ page })}
        pageInfo={pageInfo}
        permissions={permissions}
        projects={rows}
      />
    </div>
  )
}

function ProjectStats({
  labels,
  locale,
  projects,
}: {
  labels: ProjectListLabels["stats"]
  locale: string
  projects: PortalProject[]
}) {
  const portfolioValue = projects.reduce(
    (sum, item) => sum + Number(item.budgetMinor ?? 0),
    0,
  )
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<FolderKanban className="size-5" />}
        label={labels.active}
        value={
          projects.filter((item) =>
            ["PUBLISHED", "IN_PROGRESS", "ON_HOLD"].includes(item.status),
          ).length
        }
      />
      <StatCard
        icon={<Send className="size-5" />}
        label={labels.published}
        value={projects.filter((item) => item.status === "PUBLISHED").length}
      />
      <StatCard
        icon={<Play className="size-5" />}
        label={labels.inProgress}
        value={projects.filter((item) => item.status === "IN_PROGRESS").length}
      />
      <StatCard
        icon={<Banknote className="size-5" />}
        label={labels.portfolioValue}
        value={formatMoney(
          String(portfolioValue),
          projects[0]?.currency,
          locale,
        )}
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <Card className="rounded-lg p-5">
      <div className="flex items-center gap-4">
        <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-muted text-xs font-medium">{label}</p>
          <p className="text-brand-navy truncate text-2xl font-bold tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </Card>
  )
}

function ProjectToolbar({
  categories,
  cities,
  filters,
  hasActiveFilters,
  labels,
  locale,
  onClearAll,
  onSearch,
  onUpdate,
  projects,
  query,
  tags,
}: {
  categories: PortalTaxonomyItem[]
  cities: PortalTaxonomyItem[]
  filters: {
    status: string
    categoryId: string
    cityId: string
    tagId: string
    deadlineFrom: string
    deadlineTo: string
    sort: string
  }
  hasActiveFilters: boolean
  labels: ProjectListLabels["toolbar"]
  locale: string
  onClearAll: () => void
  onSearch: (value: string) => void
  onUpdate: (updates: Record<string, string | number | undefined>) => void
  projects: PortalProject[]
  query: string
  tags: PortalTaxonomyItem[]
}) {
  return (
    <Card className="rounded-2xl">
      <div className="flex flex-wrap gap-3 p-4">
        <label className="relative min-w-full sm:min-w-72 sm:flex-1 lg:max-w-96">
          <span className="sr-only">{labels.search}</span>
          <Search className="text-muted pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={labels.search}
            className="bg-white ps-9"
          />
        </label>
        <FilterSelect
          className="w-full sm:w-40"
          label={labels.allStatuses}
          value={filters.status}
          onValueChange={(value) => onUpdate({ status: value })}
          options={[
            { value: "all", label: labels.allStatuses },
            ...projectStatuses.map((value) => ({
              value,
              label: labelize(value),
            })),
          ]}
        />
        <FilterSelect
          className="w-full sm:w-44"
          label={labels.allCategories}
          value={filters.categoryId}
          onValueChange={(value) => onUpdate({ categoryId: value })}
          options={[
            { value: "all", label: labels.allCategories },
            ...categories.map((item) => ({
              value: item.id,
              label: taxonomyLabel(item, locale),
            })),
          ]}
        />
        <FilterSelect
          className="w-full sm:w-44"
          label={labels.allLocations}
          value={filters.cityId}
          onValueChange={(value) => onUpdate({ cityId: value })}
          options={[
            { value: "all", label: labels.allLocations },
            ...cities.map((item) => ({
              value: item.id,
              label: taxonomyLabel(item, locale),
            })),
          ]}
        />
        <FilterSelect
          className="w-full sm:w-44"
          label={labels.allTags}
          value={filters.tagId}
          onValueChange={(value) => onUpdate({ tagId: value })}
          options={[
            { value: "all", label: labels.allTags },
            ...tags.map((item) => ({
              value: item.id,
              label: taxonomyLabel(item, locale),
            })),
          ]}
        />
        <span className="w-full sm:w-40">
          <DatePicker
            id="project-list-deadline-from"
            value={filters.deadlineFrom}
            onChange={(value) => onUpdate({ deadlineFrom: value })}
            placeholder={labels.deadlineFrom}
          />
        </span>
        <span className="w-full sm:w-40">
          <DatePicker
            id="project-list-deadline-to"
            value={filters.deadlineTo}
            onChange={(value) => onUpdate({ deadlineTo: value })}
            placeholder={labels.deadlineTo}
            fromDate={
              filters.deadlineFrom ? new Date(filters.deadlineFrom) : undefined
            }
          />
        </span>
        <FilterSelect
          className="w-full sm:w-40"
          label={labels.sortNewest}
          value={filters.sort}
          onValueChange={(value) => onUpdate({ sort: value })}
          options={[
            { value: "newest", label: labels.sortNewest },
            { value: "title", label: labels.sortTitle },
          ]}
        />
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="secondary"
            className="border-danger/40 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
            onClick={onClearAll}
          >
            <X className="size-4" />
            {labels.clearAll}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => downloadProjectsCsv(projects)}
        >
          <Download className="size-4" />
          {labels.export}
        </Button>
      </div>
    </Card>
  )
}

function FilterSelect({
  className,
  label,
  onValueChange,
  options,
  value,
}: {
  className?: string
  label: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  value: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className={cn("bg-white", className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ProjectsTable({
  empty,
  labels,
  locale,
  onPageChange,
  pageInfo,
  permissions,
  projects,
}: {
  empty: string
  labels: ProjectListLabels["table"]
  locale: string
  onPageChange: (page: number) => void
  pageInfo: PortalPageInfo
  permissions: readonly string[]
  projects: PortalProject[]
}) {
  if (!projects.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center">
        <div>
          <Inbox className="text-muted mx-auto mb-3 size-8" />
          <h3 className="text-brand-navy font-semibold">{empty}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border-line/70 hidden overflow-hidden rounded-2xl border bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-start text-sm">
            <thead className="border-line/70 border-b bg-slate-50/80">
              <tr>
                {[
                  labels.project,
                  labels.owner,
                  labels.status,
                  labels.location,
                  labels.budget,
                  labels.deadline,
                  labels.packages,
                  labels.actions,
                ].map((header) => (
                  <th
                    key={header}
                    className="text-muted h-12 px-5 text-start align-middle text-xs font-semibold whitespace-nowrap last:sticky last:end-0 last:z-10 last:bg-slate-50 last:shadow-[-10px_0_10px_-10px_rgba(16,24,40,0.18)] rtl:last:shadow-[10px_0_10px_-10px_rgba(16,24,40,0.18)]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white [&_tr:last-child]:border-0">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-line/60 border-b transition-colors hover:bg-slate-50/70 [&:hover_td:last-child]:bg-slate-50"
                >
                  <td className="px-5 py-4 align-middle">
                    <ProjectIdentity project={project} />
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className="block max-w-44 truncate font-medium"
                      title={ownerLabel(project)}
                    >
                      {ownerLabel(project)}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="whitespace-nowrap">
                      <StatusBadge
                        status={project.status}
                        label={labelize(project.status)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className="block max-w-40 truncate">
                      {project.locationLabel ?? "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className="whitespace-nowrap tabular-nums">
                      {formatMoney(
                        project.budgetMinor,
                        project.currency,
                        locale,
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className="text-muted text-xs whitespace-nowrap">
                      {formatDate(project.deadlineAt, locale)}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className="tabular-nums">{project.packageCount}</span>
                  </td>
                  <td className="sticky end-0 z-10 bg-white px-5 py-4 align-middle shadow-[-10px_0_10px_-10px_rgba(16,24,40,0.18)] rtl:shadow-[10px_0_10px_-10px_rgba(16,24,40,0.18)]">
                    <ProjectActionsMenu
                      labels={labels}
                      permissions={permissions}
                      project={project}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ProjectTablePagination
          className="border-x-0 border-b-0 shadow-none"
          labels={labels}
          onPageChange={onPageChange}
          pageInfo={pageInfo}
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {projects.map((project) => (
          <Card key={project.id} className="rounded-2xl p-4 shadow-none">
            <div className="flex items-start gap-3">
              <ProjectAvatar title={project.title} />
              <div className="min-w-0 flex-1">
                <Link
                  className="text-brand-navy font-semibold hover:underline"
                  href={portalDetailPath("projects", project.id)}
                >
                  {project.title}
                </Link>
                <p className="text-muted mt-1 text-xs">
                  {ownerLabel(project)} / {project.locationLabel ?? "-"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={project.status}
                    label={labelize(project.status)}
                  />
                  <span className="text-xs font-semibold">
                    {formatMoney(project.budgetMinor, project.currency, locale)}
                  </span>
                </div>
              </div>
              <ProjectActionsMenu
                labels={labels}
                permissions={permissions}
                project={project}
              />
            </div>
          </Card>
        ))}
      </div>

      <ProjectTablePagination
        className="md:hidden"
        labels={labels}
        onPageChange={onPageChange}
        pageInfo={pageInfo}
      />
    </div>
  )
}

function ProjectTablePagination({
  className,
  labels,
  onPageChange,
  pageInfo,
}: {
  className?: string
  labels: ProjectListLabels["table"]
  onPageChange: (page: number) => void
  pageInfo: PortalPageInfo
}) {
  const pageCount = Math.max(1, Math.ceil(pageInfo.total / pageInfo.pageSize))
  const currentPage = Math.min(Math.max(1, pageInfo.page), pageCount)
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(
      (page) =>
        page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1,
    )
    .slice(0, 5)

  return (
    <div
      className={cn(
        "border-line/70 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-slate-50/70 px-4 py-3 sm:px-5",
        className,
      )}
    >
      <p className="text-muted text-xs">{labels.totalRecords}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="border-line/70 text-muted hidden rounded-xl border bg-white px-3 py-2 text-xs font-medium sm:inline-flex">
          {pageInfo.pageSize} rows
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((page, index) => (
            <span key={page} className="contents">
              {index > 0 && page - pageNumbers[index - 1]! > 1 ? (
                <span className="text-muted px-1">...</span>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant={page === currentPage ? "primary" : "secondary"}
                className="size-9 min-h-0 px-0"
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </span>
          ))}
        </div>
        <span className="text-muted text-xs tabular-nums sm:hidden">
          {currentPage} / {pageCount}
        </span>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-9 min-h-0 px-0"
          disabled={currentPage === 1}
          aria-label={labels.previous}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-9 min-h-0 px-0"
          disabled={!pageInfo.hasNextPage}
          aria-label={labels.next}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  )
}

function ProjectIdentity({ project }: { project: PortalProject }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProjectAvatar title={project.title} />
      <div className="max-w-60 min-w-0">
        <Link
          className="text-brand-navy block truncate font-semibold hover:underline"
          href={portalDetailPath("projects", project.id)}
          title={project.title}
        >
          {project.title}
        </Link>
        <p
          className="text-muted truncate text-xs"
          title={project.reference ?? ""}
        >
          {project.reference || "-"}
        </p>
      </div>
    </div>
  )
}

function ProjectAvatar({ title }: { title: string }) {
  return (
    <span
      aria-hidden
      className="bg-primary/10 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
    >
      {getInitials(title)}
    </span>
  )
}

const projectTransitions: Record<string, string[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED", "ARCHIVED"],
  PENDING_REVIEW: ["DRAFT", "PUBLISHED", "CANCELLED", "ARCHIVED"],
  PUBLISHED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED", "ARCHIVED"],
  IN_PROGRESS: ["ON_HOLD", "COMPLETED", "CANCELLED", "ARCHIVED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
}

const permissionByTransition: Record<string, string> = {
  PUBLISHED: "projects.publish",
  ARCHIVED: "projects.archive",
}

function ProjectActionsMenu({
  labels,
  permissions,
  project,
}: {
  labels: ProjectListLabels["table"]
  permissions: readonly string[]
  project: PortalProject
}) {
  const router = useRouter()
  const canEdit = hasPortalPermission(permissions, "projects.edit")
  const canViewMenu =
    canEdit ||
    hasPortalPermission(permissions, "projects.view") ||
    hasPortalPermission(permissions, "projects.publish") ||
    hasPortalPermission(permissions, "projects.archive")
  const transitions = (projectTransitions[project.status] ?? []).filter(
    (next) =>
      hasPortalPermission(
        permissions,
        (permissionByTransition[next] ?? "projects.edit") as CompanyPermission,
      ),
  )
  const [action, setAction] = useState<ReasonedAction | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  async function confirmStatusChange(status: string, reason: string) {
    if (!project.version) return
    setPending(true)
    setMessage(undefined)
    const result =
      status === "PUBLISHED"
        ? await publishProjectAction(project.id, project.version)
        : status === "ARCHIVED"
          ? await archiveProjectAction(project.id, project.version)
          : await transitionProjectAction(project.id, {
              status: status as
                | "DRAFT"
                | "IN_PROGRESS"
                | "COMPLETED"
                | "ON_HOLD"
                | "CANCELLED"
                | "ARCHIVED",
              reason: reason.trim() || undefined,
              version: project.version,
            })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      throw new Error(result.message)
    }
    router.refresh()
  }

  if (!canViewMenu) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            disabled={pending}
            aria-label={labels.actionsFor.replace("{title}", project.title)}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={portalDetailPath("projects", project.id)}>
              <Eye className="size-4" />
              {labels.details}
            </Link>
          </DropdownMenuItem>
          {canEdit ? (
            <DropdownMenuItem asChild>
              <Link href={portalEditPath("projects", project.id)}>
                <Edit3 className="size-4" />
                {labels.edit}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {transitions.length ? <DropdownMenuSeparator /> : null}
          {transitions.map((status) => (
            <DropdownMenuItem
              key={status}
              className={
                ["CANCELLED", "ARCHIVED"].includes(status)
                  ? "text-danger focus:text-danger"
                  : undefined
              }
              onSelect={() => {
                setMessage(undefined)
                setAction({
                  title: labels.confirmTitle.replace(
                    "{action}",
                    statusActionLabel(status, labels),
                  ),
                  description: labels.confirmDescription
                    .replace("{title}", project.title)
                    .replace("{from}", labelize(project.status))
                    .replace("{to}", labelize(status)),
                  confirmLabel: statusActionLabel(status, labels),
                  cancelLabel: labels.cancel,
                  destructive: ["CANCELLED", "ARCHIVED"].includes(status),
                  pendingLabel: labels.processing,
                  reasonLabel: labels.reasonLabel,
                  reasonPlaceholder: labels.reasonPlaceholder,
                  requireReason: ["CANCELLED", "ARCHIVED"].includes(status),
                  onConfirm: (reason) => confirmStatusChange(status, reason),
                })
              }}
            >
              <StatusActionIcon status={status} />
              {statusActionLabel(status, labels)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReasonConfirmationDialog
        action={action}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      >
        {message ? <p className="text-danger text-sm">{message}</p> : null}
      </ReasonConfirmationDialog>
    </>
  )
}

function statusActionLabel(status: string, labels: ProjectListLabels["table"]) {
  return labels.statuses[status] ?? labelize(status)
}

function StatusActionIcon({ status }: { status: string }) {
  if (status === "ARCHIVED") return <Archive className="size-4" />
  if (status === "DRAFT") return <RotateCcw className="size-4" />
  if (status === "CANCELLED") return <XCircle className="size-4" />
  return <Play className="size-4" />
}

function ownerLabel(project: PortalProject) {
  return (
    project.ownerLabel ??
    project.ownerCompanyName ??
    project.ownerProfileName ??
    "-"
  )
}

function taxonomyLabel(item: PortalTaxonomyItem, locale: string) {
  if (item.name) return item.name
  if (item.label) return item.label
  if (item.translations && typeof item.translations === "object") {
    const translations = item.translations as Record<string, unknown>
    const translated = translations[locale] ?? translations.en
    if (typeof translated === "string") return translated
    if (translated && typeof translated === "object" && "name" in translated) {
      return String((translated as { name: unknown }).name)
    }
  }
  return item.slug ?? item.id
}

function labelize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

function formatMoney(
  minor: string | null | undefined,
  currency: string | null | undefined,
  locale: string,
) {
  if (!minor) return "-"
  const amount = Number(minor) / 100
  if (!Number.isFinite(amount)) return "-"
  if (!currency) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      amount,
    )
  }
  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function downloadProjectsCsv(projects: PortalProject[]) {
  const rows = projects.map((item) => ({
    reference: item.reference ?? "",
    title: item.title,
    owner: ownerLabel(item),
    status: item.status,
    publicationStatus: item.publicationStatus,
    budgetMinor: item.budgetMinor ?? "",
    currency: item.currency ?? "",
    deadline: item.deadlineAt ?? "",
    packages: item.packageCount,
  }))
  const headers = Object.keys(
    rows[0] ?? {
      reference: "",
      title: "",
      owner: "",
      status: "",
      publicationStatus: "",
      budgetMinor: "",
      currency: "",
      deadline: "",
      packages: "",
    },
  )
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header as keyof typeof row] ?? "")
          return `"${value.replaceAll('"', '""')}"`
        })
        .join(","),
    ),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "projects.csv"
  anchor.click()
  URL.revokeObjectURL(url)
}
