import Image from "next/image"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import type { PublicMediaAsset } from "@/features/public/types/public.types"
import type { PublicModule } from "@/features/public/types/public.types"

function visualConfig(module: PublicModule) {
  switch (module) {
    case "companies":
    case "project-owners":
    case "subcontractors":
    case "service-providers":
    case "workers":
    case "equipment":
      return {
        overlay: "from-brand-navy/70 via-brand-navy/20 to-transparent",
      }
    case "projects":
    case "tenders":
    case "opportunities":
      return {
        overlay: "from-brand-navy/65 via-brand-navy/15 to-transparent",
      }
  }
}

export function PublicEntityVisual({
  module,
  title,
  imageUrl,
  className,
  compact = false,
}: {
  module: PublicModule
  title: string
  imageUrl?: string | null
  className?: string
  compact?: boolean
}) {
  const visual = visualConfig(module)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/50 bg-[linear-gradient(135deg,#d8e7ff_0%,#f6f9ff_55%,#fff_100%)]",
        compact ? "h-32" : "h-56 sm:h-64",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes={compact ? "64px" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_20%,rgba(23,107,255,.24),transparent_38%),linear-gradient(145deg,#eef4ff,#dbe7f8)]"
          role="img"
          aria-label={title}
        >
          <span
            className="border-brand-blue/20 text-brand-navy grid size-16 place-items-center rounded-2xl border bg-white/70 text-2xl font-bold shadow-sm"
            aria-hidden="true"
          >
            {title.trim().charAt(0).toUpperCase() || "B"}
          </span>
        </div>
      )}
      <div
        className={cn("absolute inset-0 bg-gradient-to-tr", visual.overlay)}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />
    </div>
  )
}

export function selectPrimaryVisual(item: {
  coverUrl?: string | null
  logoUrl?: string | null
  avatarUrl?: string | null
  gallery?: PublicMediaAsset[]
}) {
  return (
    item.coverUrl ??
    item.gallery?.[0]?.url ??
    item.logoUrl ??
    item.avatarUrl ??
    null
  )
}

export function PublicMetricStrip({
  items,
  className,
}: {
  items: Array<{ label: string; value: string }>
  className?: string
}) {
  return (
    <Card
      className={cn(
        "grid gap-3 rounded-[28px] border-white/70 bg-white/95 p-3 shadow-[var(--shadow-card)] sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f6f9ff_100%)] px-4 py-3"
        >
          <p className="text-brand-navy text-2xl font-bold">{item.value}</p>
          <p className="text-muted mt-1 text-xs leading-5 font-medium">
            {item.label}
          </p>
        </div>
      ))}
    </Card>
  )
}
