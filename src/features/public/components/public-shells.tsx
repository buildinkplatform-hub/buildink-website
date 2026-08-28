import type { ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export function PublicLandingShell({
  hero,
  children,
}: {
  hero: ReactNode
  children: ReactNode
}) {
  return (
    <main id="main-content" className="bg-background relative overflow-hidden">
      <div className="section-grid pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70" />
      <div className="relative">{hero}</div>
      <div className="relative space-y-20 py-18 sm:space-y-24 sm:py-24 lg:space-y-28 lg:py-28">
        {children}
      </div>
    </main>
  )
}

export function PublicPageSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("page-container scroll-mt-28", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-primary border-primary/10 bg-primary/5 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-brand-navy mt-4 text-3xl font-bold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
          {title}
        </h2>
        {description ? (
          <p className="text-muted mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-9 sm:mt-10">{children}</div>
    </section>
  )
}

export function DirectoryShell({
  header,
  filters,
  children,
  sidebar,
}: {
  header: ReactNode
  filters: ReactNode
  children: ReactNode
  sidebar?: ReactNode
}) {
  return (
    <main id="main-content" className="page-container py-8 sm:py-10 lg:py-12">
      <div className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-7">
        {header}
      </div>
      <div className="mt-7 grid min-w-0 gap-7 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          {filters}
          {sidebar}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  )
}

export function EntityDetailShell({
  hero,
  tabs,
  children,
  aside,
}: {
  hero: ReactNode
  tabs?: ReactNode
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <main id="main-content" className="page-container py-8 sm:py-10 lg:py-12">
      <div className="overflow-hidden rounded-[30px] border border-white/75 bg-white/65 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-6">
        {hero}
      </div>
      {tabs ? (
        <div className="glass-panel mt-6 overflow-x-auto rounded-2xl p-2">
          {tabs}
        </div>
      ) : null}
      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">{children}</div>
        {aside ? (
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
            {aside}
          </aside>
        ) : null}
      </div>
    </main>
  )
}

export function ContentShell({
  hero,
  children,
  aside,
}: {
  hero: ReactNode
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <main id="main-content" className="page-container py-8 sm:py-10 lg:py-12">
      <div className="rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-7">
        {hero}
      </div>
      <div
        className={cn(
          "mt-8 grid min-w-0 gap-8",
          aside && "lg:grid-cols-[minmax(0,1fr)_300px]",
        )}
      >
        <div className="min-w-0 space-y-6">{children}</div>
        {aside ? (
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
            {aside}
          </aside>
        ) : null}
      </div>
    </main>
  )
}
