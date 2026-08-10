import { ChevronRight } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="text-muted flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-navy font-semibold">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
