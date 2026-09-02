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
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="space-y-5">
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
        icon={<FolderKanban className="size-4.5" />}
        label={labels.active}
        value={
          projects.filter((item) =>
            ["PUBLISHED", "IN_PROGRESS", "ON_HOLD"].includes(item.status),
          ).length
        }
      />
      <StatCard
        icon={<Send className="size-4.5" />}
        label={labels.published}
        value={projects.filter((item) => item.status === "PUBLISHED").length}
      />
      <StatCard
        icon={<Play className="size-4.5" />}
        label={labels.inProgress}
        value={projects.filter((item) => item.status === "IN_PROGRESS").length}
      />
      <StatCard
        icon={<Banknote className="size-4.5" />}
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
    <Card className="group hover:border-primary/15 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] motion-reduce:hover:translate-y-0">
      <CardContent className="flex min-h-[108px] items-start justify-between gap-4 pt-5 sm:pt-5">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold">{label}</p>
          <p className="text-brand-navy mt-1.5 truncate text-[1.65rem] leading-8 font-bold tracking-[-0.03em] tabular-nums">
            {value}
          </p>
        </div>
        <span className="border-primary/10 bg-primary/8 text-primary grid size-10 shrink-0 place-items-center rounded-xl border">
          {icon}
        </span>
      </CardContent>
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
    <Card className="overflow-hidden">
      <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(18rem,1fr)_11rem_11rem_auto] lg:items-center">
        <label className="relative min-w-0">
          <span className="sr-only">{labels.search}</span>
          <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={labels.search}
            className="bg-background ps-10 shadow-none"
          />
        </label>
        <FilterSelect
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
          label={labels.sortNewest}
          value={filters.sort}
          onValueChange={(value) => onUpdate({ sort: value })}
          options={[
            { value: "newest", label: labels.sortNewest },
            { value: "title", label: labels.sortTitle },
          ]}
        />
        <Button
          type="button"
          variant="secondary"
          className="justify-self-start lg:justify-self-end"
          onClick={() => downloadProjectsCsv(projects)}
        >
          <Download className="size-4" aria-hidden="true" />
          {labels.export}
        </Button>
      </div>

      <div className="border-border/70 border-t bg-slate-50/55 px-4 py-3.5 sm:px-5 dark:bg-white/[0.02]">
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <SlidersHorizontal
            className="text-primary size-3.5"
            aria-hidden="true"
          />
          Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto] xl:items-center">
          <FilterSelect
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
          <DatePicker
            id="project-list-deadline-from"
            value={filters.deadlineFrom}
            onChange={(value) => onUpdate({ deadlineFrom: value })}
            placeholder={labels.deadlineFrom}
          />
          <DatePicker
            id="project-list-deadline-to"
            value={filters.deadlineTo}
            onChange={(value) => onUpdate({ deadlineTo: value })}
            placeholder={labels.deadlineTo}
            fromDate={
              filters.deadlineFrom ? new Date(filters.deadlineFrom) : undefined
            }
          />
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger/5 hover:text-danger justify-self-start"
              onClick={onClearAll}
            >
              <X className="size-4" aria-hidden="true" />
              {labels.clearAll}
            </Button>
          ) : null}
        </div>
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
      <SelectTrigger
        aria-label={label}
        className={cn("bg-background w-full shadow-none", className)}
      >
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
      <Card className="grid min-h-64 place-items-center border-dashed p-8 text-center shadow-none">
        <div className="max-w-sm">
          <span className="border-primary/10 bg-primary/8 text-primary mx-auto mb-4 grid size-11 place-items-center rounded-xl border">
            <Inbox className="size-5" aria-hidden="true" />
          </span>
          <h3 className="text-brand-navy font-semibold">{empty}</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="border-border/90 bg-card hidden overflow-hidden rounded-2xl border shadow-[var(--shadow-xs)] md:block">
        <div className="portal-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1160px] text-start text-sm">
            <thead className="border-border/70 border-b bg-slate-50/80 dark:bg-white/[0.025]">
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
                    className="text-muted-foreground h-11 px-4 text-start align-middle text-[11px] font-semibold tracking-[0.035em] whitespace-nowrap uppercase last:sticky last:end-0 last:z-10 last:bg-slate-50 sm:px-5 dark:last:bg-[#101e31]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card [&_tr:last-child]:border-0">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-border/60 border-b transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.035]"
                >
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <ProjectIdentity project={project} />
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <span
                      className="block max-w-44 truncate font-medium"
                      title={ownerLabel(project)}
                    >
                      {ownerLabel(project)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <StatusBadge
                      status={project.status}
                      label={labelize(project.status)}
                    />
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <span className="block max-w-40 truncate">
                      {project.locationLabel ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <span className="whitespace-nowrap tabular-nums">
                      {formatMoney(
                        project.budgetMinor,
                        project.currency,
                        locale,
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(project.deadlineAt, locale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle sm:px-5">
                    <span className="tabular-nums">{project.packageCount}</span>
                  </td>
                  <td className="bg-card sticky end-0 z-10 px-4 py-3 align-middle sm:px-5">
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
          className="rounded-none border-x-0 border-b-0 shadow-none"
          labels={labels}
          onPageChange={onPageChange}
          pageInfo={pageInfo}
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 shadow-none">
            <div className="flex items-start gap-3">
              <ProjectAvatar title={project.title} />
              <div className="min-w-0 flex-1">
                <Link
                  className="text-brand-navy font-semibold hover:underline"
                  href={portalDetailPath("projects", project.id)}
                >
                  {project.title}
                </Link>
                <p className="text-muted-foreground mt-1 text-xs">
                  {ownerLabel(project)} · {project.locationLabel ?? "-"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={project.status}
                    label={labelize(project.status)}
                  />
                  <span className="text-xs font-semibold tabular-nums">
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
        "border-border/70 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-slate-50/55 px-4 py-3 sm:px-5 dark:bg-white/[0.02]",
        className,
      )}
    >
      <p className="text-muted-foreground text-xs">{labels.totalRecords}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="border-border/70 bg-card text-muted-foreground hidden rounded-lg border px-3 py-2 text-xs font-medium sm:inline-flex">
          {pageInfo.pageSize} rows
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((page, index) => (
            <span key={page} className="contents">
              {index > 0 && page - pageNumbers[index - 1]! > 1 ? (
                <span className="text-muted-foreground px-1">…</span>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant={page === currentPage ? "primary" : "ghost"}
                className="size-8 min-h-0 rounded-md px-0 text-xs"
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </span>
          ))}
        </div>
        <span className="text-muted-foreground min-w-14 text-center text-xs tabular-nums sm:hidden">
          {currentPage} / {pageCount}
        </span>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-9 min-h-0 rounded-lg px-0"
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
          className="size-9 min-h-0 rounded-lg px-0"
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
          className="text-muted-foreground truncate text-xs"
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
      className="border-primary/10 bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
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
            variant="ghost"
            className="size-9 min-h-9 rounded-lg"
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
