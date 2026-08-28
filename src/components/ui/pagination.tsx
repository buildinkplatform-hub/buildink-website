import { ChevronLeft, ChevronRight } from "lucide-react"

import { IntentPrefetchLink } from "@/components/shared/intent-prefetch-link"
import { Button } from "@/components/ui/button"

export interface PaginationItem {
  label: string
  href?: string
  active?: boolean
}

export function Pagination({
  items,
  previousHref,
  nextHref,
  previousLabel = "Previous",
  nextLabel = "Next",
  ariaLabel = "Pagination",
}: {
  items: PaginationItem[]
  previousHref?: string
  nextHref?: string
  previousLabel?: string
  nextLabel?: string
  ariaLabel?: string
}) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm" disabled={!previousHref}>
        {previousHref ? (
          <IntentPrefetchLink href={previousHref} prefetchOnRender>
            <ChevronLeft className="size-4 rtl:rotate-180" />
            {previousLabel}
          </IntentPrefetchLink>
        ) : (
          <span>
            <ChevronLeft className="size-4 rtl:rotate-180" />
            {previousLabel}
          </span>
        )}
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) =>
          item.href ? (
            <IntentPrefetchLink
              key={`${item.label}-${index}`}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold ${
                item.active
                  ? "border-primary bg-primary text-white"
                  : "border-line text-brand-navy hover:bg-accent bg-white"
              }`}
            >
              {item.label}
            </IntentPrefetchLink>
          ) : (
            <span
              key={`${item.label}-${index}`}
              aria-hidden={item.label === "…" ? true : undefined}
              className="border-line text-brand-navy inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-white px-4 text-sm font-semibold"
            >
              {item.label}
            </span>
          ),
        )}
      </div>
      <Button asChild variant="secondary" size="sm" disabled={!nextHref}>
        {nextHref ? (
          <IntentPrefetchLink href={nextHref} prefetchOnRender>
            {nextLabel}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </IntentPrefetchLink>
        ) : (
          <span>
            {nextLabel}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </span>
        )}
      </Button>
    </nav>
  )
}
