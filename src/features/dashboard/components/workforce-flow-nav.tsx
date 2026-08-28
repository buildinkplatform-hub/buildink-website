import {
  Banknote,
  BriefcaseBusiness,
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  UserRoundCheck,
} from "lucide-react"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

const companySteps = [
  {
    key: "overview",
    label: "Overview",
    detail: "Demand and workforce health",
    href: "/dashboard/workforce",
    icon: LayoutDashboard,
  },
  {
    key: "hiring",
    label: "Hiring",
    detail: "Requests and applicants",
    href: "/dashboard/opportunities?kind=WORKFORCE_REQUEST",
    icon: UserRoundCheck,
  },
  {
    key: "attendance",
    label: "Attendance",
    detail: "Presence and exceptions",
    href: "/dashboard/operations/attendance",
    icon: CalendarCheck2,
  },
  {
    key: "tasks",
    label: "Tasks",
    detail: "Assignments and delivery",
    href: "/dashboard/operations/tasks",
    icon: ClipboardList,
  },
  {
    key: "payroll",
    label: "Payroll",
    detail: "Review and approval",
    href: "/dashboard/operations/payroll",
    icon: Banknote,
  },
] as const

const workerSteps = [
  {
    key: "overview",
    label: "My workforce",
    detail: "Profile and work status",
    href: "/dashboard/workforce",
    icon: LayoutDashboard,
  },
  {
    key: "attendance",
    label: "Attendance",
    detail: "Check in and shift status",
    href: "/dashboard/operations/attendance",
    icon: CalendarCheck2,
  },
  {
    key: "availability",
    label: "Availability",
    detail: "Preferred and blocked dates",
    href: "/dashboard/workforce#availability",
    icon: BriefcaseBusiness,
  },
  {
    key: "tasks",
    label: "Tasks",
    detail: "Current assignments",
    href: "/dashboard/operations/tasks",
    icon: ClipboardList,
  },
  {
    key: "payroll",
    label: "Pay",
    detail: "Operational pay status",
    href: "/dashboard/operations/payroll",
    icon: Banknote,
  },
] as const

export function WorkforceFlowNav({
  audience,
  active = "overview",
}: {
  audience: "company" | "worker"
  active?: string
}) {
  const steps = audience === "worker" ? workerSteps : companySteps

  return (
    <section
      aria-label="Workforce workflow"
      className="bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-sm"
    >
      <div className="bg-muted/15 flex flex-col gap-2 border-b px-4 py-4 sm:px-5">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
          Workforce flow
        </p>
        <p className="text-muted-foreground text-sm">
          Move between hiring, attendance, assigned work and pay without losing
          context.
        </p>
      </div>
      <div className="bg-border/70 grid gap-px sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon
          const selected = active === step.key
          return (
            <Link
              key={step.key}
              href={step.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "group bg-card focus-visible:ring-ring relative flex min-h-24 items-start gap-3 p-4 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none",
                selected ? "bg-primary/8" : "hover:bg-muted/35",
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  selected
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-background group-hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-semibold">
                    {step.label}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-semibold tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="text-muted-foreground mt-1 block text-xs leading-5">
                  {step.detail}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
