import Image from "next/image"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import type { PublicModule } from "@/features/public/types/public.types"

function visualConfig(module: PublicModule) {
  switch (module) {
    case "companies":
    case "profiles":
    case "suppliers":
    case "equipment":
      return {
        src: "/branding/company-visual.png",
        objectPosition: "56% 42%",
        overlay: "from-brand-navy/70 via-brand-navy/20 to-transparent",
      }
    case "projects":
    case "tenders":
    case "opportunities-companies":
    case "opportunities-workers":
      return {
        src: "/branding/hero-construction-marketplace.png",
        objectPosition: "72% 48%",
        overlay: "from-brand-navy/65 via-brand-navy/15 to-transparent",
      }
  }
}

export function PublicEntityVisual({
  module,
  title,
  className,
  compact = false,
}: {
  module: PublicModule
  title: string
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
      <Image
        src={visual.src}
        alt={title}
        fill
        className="object-cover"
        style={{ objectPosition: visual.objectPosition }}
        unoptimized
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-tr",
          visual.overlay,
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />
    </div>
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
          <p className="text-muted mt-1 text-xs font-medium leading-5">
            {item.label}
          </p>
        </div>
      ))}
    </Card>
  )
}
