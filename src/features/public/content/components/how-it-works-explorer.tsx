"use client"

import { useState } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileSearch,
  HardHat,
  Landmark,
  Search,
  ShieldCheck,
  Users2,
  Wrench,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

const roles = [
  {
    key: "projectOwner",
    href: "/projects",
    icon: Landmark,
  },
  {
    key: "company",
    href: "/companies",
    icon: Building2,
  },
  {
    key: "subcontractor",
    href: "/opportunities",
    icon: HardHat,
  },
  {
    key: "serviceProvider",
    href: "/service-providers",
    icon: Wrench,
  },
  {
    key: "worker",
    href: "/opportunities/workers",
    icon: BriefcaseBusiness,
  },
] as const

const coreActions = [
  { href: "/search", labelKey: "search", icon: Search },
  { href: "/companies", labelKey: "companies", icon: Building2 },
  { href: "/projects", labelKey: "projects", icon: Landmark },
  { href: "/tenders", labelKey: "tenders", icon: FileSearch },
  { href: "/workers", labelKey: "workers", icon: Users2 },
  { href: "/verification", labelKey: "verification", icon: ShieldCheck },
] as const

type RoleKey = (typeof roles)[number]["key"]

export function HowItWorksExplorer() {
  const t = useTranslations("trustPages.howItWorks")
  const common = useTranslations("trustPages.common")
  const publicSite = useTranslations("publicSite")
  const [activeRole, setActiveRole] = useState<RoleKey>("projectOwner")
  const active = roles.find((role) => role.key === activeRole) ?? roles[0]
  const ActiveIcon = active.icon

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[32px] border-white/70 p-0 shadow-[var(--shadow-card)]">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="border-b border-slate-200/70 bg-slate-50/80 p-4 lg:border-e lg:border-b-0 lg:p-5">
            <div
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
              role="tablist"
              aria-label={t("journeyTitle")}
            >
              {roles.map((role) => {
                const Icon = role.icon
                const selected = role.key === activeRole
                return (
                  <button
                    key={role.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveRole(role.key)}
                    className={cn(
                      "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-start text-sm font-semibold transition",
                      selected
                        ? "border-primary/20 text-brand-navy bg-white shadow-sm"
                        : "text-muted hover:text-brand-navy border-transparent hover:border-slate-200 hover:bg-white/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        selected
                          ? "bg-primary text-white"
                          : "text-brand-navy bg-slate-200/70",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    {t(`roles.${role.key}.label`)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="bg-primary/5 pointer-events-none absolute -end-20 -top-20 size-72 rounded-full blur-3xl" />
            <div className="section-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
            <div className="relative">
              <div className="bg-primary/8 text-primary flex size-14 items-center justify-center rounded-2xl">
                <ActiveIcon className="size-6" />
              </div>
              <p className="text-primary mt-6 text-xs font-bold tracking-[0.18em] uppercase">
                {t(`roles.${active.key}.label`)}
              </p>
              <h3 className="text-brand-navy mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {t("journeyTitle")}
              </h3>
              <p className="text-muted mt-4 max-w-2xl text-base leading-8">
                {t(`roles.${active.key}.summary`)}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={active.href}>
                    {t(`roles.${active.key}.cta`)}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/register">{common("createAccount")}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/login">{common("signIn")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coreActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="group-hover:border-primary/20 flex h-full items-center gap-4 rounded-[22px] border-white/70 p-4 shadow-[var(--shadow-sm)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-card)]">
                <span className="bg-primary/8 text-primary group-hover:bg-primary flex size-10 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-brand-navy block truncate text-sm font-bold">
                    {publicSite(`nav.items.${action.labelKey}`)}
                  </span>
                </span>
                <ArrowRight className="text-muted group-hover:text-primary size-4 shrink-0 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
