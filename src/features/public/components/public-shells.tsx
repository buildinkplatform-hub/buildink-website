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
    <main id="main-content">
      {hero}
      <div className="space-y-16 py-16 sm:space-y-20 sm:py-20">{children}</div>
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
    <section className={cn("page-container", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-brand-navy mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-muted mt-4 text-base leading-7 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
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
    <main id="main-content" className="page-container py-10 sm:py-12">
      {header}
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {filters}
          {sidebar}
        </aside>
        <div>{children}</div>
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
    <main id="main-content" className="page-container py-10 sm:py-12">
      {hero}
      {tabs ? <div className="mt-6">{tabs}</div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">{children}</div>
        {aside ? <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
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
    <main id="main-content" className="page-container py-10 sm:py-12">
      {hero}
      <div className={cn("mt-8 grid gap-8", aside && "lg:grid-cols-[minmax(0,1fr)_280px]")}>
        <div className="space-y-6">{children}</div>
        {aside ? <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
      </div>
    </main>
  )
}
