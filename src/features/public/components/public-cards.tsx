import { ArrowRight, Building2, Globe, MapPin, ShieldCheck, Star } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PublicEntityVisual } from "@/features/public/components/public-visuals"
import { Link } from "@/i18n/navigation"
import type {
  PublicArticle,
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
    <Card className="directory-card overflow-hidden rounded-[30px] border-white/70 p-4 shadow-[var(--shadow-card)]">
      <PublicEntityVisual module={item.module} title={item.title} />
      <div className="mt-5 flex items-start gap-4">
        <Avatar name={item.title} className="size-14 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{item.verification}</Badge>
          </div>
          <h3 className="text-brand-navy mt-3 text-xl font-bold">{item.title}</h3>
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
            className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-brand-navy"
          >
            {category}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.contact.website ? (
            <>
              <Globe className="size-4 text-primary" />
              <span className="truncate">
                {item.contact.website.replace(/^https?:\/\//, "")}
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4 text-primary" />
              <span>{item.verification}</span>
            </>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {item.metrics.slice(0, 3).map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f6f9ff_100%)] p-3"
          >
            <p className="text-brand-navy text-sm font-bold">{metric.value}</p>
            <p className="text-muted mt-1 text-xs leading-5">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted inline-flex items-center gap-2 text-xs font-medium">
          <Building2 className="size-4 text-primary" />
          {item.tags.slice(0, 2).join(" • ")}
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={href}>
            {actionLabel}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}

export function PublicArticleCard({
  article,
  href,
  actionLabel,
}: {
  article: PublicArticle | PublicHelpArticle
  href: string
  actionLabel: string
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-white/70 p-0 shadow-[var(--shadow-card)]">
      <PublicEntityVisual
        module="companies"
        title={article.title}
        className="h-44 rounded-none border-0"
        compact
      />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{article.category}</Badge>
          <span className="text-muted text-xs">{article.updatedAt}</span>
        </div>
        <h3 className="text-brand-navy mt-4 text-xl font-bold">{article.title}</h3>
        <p className="text-muted mt-3 text-sm leading-7">{article.excerpt}</p>
        {"author" in article ? (
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            <Star className="size-4 text-primary" />
            <span>{article.author}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
        ) : null}
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link href={href}>
              {actionLabel}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
