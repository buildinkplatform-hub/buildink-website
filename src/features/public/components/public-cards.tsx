import {
  ArrowRight,
  Building2,
  Globe,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react"

import { IntentPrefetchLink } from "@/components/shared/intent-prefetch-link"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PublicEntityVisual,
  selectPrimaryVisual,
} from "@/features/public/components/public-visuals"
import type {
  PublicEntityRecord,
  PublicHelpArticle,
} from "@/features/public/types/public.types"

export function PublicEntityCard({
  item,
  href,
  actionLabel,
}: {
  item: PublicEntityRecord
  href: string
  actionLabel: string
}) {
  return (
    <Card className="directory-card group overflow-hidden rounded-[28px] border-white/80 bg-white/92 p-4 shadow-[var(--shadow-card)]">
      <div className="overflow-hidden rounded-[22px]">
        <PublicEntityVisual
          module={item.module}
          title={item.title}
          imageUrl={selectPrimaryVisual(item)}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>

      <div className="mt-5 flex items-start gap-4">
        <Avatar
          name={item.title}
          src={item.avatarUrl ?? item.logoUrl ?? item.coverUrl}
          className="ring-primary/8 size-14 rounded-2xl ring-4"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{item.verification}</Badge>
          </div>
          <h3 className="text-brand-navy group-hover:text-primary mt-3 text-xl font-bold tracking-[-0.025em] transition-colors">
            {item.title}
          </h3>
          <p className="text-muted mt-1 text-sm font-medium">{item.subtitle}</p>
        </div>
      </div>

      <p className="text-muted mt-4 line-clamp-3 text-sm leading-7">
        {item.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.categories.slice(0, 3).map((category) => (
          <span
            key={category}
            className="border-primary/10 bg-primary/[0.045] text-brand-navy rounded-full border px-3 py-1.5 text-xs font-semibold"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="text-muted mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="bg-canvas/75 flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5">
          <MapPin className="text-primary size-4 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="bg-canvas/75 flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5">
          {item.contact.website ? (
            <>
              <Globe className="text-primary size-4 shrink-0" />
              <span className="truncate">
                {item.contact.website.replace(/^https?:\/\//, "")}
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="text-primary size-4 shrink-0" />
              <span className="truncate">{item.verification}</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {item.metrics.slice(0, 3).map((metric) => (
          <div
            key={metric.label}
            className="border-line/70 rounded-xl border bg-[linear-gradient(180deg,#fff_0%,#f7faff_100%)] p-3.5"
          >
            <p className="text-brand-navy text-sm font-bold">{metric.value}</p>
            <p className="text-muted mt-1 text-xs leading-5">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="border-line/65 mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted inline-flex min-w-0 items-center gap-2 text-xs font-medium">
          <Building2 className="text-primary size-4 shrink-0" />
          <span className="truncate">{item.tags.slice(0, 2).join(" • ")}</span>
        </div>
        <Button asChild className="w-full sm:w-auto" size="sm">
          <IntentPrefetchLink href={href}>
            {actionLabel}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </IntentPrefetchLink>
        </Button>
      </div>
    </Card>
  )
}

export function PublicArticleCard({
  article,
  href,
  actionLabel,
  imageUrl,
}: {
  article: PublicHelpArticle & { author?: string; readingTime?: string }
  href: string
  actionLabel: string
  imageUrl?: string | null
}) {
  return (
    <Card className="directory-card group overflow-hidden rounded-[28px] border-white/80 bg-white/94 p-0 shadow-[var(--shadow-card)]">
      <div className="overflow-hidden">
        <PublicEntityVisual
          module="companies"
          title={article.title}
          imageUrl={imageUrl}
          className="h-48 rounded-none border-0 transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          compact
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{article.category}</Badge>
          <span className="text-muted text-xs">{article.updatedAt}</span>
        </div>
        <h3 className="text-brand-navy group-hover:text-primary mt-4 text-xl font-bold tracking-[-0.025em] transition-colors">
          {article.title}
        </h3>
        <p className="text-muted mt-3 line-clamp-3 text-sm leading-7">
          {article.excerpt}
        </p>
        {"author" in article ? (
          <div className="text-muted mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Star className="text-primary size-4" />
            <span>{article.author}</span>
            <span className="text-line">•</span>
            <span>{article.readingTime}</span>
          </div>
        ) : null}
        <div className="border-line/65 mt-5 border-t pt-4">
          <Button asChild variant="secondary" size="sm">
            <IntentPrefetchLink href={href}>
              {actionLabel}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </IntentPrefetchLink>
          </Button>
        </div>
      </div>
    </Card>
  )
}
