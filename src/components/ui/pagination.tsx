import { ChevronLeft, ChevronRight } from "lucide-react"

import { Link } from "@/i18n/navigation"
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
}: {
  items: PaginationItem[]
  previousHref?: string
  nextHref?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm" disabled={!previousHref}>
        {previousHref ? (
          <Link href={previousHref}>
            <ChevronLeft className="size-4 rtl:rotate-180" />
            Previous
          </Link>
        ) : (
          <span>
            <ChevronLeft className="size-4 rtl:rotate-180" />
            Previous
          </span>
        )}
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold ${
                item.active
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-white text-brand-navy hover:bg-light-blue"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              className="border-line inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-white px-4 text-sm font-semibold text-brand-navy"
            >
              {item.label}
            </span>
          ),
        )}
      </div>
      <Button asChild variant="secondary" size="sm" disabled={!nextHref}>
        {nextHref ? (
          <Link href={nextHref}>
            Next
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        ) : (
          <span>
            Next
            <ChevronRight className="size-4 rtl:rotate-180" />
          </span>
        )}
      </Button>
    </div>
  )
}
